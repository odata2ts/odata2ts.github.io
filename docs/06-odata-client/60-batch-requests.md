---
id: batch-requests
title: Batch Requests
sidebar_position: 60
---

# Batch Requests

A **batch** sends several requests in one `$batch` call. `odata2ts` builds the batch for you: you add the
request commands you already have, and you get back one answer per request, in the order you added them.
Simple and stupid example:

```ts
const books = service.Books().query((b) => b.top(2));
const count = service.Books().query((b) => b.count());

const [booksResult, countResult] = await service.batch().add(books).add(count).execute();

booksResult.data.value.length; // 2
countResult.data["@odata.count"];
```

`service.batch()` is on every generated service. It returns a builder; each `add()` appends a command and
hands the builder back, so the calls chain. `execute()` serializes the batch, sends it to the service
root's `$batch` endpoint and returns a tuple with one slot per command.

:::info

V2 has no JSON `$batch` at all, so a V2 service is always multipart, whatever `batch.format` states.

A service whose `batch` option is`{ disabled: true }` refuses batches altogether: its `batch()` throws.

:::

## Change Sets / Atomicity Groups

Group commands into a change set with `startGroup` / `endGroup`:

```ts
await service
  .batch()
  .startGroup("change-set")
  .add(service.Books().create({ Title: "New" }))
  .add(service.Members().create({ Name: "New" }))
  .endGroup()
  .execute();
```

Inside a group the service commits the members as a unit or rolls none of them back. When the service
answers a group with an error, the members that would have succeeded are reported as **Rolled Back**, and
their slot's `data` is `undefined` — even though the service had already answered them.

## The wire format

The wire format a service's batches are sent in is fixed at generation time, not chosen per call: the
generator option `batch.format` (`multipart` or `json`, default `multipart`) becomes the builder type the
service is stamped with, and `batch()` hands that builder back.

- **`multipart`** works for every OData version, so it is the default. A service stamped for it builds a
  `MultipartBatchBuilder`.
- **`json`** is the JSON wire form, and only it can carry a `dependsOn` graph. A service stamped for it
  builds a `JsonBatchBuilder`.

## `dependsOn`

`dependsOn` orders the requests of a JSON batch against each other — and it is the only way to order
them, since neither the multipart form nor a change set's member order guarantees a sequence. Only a
`JsonBatchBuilder` accepts it: `add()` on a `MultipartBatchBuilder` takes no options at all.

The ids it names are the wire ids of the batch's own requests — `1`, `2`, `3`, … in the order the
requests were added — so an already-composed batch is addressed by number:

```ts
await service
  .batch()
  .add(readBooks)
  .add(countBooks, { dependsOn: [1] })
  .execute();
```

The list may also be a callback, resolved against the id the request is about to receive, so a
_relative_ dependency is expressible without counting:

```ts
await service
  .batch()
  .add(readBooks)
  .add((selfRef) => countBooks, { dependsOn: [selfRef - 1] })
  .execute();
```

Each id must name a request added before this one — a wire id between `1` and this request's own id minus
one. A self- or forward-reference is refused at `add()`, before the batch is built or sent.

## Request references

A request that addresses an entity whose key is not yet known — because an earlier request of the very
same batch just created the entity — can point at that earlier request by its wire id instead of by a key.
On the wire the pointer is the `$<id>` request reference. The client gets the token from `ref(id)`, which
returns it for the id:

```ts
import { ref } from "@odata2ts/odata-service";

ref(2); // "$2"
```

There are three reference forms, one per site where a reference may appear:

| Form  | Where it appears             | Points at                                                                         |
| ----- | ---------------------------- | --------------------------------------------------------------------------------- |
| URL   | the request path             | an entity created (multipart) or created or returned (JSON) by an earlier request |
| ETag  | `If-Match` / `If-None-Match` | the ETag an earlier response carries                                              |
| Value | a value in a body or query   | the body of an earlier response                                                   |

The examples below use two services: `service`, generated with the default multipart batch, and
`jsonService`, generated with `batch: { format: "json" }`.

### The URL reference

`byRef(id)` is the `byId` twin on the entity-set service: it returns the single-entity service whose path
is the bare `$<id>`, so a request built from it goes out under the earlier request's answer and the
service rewrites it against that answer. It is not ETag-gated and carries no cache key — a reference is
not a real address, so there is nothing to gate on or to store under.

On a multipart batch the creating parent and the referring child go out in one change set:

```ts
const audiobook = service.Audiobooks().create({ Title: "New audiobook" });
const chapter = service.Audiobooks().byRef(1).Chapters().create({ Title: "New chapter" });

await service.batch().startGroup("g").add(audiobook).add(chapter).endGroup().execute();
```

On a JSON batch the same shape is a `dependsOn` instead of a change set:

```ts
const member = jsonService.Members().create({ Name: "New member" });
const loan = jsonService.Members().byRef(1).Loans().create({
  LoanedAt: "2026-01-01T10:00:00Z",
  DueDate: "2026-01-15",
});

const [memberResult, loanResult] = await jsonService
  .batch()
  .add(member)
  .add(loan, { dependsOn: [1] })
  .execute();
```

### The value reference

The token in a value — a navigation property bound by key, or a plain property that carries a key. The
builder cannot reach into a body for you, so you place the token where the key goes:

```ts
const member = jsonService.Members().create({ Name: "New member" });
const loan = jsonService.Loans().create({
  LoanedAt: "2026-01-01T10:00:00Z",
  DueDate: "2026-01-15",
  Member: { "@id": ref(1) },
});

const [memberResult, loanResult] = await jsonService
  .batch()
  .add(member)
  .add(loan, { dependsOn: [1] })
  .execute();
```

A V2 service resolves the same token in a plain key property, which is where its renditions keep the
reference:

```ts
const book = service.Books().create({ Title: "New book" });
const copy = service.Copies().create({
  MediumId: ref(1),
  InventoryNumber: 1001,
  IsLoanable: true,
});

await service.batch().startGroup("g").add(book).add(copy).endGroup().execute();
```

### The ETag reference

The token as the match value of a write — a write that runs against the ETag the very read of the same
batch just returned, instead of one the ETag store remembers from an earlier, separate read:

```ts
const read = jsonService.Copies(3).query();
const write = (selfRef) =>
  jsonService
    .Copies(3)
    .patch({ Condition: 7 })
    .withETag(ref(selfRef - 1));

await jsonService
  .batch()
  .add(read)
  .add(write, { dependsOn: [1] })
  .execute();
```

### Self-reference

The factory form of `add` hands the callback the id the command is about to receive, so `selfRef - 1` is
the previous request and `ref(selfRef)` is the request's own response — a body that names its own id is
the one place a self-reference makes sense.

The builder checks the shape — that a `dependsOn` id names an earlier request — but not what that request
is. Whether a request can be referenced at all is a matter of the reference form and of the service: the
client sends the token as it is, and the service resolves it or refuses it. A reference the service
cannot resolve is answered by the service, per request or for the whole batch — whatever it sends lands
in the slots, like any other answer.
