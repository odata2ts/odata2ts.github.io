---
id: cache-keys
title: Cache Keys
sidebar_position: 55
---

# Cache Keys

A cache built on top of a generated `odata2ts` client — TanStack Query is the motivating case, hence the
array shape, but the API stays library-neutral — needs a key that identifies the **resource** a request
addresses, not the URL that happened to reach it. `odata2ts` can generate that key for you:
`RequestCmd.cacheKey`. It answers three questions a raw URL can't:

- What resource does this response belong to, so it can be stored without colliding with an unrelated one?
- What does a write make stale, so related reads get invalidated?
- Do two different routes to the same resource — a navigation hop and a hand-written filter — end up
  caching the same thing?

This is off by default. Turn it on with the [`cacheKeys`](../generator/configuration#cache-keys) option:

```ts
const config: ConfigFileOptions = {
  cacheKeys: true,
};
```

`cacheKeys` is a plain boolean. Convergence between different routes to the same resource is handled automatically at
runtime instead of being a generation-time trade-off
(see [Response-observed identity](#response-observed-identity-resourceidentity) below).

## The shape of a key

A `cacheKey` is a plain array: a **root**, then a **hop** per traversal step, then at most one **params
object** — always the literal route the request actually took, never something re-derived from the data
model.

```ts
service.Copies({ mediumId: 5, inventoryNumber: 7 }).query().cacheKey;
// ["Copies", "detail", { MediumId: 5, InventoryNumber: 7 }]

service.Media(5).Copies().query().cacheKey;
// ["Media", "detail", 5, "Copies", "list"]
```

- The root names itself by the **entity set** the route started at — a singleton's, or an unbound
  operation import's, own name where the route starts there instead — **never a type**. Per OData v4.01
  Part 2 §4.3.1, an entity's canonical URL is its entity set's name plus a key predicate, "even if the
  entity is an instance of a type derived from the declared entity type of its entity set" — a type name
  also isn't unique across namespaces the way an entity set's is (two different services can both declare a
  `Branch`, distinguished only by their generated folder).
- A navigation or complex-property hop carries the **property's own OData name**, the same way §4.3.2
  builds a contained entity's canonical URL from its parent plus the navigation property's own segment —
  recursive, name-anchored, no type anywhere in the chain.
- `"list"` or `"detail"` says whether the resource just named is a collection or a single value — right
  after the root's own name, and right after each hop's own name.
- A primitive property or a stream keeps its bare name, no kind marker — it stays part of its parent's
  resource rather than becoming one of its own — with `"$value"` appended where the raw value itself is
  addressed.
- A bound operation hop carries its own namespace-qualified name — that literally is the URL segment OData
  appends to address it, unlike a type name, which never appears in a URL at all.
- Everything a query restricts the resource by — `$select`, `$expand`, `$filter`, `$orderby`, `$top`/
  `$skip`, `$count`, `$search`, `$apply`, a subtype cast, a singleton marker, an operation's invocation
  parameters — lands in one flat **params object**, always last, omitted entirely when it would be empty.
  See [The params object](#the-params-object) below for exactly how.

`cacheKey` is `ReadonlyArray<unknown> | undefined` — `undefined` for a write, always, since a write has
nothing to be stored under, only something to make stale (see [`invalidates`](#invalidates)); also
`undefined` when the service instance was built from a client generated without `cacheKeys`, which an
application sharing one cache across several generated clients has to account for regardless.

## The params object

Only **two** query options ever become their own entry in the params object — because something downstream
actually reads them structurally (well only for `expand`, `select` is for future uses):

- **`expand`** — every `.expand()`/`.expanding()` target, narrowed to `(name, kind)` hops (plus further
  nested hops where a nested `expanding()` builder ran), because invalidation needs to find a navigation
  property **by name** inside a cached key.
- **`select`** — a sorted array of rendered paths, kept separate for a possible future consumer; nothing
  reads it today.

Everything else the query restricts by — `$filter`, `$orderby`, `$top`, `$skip`, `$count`, `$search`,
`$apply`, any custom option, **and `$expand`'s own full text** — is captured as one **opaque `query`
string**, canonicalized:

```ts
service.Media(5).query((b) => b.expand("Copies")).cacheKey;
// ["Media", "detail", 5, { expand: [["Copies", "list"]], query: "%24expand=Copies" }]

service.Copies().query((b, q) => b.filter(q.mediumId.eq(5))).cacheKey;
// ["Copies", "list", { query: "%24filter=MediumId+eq+5" }]

service.Copies().query((b) => b.top(10).skip(5)).cacheKey;
// ["Copies", "list", { query: "%24skip=5&%24top=10" }]
```

Two things about `query` are easy to miss:

- **`$expand` shows up twice** — once as the structured `expand` hop above (which `touchesResource` and
  invalidation read), and again, verbatim, inside `query`. This duplication for a _plain_ `$expand` is
  deliberate: the structured entry only ever carries the hop's own name and kind, never a nested
  restriction. `$expand=Copies($filter=Condition eq 3)` and `$expand=Copies($filter=Condition eq 5)` both
  enrich to the identical `expand: [["Copies", "list"]]` — so if `$expand`'s raw text were dropped from
  `query` too, two requests keeping different rows of the nested `Copies` collection would get the _same_
  cache key. Keeping the full text in `query` is what still tells them apart. `$select`, by contrast, has no
  such gap — its structured entry already captures its entire restriction — so its raw text is dropped from
  `query` with nothing lost.
- **`$filter`/`$search` never show up twice, and never get their own key either.** Their raw text is
  _replaced_ inside `query` by a canonical rendering, computed from the individual `.filter()`/`.search()`
  clauses before they get joined into one string — sorted by each clause's own text, and (for `$filter`)
  safely parenthesized once there are 2+ clauses to combine. That's what makes call-site order stop
  mattering:

```ts
service.Copies().query((b, q) => {
  b.filter(q.mediumId.eq(5));
  b.filter(q.condition.eq(3));
});
service.Copies().query((b, q) => {
  b.filter(q.condition.eq(3));
  b.filter(q.mediumId.eq(5));
});
// both produce the identical cacheKey:
// ["Copies", "list", { query: "%24filter=%28Condition+eq+3%29+and+%28MediumId+eq+5%29" }]

// the actual request sent to the server keeps each call site's own order - only the cache key canonicalizes
```

Grouping isn't cosmetic. `.and()`/`.or()` combine by plain, unparenthesized text concatenation, so an
ungrouped `.or()` clause's _meaning_ can shift depending on which neighbor ends up next to it once sorted —
without parentheses, two genuinely different filters could canonicalize to the identical string. `$search`
needs no such fix, since its own `.or()` compounds always self-parenthesize already. `$orderBy` is the one
thing in `query` that's never reordered or canonicalized at all: its own sequence is real, result-changing
content (sort priority), not identity noise.

This also closes a real bug from an earlier iteration: `$apply`/`groupBy` used to be silently invisible to
the cache key, so a grouped query and its ungrouped counterpart collapsed onto the same key despite
returning completely different data. Every query restriction now lands somewhere in the key — structured or
opaque — so this can't recur the next time a query feature is added.

## Response-observed identity: `resourceIdentity`

A read's response is proof that a specific canonical resource sits behind the route just taken. `odata2ts`
records that, so that a write reached via a _different_ route can still find and invalidate it:

- Every generated read, once its response comes back, records a mapping from the resource's own
  **canonical id** (`Copies(3)`, `Copies(MediumId=5,InventoryNumber=7)` — the same encoding a
  [`ConcurrencyHandler`](./optimistic-concurrency) ETag key already uses) to the request's own hierarchical
  `cacheKey`. This happens for the directly addressed resource and for every entity an `$expand` pulled in
  alongside it, at any depth — never for a contained entity, a complex value, or anything else with no
  entity set of its own, which has no canonical id to record against in the first place.
- A later **write**, addressing that same canonical resource through any route, looks its own canonical id
  up and folds every hierarchical key ever recorded against it into its own [`invalidates`](#invalidates) —
  alongside the entries its own route already contributes.

```ts
// a read via one route records that "Copies(...)" resolves to this key
await service.Copies(copyKey).Medium().query().execute();
// cacheKey of that request: ["Copies", "detail", copyKey, "Medium", "detail"]

// a write through a completely different route to the very same Medium...
const patched = await service.Media(5).asBookService().patch({ Title: "Der Prozess" }).execute();

// ...still invalidates the first route's cached entry
patched.invalidates; // includes ["Copies", "detail", copyKey, "Medium", "detail"]
```

A nav hop and the equivalent hand-written filter are still deliberately different keys —
`service.Media(5).Copies()` and `service.Copies().query(b => b.filter(...eq(5)))` don't get the same
`cacheKey` by construction. Nothing decomposes a query back into its meaning to converge the two ahead of
time; response-observed identity is what converges them instead, once both routes have actually been read.

This lives on the **HTTP client**, not the service, for the same reason
[`ConcurrencyHandler`](./optimistic-concurrency) does: it has to outlive a generated sub-service, which is
rebuilt fresh per call. It's exposed as `resourceIdentity` on `ODataHttpClient`, right next to
`concurrency`, and just as optional — a client implementation predating this, or one with no use for it,
still satisfies the contract, and `odata-service` treats its absence as "no mapping is ever known."

Every client built on `BaseHttpClient` (`fetch`, `axios`, `jquery`) wires up an
`InMemoryResourceIdentityHandler` automatically unless you pass your own; `AngularODataClient` does the
same by hand, since Angular's DI container constructs it outside that base class. Override it like you
would `concurrency`:

```ts
import { InMemoryResourceIdentityHandler } from "@odata2ts/http-client-common";

const client = new FetchClient(baseUrl, {
  resourceIdentity: new InMemoryResourceIdentityHandler({ maxEntries: 5000, maxKeysPerEntry: 50 }),
});
```

It persists the same way TanStack Query's own hydration does — `dehydrate()`/`hydrate()` bulk-transfer
exactly what recording and resolving already traffic in, no new shape, useful across a server-side render
or a session:

```ts
const snapshot = client.resourceIdentity?.dehydrate();
// ... send to the browser, or write to storage ...
client.resourceIdentity?.hydrate(snapshot);
```

## Using it

### `cacheKey`

Available before the request goes out — exactly when a cache needs it, to look up or store under:

```ts
const request = service.Copies(id).query();
queryClient.fetchQuery({ queryKey: request.cacheKey!, queryFn: () => request.execute() });
```

Only ever populated for a read. A write command's `cacheKey` is always `undefined` — a write has nothing
to be stored under, only something to make stale, which is exactly what [`invalidates`](#invalidates) on
its _response_ is for. This mirrors that asymmetry from the other side: a read's response never carries
`invalidates`, a write's request never carries `cacheKey`.

### `invalidates`

A **write** response carries the keys it makes stale; reads carry nothing extra, since the key a read
should be stored under is its own `cacheKey`. The array is built from: every ancestor hop's own key, the
addressed resource's own key without its query restrictions, that resource's entity set as a bare,
unfiltered list key (where it belongs to one), a bare list-key entry per entity set the write's own payload
deep-inserted into, and whatever [response-observed identity](#response-observed-identity-resourceidentity)
already knows resolves to this same resource by some other route. An entry another entry already prefixes
is dropped.

**A worked example:**

```ts
// POST /Media(5)/Copies
// — the collection's own cacheKey would be ["Media", "detail", 5, "Copies", "list"]
const response = await service.Media(5).Copies().create({ Condition: 10 }).execute();

response.invalidates;
// [
//   ["Media", "detail", 5],
//   ["Copies", "list"],
// ]
```

The write's own, unfiltered key (the full five-element array in the comment above) is dropped outright:
the first entry, `["Media", "detail", 5]`, already prefixes it, so invalidating that one reaches it for
free.

**Run every entry through [`touchesResource`](#touchesresource), not a plain `queryKey` match:**

```ts
response.invalidates?.forEach((entry) =>
  queryClient.invalidateQueries({ predicate: (q) => touchesResource(entry, q.queryKey) }),
);
```

`touchesResource` finds everything a plain prefix match would have — the no-skip path through it degenerates
to exactly that — plus what a prefix match cannot: the same resource reached through a route this write
never took, once that route has actually been observed. `["Copies", "list"]`, for instance, is a real
_prefix_ only for a `Copy` rooted directly at that entity set (a top-level `/Copies` query); under this
scheme, a `Copy` reached through some parent (`/Media(5)/Copies`, say) sits behind a completely different
root and a plain prefix match never sees it. `touchesResource` does, because it scans for that
`(name, kind)` shape wherever it occurs, not only at position zero — see [`touchesResource`](#touchesresource)
for exactly how that stays precise instead of degenerating into "any `Copies` entry, anywhere."

:::note For an action, this is a lower bound, not a statement
OData has no way to declare what an action changes, so an action contributes the same entries as any other
write on its bound resource — and nothing more. If it also changes something the client cannot see from
the metadata, that has to be invalidated by hand.
:::

### `touchesResource`

```ts
export function touchesResource(needle: ReadonlyArray<unknown>, key: ReadonlyArray<unknown>): boolean;
```

A hierarchical key is rooted at the name the route started at, so a prefix match on a name reached further
down the route can never reach it — one array has one prefix. `touchesResource` finds it anyway, by
scanning the key instead of only checking its start.

`needle` is always an array — the exact `(name, kind, key?)` shape a root carries, or the `(name, kind)`
shape a bare entity-set entry (from `invalidates`) carries:

```ts
import { touchesResource } from "@odata2ts/odata-service";

queryClient.invalidateQueries({
  predicate: (query) => touchesResource(["Copies", "list"], query.queryKey),
});
```

Called with an entry straight out of `invalidates`, it stays precise: `["Media", "detail", 5]` only
matches where `"Media"` is immediately followed by the kind marker `"detail"` and then the value `5`. The
one exception is a navigation property's name, which may sit between the kind marker and what follows it
(`[name, kind, hopName, hopKind, ...]` rather than a root's `[name, kind, key?]`) — that's exactly what
lets a write to `Media(5)` also reach `/Copies(...)/Medium` or any other, entirely unrelated route to the
same entity, without ever guessing at names or losing the `5` along the way.

**`expand` entries are searched too, recursively.** They live inside the trailing params object, not as
top-level elements of the key, but a hop hidden there is still exactly the same `(name, kind)` shape, so
`touchesResource(["Copies", "list"], mediaKeyWithCopiesExpanded)` finds it.

## Examples at a glance

Every row below is a real, executed shape — either taken directly from the server integration tests
(`int-test/asp-net`, `int-test/cap`, `int-test/olingo-v2`) or, where marked, the underlying unit tests.
Together they cover the functional breadth the generator supports today.

### `cacheKey`

| #   | Scenario                                                                                                                                                                                                                     | Call                                                                             | Result                                                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | Collection (list root)                                                                                                                                                                                                       | `service.Media().query()`                                                        | `["Media", "list"]`                                                                                  |
| 2   | Entity by a single key                                                                                                                                                                                                       | `service.Media(5).query()`                                                       | `["Media", "detail", 5]`                                                                             |
| 3   | Entity by a composite key                                                                                                                                                                                                    | `service.Copies({ mediumId: 5, inventoryNumber: 7 }).query()`                    | `["Copies", "detail", { MediumId: 5, InventoryNumber: 7 }]`                                          |
| 4   | Subtype cast on a collection                                                                                                                                                                                                 | `$select` on `Media/Library.Catalog.Book`                                        | `["Media", "list", { cast: "Library.Catalog.Book" }]`                                                |
| 5   | Hierarchical hop, to-many, named by the navigation property                                                                                                                                                                  | `service.Media(5).Copies().query()`                                              | `["Media", "detail", 5, "Copies", "list"]`                                                           |
| 6   | Hierarchical hop, to-one — no key of its own, a to-one hop never knows the target's key up front                                                                                                                             | `service.Copies(copyKey).Medium().query()`                                       | `["Copies", "detail", copyKey, "Medium", "detail"]`                                                  |
| 7   | A hand-filtered route to the same entity set — a legitimately _different_ key from #5 now; what makes them invalidate together is [response-observed identity](#response-observed-identity-resourceidentity), not equal keys | `service.Copies().query((b, q) => b.filter(q.mediumId.eq(5)))`                   | `["Copies", "list", { query: "%24filter=MediumId+eq+5" }]`                                           |
| 8   | Two `.filter()` calls in either order, converging - see [The params object](#the-params-object)                                                                                                                              | `.query((b, q) => { b.filter(q.mediumId.eq(5)); b.filter(q.condition.eq(3)); })` | `["Copies", "list", { query: "%24filter=%28Condition+eq+3%29+and+%28MediumId+eq+5%29" }]`            |
| 9   | Deeper nesting, same naming rule regardless of what the metadata declares about the relation                                                                                                                                 | `service.Members(42).Loans().query()`                                            | `["Members", "detail", 42, "Loans", "list"]`                                                         |
| 10  | Containment (no entity set of its own)                                                                                                                                                                                       | `service.Media(id).asAudiobookService().Chapters().query()`                      | `["Media", "detail", id, "Chapters", "list"]`                                                        |
| 11  | Stream, raw value                                                                                                                                                                                                            | `stream.getBlob()` on `Audiobook/Sample`                                         | `["Media", "detail", id, "Sample", "$value"]`                                                        |
| 12  | `$select` structured, `query` dropped entirely (nothing else restricted the resource)                                                                                                                                        | `service.Media().query((b, q) => b.select(q.title))`                             | `["Media", "list", { select: ["Title"] }]`                                                           |
| 13  | `$expand`, hop-shaped, and its own full text kept in `query` too (see [The params object](#the-params-object))                                                                                                               | `service.Media(5).query((b) => b.expand("Copies"))`                              | `["Media", "detail", 5, { expand: [["Copies", "list"]], query: "%24expand=Copies" }]`                |
| 14  | `$expand`, nested (`expanding()` with its own restriction) — the nested restriction survives only inside `query`'s full `$expand` text, never in the structured `expand` hop                                                 | `$expand=Copies($filter=Condition eq 3)`                                         | `[..., { expand: [["Copies", "list"]], query: "%24expand=Copies%28%24filter%3DCondition+eq+3%29" }]` |
| 15  | Everything left over (`$top`/`$skip`/`$orderby`/`$count`/`$apply`/custom), sorted so call-site order converges                                                                                                               | `service.Copies().query((b) => b.top(10).skip(5))`                               | `["Copies", "list", { query: "%24skip=5&%24top=10" }]`                                               |
| 16  | Unbound operation, no declared result entity set                                                                                                                                                                             | `service.TotalMediaCount()`                                                      | `["TotalMediaCount", "detail"]`                                                                      |
| 17  | Unbound operation, a declared result entity set — still roots at its own import name, never the entity set's; invocation params nested under their own key                                                                   | `service.Search({ Term: "Prozess" })`                                            | `["Search", "list", { params: { Term: "Prozess" } }]`                                                |
| 18  | Bound operation/action — its own namespace-qualified name, the literal URL segment                                                                                                                                           | `POST /Members(42)/Library.Circulation.BulkRenew`                                | `["Members", "detail", 42, "Library.Circulation.BulkRenew"]`                                         |
| 19  | Any write, or a client generated without `cacheKeys`                                                                                                                                                                         | `service.Media(5).patch({ ... })`                                                | `undefined`                                                                                          |

### `invalidates`

| #   | Scenario                                                                                                                                                      | Call                                                                  | Result                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | `PATCH` on a root-level entity                                                                                                                                | `service.Copies(key).patch({ Condition: 5 })`                         | `[["Copies", "detail", key], ["Copies", "list"]]`            |
| 2   | `POST`/create on a root-level collection (own key without params collapses onto the entity set)                                                               | `service.Copies().create({ ... })`                                    | `[["Copies", "list"]]`                                       |
| 3   | `DELETE` on a root-level entity                                                                                                                               | `service.Copies(key).delete()`                                        | `[["Copies", "detail", key], ["Copies", "list"]]`            |
| 4   | Write reached via a nested hierarchical route (own key dropped — the ancestor already prefixes it)                                                            | `POST /Media(5)/Copies`                                               | `[["Media", "detail", 5], ["Copies", "list"]]`               |
| 5   | Cross-route invalidation via response-observed identity: a route reached the same entity earlier, so a write through a _different_ route still invalidates it | read `Copies(key).Medium()`, then `PATCH` that same `Medium` directly | includes `["Copies", "detail", copyKey, "Medium", "detail"]` |
| 6   | Deep-insert on create — the nested entity contributes its own bare entity-set entry, additionally to the write's own                                          | `service.Members().create({ Loans: [{ ... }] })`                      | `[["Members", "list"], ["Loans", "list"]]`                   |
| 7   | Deep-insert whose entity set matches the write's own (collapses via the same redundancy pass)                                                                 | create a `Member` with a deep-inserted `Member` (self-referential)    | `[["Members", "list"]]`                                      |
| 8   | A binding (`{"@id": ...}`), as opposed to a deep insert — contributes nothing extra                                                                           | `service.Members(42).patch({ Loans: [{ "@id": 5 }] })`                | `[["Members", "detail", 42], ["Members", "list"]]`           |
| 9   | Write to a contained resource (no entity set — rule "own entity set as a list key" does not apply)                                                            | `PATCH` a `Chapter` under `Media(1)/.../Chapters(3)`                  | `[["Media", "detail", 1]]`                                   |
| 10  | Action/operation — a lower bound, not a statement about everything it changed                                                                                 | `POST /Members(42)/Library.Circulation.BulkRenew`                     | `[["Members", "detail", 42]]`                                |
| 11  | A read, or a write on a client generated without `cacheKeys`                                                                                                  | any `GET`, or any write without the feature enabled                   | `undefined`                                                  |

Unit-test only (not (yet) exercised against a real server, but directly asserted on
`buildInvalidates`/`buildCacheKey`/`getCacheKeyParams`/`canonicalizeQueryString`): rows 12 and 14 of the
`cacheKey` table and rows 7–8 of the `invalidates` table.
