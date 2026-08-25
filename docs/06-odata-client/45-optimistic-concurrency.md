---
id: optimistic-concurrency
title: Optimistic Concurrency
sidebar_position: 45
---

# Optimistic Concurrency

Some resources may only be changed by a client that can prove it knows the current state. The service
hands out an **ETag** when the resource is read, and demands it back in an `If-Match` header on every
write. If somebody else has written in the meantime the ETag no longer matches, and the write is refused
instead of silently overwriting their change.

`odata2ts` does this for you: reading a resource remembers its ETag, and writing to it sends the header.

```ts
// the read remembers the ETag
await service.Copies(id).query().execute();

// the write sends it back as `If-Match`
await service.Copies(id).patch({ Condition: 7 }).execute();
```

## When it applies

Only where the service says so. A resource is treated as concurrency-controlled when its entity set or
singleton carries the `Core.OptimisticConcurrency` annotation:

```xml
<Annotations Target="Library.Service.EntityContainer/Copies">
  <Annotation Term="Core.OptimisticConcurrency">
    <Collection />
  </Annotation>
</Annotations>
```

The annotation may name the properties the ETag is computed from, or — as above — nothing at all. Both
are enough: the value always arrives in the response, so the client never needs the property name.

**In OData V2** there is no such annotation. The concurrency token is part of the schema language
instead, as `ConcurrencyMode="Fixed"` on the property. `odata2ts` reads that and treats the entity sets
of that type exactly the same way.

An `ETag` header on its own is deliberately _not_ enough. The specification is explicit that a service may
hand one out purely for caching ([OData V4.01 Part 1,
§11.4.1.1](https://docs.oasis-open.org/odata/odata/v4.01/os/part1-protocol/odata-v4.01-os-part1-protocol.html#sec_UseofETagsforAvoidingUpdateConflicts)),
so sending `If-Match` for every resource that ever showed one would turn writes that succeed today into
conflicts.

## Reading fills the store

Both a single read and a collection read do it:

```ts
// one read of the list is enough to write to any row of it
const copies = await service.Copies().query().execute();
await service.Copies(copies.data.value[0].Id).patch({ Condition: 7 }).execute();
```

A `create` stores the ETag of the entity it just created, so a newly created resource is writable straight
away.

## Writing again

A write that answers `204 No Content` without stating a new ETag makes the old one stale, so it is
forgotten. Writing a second time without reading again therefore fails — deliberately, because the client
can no longer prove anything about the current state:

```ts
await service.Copies(id).patch({ Condition: 7 }).execute();
await service.Copies(id).patch({ Condition: 8 }).execute(); // ODataConcurrencyError
```

Ask for the entity back and both the data and the ETag are fresh in one round trip:

```ts
await service.Copies(id).patch<true>({ Condition: 7 }).execute();
```

## When no ETag is known

`ODataConcurrencyError` is thrown **before** the request is sent — the service would answer `428
Precondition Required` and change nothing, so the round trip has nothing to offer. The message names the
resource and the ways forward.

### State the ETag yourself

Useful when your application keeps its own state, or after a page reload:

```ts
await service.Copies(id).patch({ Condition: 7 }).withETag(etag).execute();
```

This works whether or not anything was read, and whatever the metadata says about the resource.

### Write regardless

`If-Match: *` means "apply this whatever the current state is". Services may reject it.

```ts
await service.Copies(id).patch({ Condition: 7 }).ignoreETag().execute();
```

### …or for every write

`blindConcurrencyWrites` on the HTTP client makes an unknown ETag resolve to `*` instead of failing. This
is last-write-wins on purpose — for data imports and scripts, not for user-facing writes:

```ts
const client = new FetchClient(undefined, { blindConcurrencyWrites: true });
```

## Handling a conflict

A `412 Precondition Failed` means somebody else wrote first. It arrives as the error your HTTP client
throws — it is deliberately not wrapped, so your existing error handling still recognises it — and
`isConcurrencyConflict` identifies it:

```ts
import { isConcurrencyConflict } from "@odata2ts/odata-service";

try {
  await service.Copies(id).patch({ Condition: 7 }).execute();
} catch (error) {
  if (isConcurrencyConflict(error)) {
    // re-read, merge, and decide what should win
  }
  throw error;
}
```

Resolving the conflict is your application's business: only it knows whether the other change may be
overwritten, and `odata2ts` will not guess.

`isConcurrencyRequired` is the other half, for `428`. Reaching it means the service demands ETags without
announcing them — the one case `odata2ts` cannot detect from the metadata.

## Bringing your own store

By default the client keeps the ETags in memory, bounded at 10 000 resources. Supply a
`ConcurrencyHandler` to bound it differently, or to survive a page reload:

```ts
const client = new FetchClient(undefined, { concurrencyHandler: myHandler });
```

## Switching it off

`annotations.disableOptimisticConcurrency` in the generator configuration stops the evaluation entirely.
No `If-Match` is then ever sent, and a service demanding one answers `428`.

## Limitations

- **Actions bound to an entity** do not carry `If-Match` yet, although the specification requires it.
- **Navigation-reached entities** are covered by the annotation of their entity set. A service that states
  concurrency control only through `Capabilities.NavigationRestrictions` is not recognised.
- **Streams and media content** (`…/$value`) are written without an ETag.
- **A service that does not annotate itself** gets no help; its writes are answered with `428`, which
  `isConcurrencyRequired` identifies.
