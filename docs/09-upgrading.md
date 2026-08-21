---
id: upgrading
title: Upgrading
sidebar_position: 9
---

# Upgrading

What changes between releases in ways that need something from you. Everything else is additive.

## Coming from 0.43.0 and earlier

### `disableAutoManagedKey` is now `keyProperties`

A key cannot change once the entity exists — that much odata2ts can tell without being told. What it
cannot tell is **who supplies the value**, the client on create or the server. The old boolean answered
that with one heuristic; the new option lets you state it.

| before                        | equivalent now                    |
| ----------------------------- | --------------------------------- |
| the default                   | `keyProperties: "singleComputed"` |
| `disableAutoManagedKey: true` | `keyProperties: "strict"`         |

The default changed as well, to `interoperable`: the key stays immutable, but is **never required on
create**, whatever `nullable` says. That is deliberately not what the specification asks for — it is what
works against the services people really have, since a server generating keys without annotating them is
the common case. `strict` is the spec-conformant reading.

The practical difference from the old default: a single key property used to be **absent** from the
editable models, and is now **present and optional**. Set `keyProperties: "singleComputed"` to keep the
old shape.

See [Keys & Managed Properties](./generator/configuration#keys--managed-properties).

### Managed properties are read from the service's annotations

`Core.Computed`, `Core.Immutable`, `Core.ComputedDefaultValue` and `Core.Permissions` are now evaluated,
where previously nothing but the key heuristic and your own per-property configuration had any say. A
service that states these terms properly needs no configuration at all.

**Your write models may therefore change shape** — a computed property is no longer demanded on create, an
immutable one no longer offered on update. Nothing is required that was not required before, so this
relaxes rather than tightens. Switch it off with `annotations: { disableManagedProperties: true }`.

The new `managedPropertyMode` decides how such a property appears: `lenient` (the default) keeps it in
the write model but never requires it, `strictOmit` takes it out. The per-property `managed` option still
accepts a boolean, so existing configurations keep working.

### `update()` and `patch()` may take an Updatable model

Where a type has immutable properties of its own, it now gets a second write model beside the editable
one, and the entity service uses it: `create()` takes `EditableFoo`, `update()` and `patch()` take
`UpdatableFoo`. Types with nothing immutable about them are unaffected — a second, identical model would
be noise, so none is generated.

This only concerns you where you wrote such a payload type out by hand; inferred usage is unchanged.

### `has` is offered only for flags enums

`has` used to sit on the shared enum path, so it appeared on **every** enum property, although V4 defines
it for a flag set alone. Elsewhere it was not refused but silently useless: the server evaluates it
bitwise over the underlying values, and for a member of `0` every row matches.

It now lives on `QFlagsEnumPath` and `QNumericFlagsEnumPath`, which the generator picks exactly where the
metadata declares `IsFlags="true"`. **Calling `has` on an enum without that declaration no longer
compiles.** Regenerate; properties whose enum does carry the flag keep the operator. A collection keeps
the plain path, since `has` applies to the property rather than to its items.

If the compiler now rejects a `has` you were relying on, that call was never doing what it looked like.

### Enums can be synthesized from `Validation.AllowedValues`

New and opt-in, so it asks nothing of you — listed here only so you know it arrived. Some services declare
no `<EnumType>` and annotate a plain property with the values it accepts instead, which is CAP's habit;
`enumSynthesized` turns such an annotation into a real enum. See
[Synthesized Enums](./generator/configuration#synthesized-enums-for-cap).

`enumType` is unchanged and still decides how enums are rendered.

### `disableDeepInsertProps` is now `deepInsertProps`

The option names what it selects instead of switching a feature off, which leaves room for the third
setting that came with it:

| before                          | now                       |
| ------------------------------- | ------------------------- |
| `disableDeepInsertProps: false` | `deepInsertProps: "all"`  |
| `disableDeepInsertProps: true`  | `deepInsertProps: "none"` |

The default is unchanged. The new value is `composition-only`, which offers the deep insert shape only
for navigation properties marked `ContainsTarget="true"` — meant for CAP, where deep writes run along
compositions and not along associations. See
[`deepInsertProps`](./generator/configuration#deepinsertprops).

`disableBindingProps` is untouched.

## Coming from 0.42.0 and earlier

### Services are no longer generic over the HTTP client

Every generated service used to carry the HTTP client as a type parameter, for one reason only: so that
`execute()` could type the request configuration as whatever the chosen client accepts. That type
parameter is gone.

Wherever it was inferred — which is every `new TrippinService(httpClient, baseUrl)` — nothing changes.
It only shows where you wrote a service type out, for instance to hold one in a field or hand it to a
function:

```ts
// before
let service: TrippinService<FetchClient>;
// after
let service: TrippinService;
```

The service is now assignable regardless of the client, so this also stops the type parameter from
spreading through your own signatures.

For `execute()` the common fields `headers` and `params` remain available without any type argument.
A field belonging to a specific client now needs that client's config type on the call — imported from
the client's own package, here `FetchRequestConfig` from `@odata2ts/http-client-fetch`:

```ts
// before
await cmd.execute({ credentials: "include" });
// after
await cmd.execute<FetchRequestConfig>({ credentials: "include" });
```

See [Request Configuration](./odata-client/the-main-service#request-configuration).

### Refactored V2 and V4 Specific Configurations

All V4 specific configurations are grouped under `v4`:

- `v4BigNumberAsString` becomes `bigNumberAsStrin`
- `v4OdataVersion` becomes `odataVersion`
- `enableNativeInOperator` has just been moved

All V2 specific configurations are grouped under `v2`:

- `v2ResponseResultsWrapping` becomes `responseResultsWrapping`
- `v2PayloadResultsWrapping` becomes `payloadResultsWrapping`
- `v2ResponseAsV4` becomes `responseAsV4`

## Coming from 0.41.0 and earlier

### The generated file layout changed

`bundledFileGeneration` used to default to `true`: everything landed in one file per kind of artefact.
It now defaults to `false`, which puts each model into a folder of its own below a folder per namespace —
the structure that scales for large models and the one most setups want.

**Your imports break.** Two ways out:

1. **Import through the generated index files.** Every folder has one, and so does the output directory.
   This is the recommendation, since an artefact's location then no longer concerns you:

   ```ts
   // before

   // after
   import { Book, EditableBook } from "./src-generated/library/library-catalog/index.js";
   import { Book, EditableBook } from "./src-generated/library/LibraryModel";
   ```

   Where your model has a single namespace, the root barrel exports everything directly and
   `./src-generated/library/index.js` is all you need. With several namespaces the root barrel exposes
   each under its own name — see [Generated Artefacts](./generator/generated-artefacts#index-files).

2. **Keep the old layout**: set `bundledFileGeneration: true` in your configuration. That is the right
   answer if your bundler cannot resolve cyclic imports — SAP UI5 with the TS Babel plugin is the known
   case.

### Name clashes now fail the generation

Two situations that used to produce output no longer do:

- **Two properties collapsing onto one name.** With `allowRenaming`, distinct OData names can end up the
  same — `Location_` and `Location` both become `location` under camelCase. Previously the generated
  interface simply declared the name twice; at runtime the second declaration won and the other property
  was unreachable. Now the generation stops and names both. Resolve it with `propertiesByName`:

  ```ts
  propertiesByName: [{ name: "Location_", mappedName: "shelfLocation" }];
  ```

- **Two types colliding within one namespace.** Same idea one level up, resolved with
  [`byTypeAndName`](./generator/configuration#type-options).

If you were affected, you had a bug — the message tells you which two names and what to do.

### `entitiesByName` is now `byTypeAndName`

The option matches every kind of type, not just entities, so each entry states which one through a `type`
attribute. Use `TypeModel.Any` to match regardless of kind. See [Type Options](./generator/configuration#type-options).

### Binding and deep insert are on by default

Both features used to be opt-in. They are what you usually want from an editable model — a navigation
property either carries a new related entity or a reference to an existing one — so the options flipped:

| before                  | now                      |
| ----------------------- | ------------------------ |
| `enableBindingProps`    | `disableBindingProps`    |
| `enableDeepInsertProps` | `disableDeepInsertProps` |

Both default to `false`, so the features are on unless you switch them off. Rename the options in your
configuration; if you were relying on the previous default, set both to `true`.

### A binding states the key of the entity, not its URL

Where you generate a service, the editable models no longer carry the wire notation. The binding goes by
the navigation property itself:

```ts
// before
{ "Author@odata.bind": "Authors(1)" }
// after
{ Author: { "@id": 1 } }
```

The key is typed as the generated id model, so its short form is accepted just as well as the full one.
Deep insert and binding share the one property and are told apart by `"@id"`. What goes on the wire —
`Author@odata.bind` for 4.0, `{"@id": …}` for 4.01, `__metadata.uri` for V2 — is now the query object's
business. See [Binding and Deep Insert](./generator/configuration#binding-and-deep-insert).

### The V2 results wrapping options were renamed and now apply everywhere

V2 serialises a feed as an extra object carrying `results`, so an expanded collection valued navigation
property arrives as `{"Copies": {"results": [...]}}`. The client used to strip that layer off by itself,
which confined the options to `mode: models` and left a deep insert payload with no way to state it at all.

The structure is now handed through untouched in both directions, and both options apply to every
generation mode. Their names say the direction rather than the artefact:

| before                                     | now                         |
| ------------------------------------------ | --------------------------- |
| `v2ModelsWithExtraResultsWrapping`         | `v2ResponseResultsWrapping` |
| `v2EditableModelsWithExtraResultsWrapping` | `v2PayloadResultsWrapping`  |

There is no alias for the old names. Mind the changed behaviour as well: **a V2 client generated without
`v2ResponseResultsWrapping` no longer has the wrapping removed for you.** If your service wraps, turn the
option on. See [Extra Results Wrapper](./generator/configuration#extra-results-wrapper).

### `Edm.Stream` properties left the models

`Edm.Stream` was mapped to `string`, so a model promised a value that no server ever sends — binary content
is not part of the JSON payload. Such properties are gone from the models and query objects, and the content
is read and written through a generated service of its own instead. Entity types marked `HasStream` extend
the media entity service. See [Binary Content](./odata-client/binary-content).

### Collection-bound operations carry a `Collection` infix

The specification allows two overloads that differ only in cardinality — one bound to `Medium`, one to
`Collection(Medium)`. Both used to produce the same names, so the generated file declared the same class
twice and did not compile. Q-objects and params models of **collection-bound** operations are therefore
renamed from `<Type>_Q<Operation>` to `<Type>Collection_Q<Operation>`, and their params models along with
them. Operations bound to a single instance and unbound operations keep their names.

### A primitive collection takes the value, not a model payload

`CollectionServiceV4.add()` and `update()` take the primitive value itself. They used to take it wrapped
as `ODataModelPayloadV4`, i.e. intersected with OData control information — which has no meaning on a
member of a primitive collection.

`update()` now also sends `{ "value": [...] }` instead of the bare array. Servers that accepted the old
shape were silently discarding the data.

### The `-name` shorthand for `--service-name` is gone

It never worked as a real short flag — multi-character short flags are invalid, and only the long form was
ever parsed reliably. Use `--service-name <serviceName>`.

## Coming from 0.40.2 and earlier

These landed in 0.41.0. If you are already on that version, you have them.

### A request is now a command you execute

Every operation of a generated service returns a command object instead of performing the request straight
away. Nothing happens until you call `execute()`:

```ts
// before
const person = await trippin.people(id).query();
await trippin.people().create(newPerson);
// after
const person = await trippin.people(id).query().execute();
await trippin.people().create(newPerson).execute();
```

That one call is the whole migration, and the compiler finds every site for you: what you get back is a
command, not a response, so the old code stops type-checking rather than silently doing nothing.

What you gain is a handle on the request before it goes out:

- `getUrl()` and `getInfo()` — the URL, method, headers and payload, with your own typings on the data
- `getInfoConverted()` — the same after the request converters have run, i.e. what actually goes on the wire
- `prependRequestConverter()` / `appendRequestConverter()` and the two response counterparts — hook your own
  conversion into either end of the chain
- `execute(requestConfig?)` — perform it, optionally with per-request client configuration

`execute()` is also where a request configuration goes now, so a one-off header no longer needs a separate
client:

```ts
await person.patch({ firstName: "Russ" }).execute({ headers: { Prefer: "return=representation" } });
```

### The query builder types are named by cardinality

`ODataQueryBuilderV2`, `ODataQueryBuilderV4` and `ExpandingODataQueryBuilderV4` no longer exist, and there
is no alias. Which one replaces them depends on what the builder is bound to:

| before                         | bound to a collection               | bound to a single model        |
| ------------------------------ | ----------------------------------- | ------------------------------ |
| `ODataQueryBuilderV2`          | `CollectionQueryBuilderV2`          | `ModelQueryBuilderV2`          |
| `ODataQueryBuilderV4`          | `CollectionQueryBuilderV4`          | `ModelQueryBuilderV4`          |
| `ExpandingODataQueryBuilderV4` | `ExpandingCollectionQueryBuilderV4` | `ExpandingModelQueryBuilderV4` |

The `Collection…` variants carry the same members as the old types, so that is the mechanical replacement.
Only the types changed — no runtime behaviour did. See
[What the Builder Offers](./odata-client/querying#what-the-builder-offers-depends-on-the-resource).

### `QAction` and `QFunction` changed shape

Both now carry the response structure as a second type parameter, and `QFunction` lost the constructor
arguments describing the return type — it takes the name alone. Two version specific subclasses arrived
with it, `QFunctionV2` and `QFunctionV4`, which is what the generator emits from now on.

This only concerns you if you wrote query objects for operations by hand. **Regenerating is the answer** —
these classes are generator output, and hand-written ones will not compile against the new signatures.

### `OperationReturnType`, `ResponseHelper` and `ReturnTypes` are gone

They described how to unpack an operation response. Response conversion now lives in the converters the
command object assembles, so there is nothing left for them to do and no replacement to import. If you
referenced them, you were reproducing what the generated service already does — drop the code and read the
result off `execute()`.

## Checking your setup

Two settings are worth having whatever you upgrade from:

- **`debug: true`** while you sort things out. Without it every generated file opens with `@ts-nocheck`,
  so a type check over the output confirms nothing.
- **`prettier: true`** if you emit TypeScript and read the result.
