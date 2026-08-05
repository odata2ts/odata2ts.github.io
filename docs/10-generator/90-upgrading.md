---
id: upgrading
title: Upgrading
sidebar_position: 90
---

# Upgrading

What changes between releases in ways that need something from you. Everything else is additive.

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
   import { Book, EditableBook } from "./src-generated/library/LibraryModel";
   // after
   import { Book, EditableBook } from "./src-generated/library/library-catalog/index.js";
   ```

   Where your model has a single namespace, the root barrel exports everything directly and
   `./src-generated/library/index.js` is all you need. With several namespaces the root barrel exposes
   each under its own name — see [Generated Artefacts](./generated-artefacts#index-files).

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
  [`byTypeAndName`](./configuration#type-options).

If you were affected, you had a bug — the message tells you which two names and what to do.

### `entitiesByName` is now `byTypeAndName`

The option matches every kind of type, not just entities, so each entry states which one through a `type`
attribute. Use `TypeModel.Any` to match regardless of kind. See [Type Options](./configuration#type-options).

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
business. See [Binding and Deep Insert](./configuration#binding-and-deep-insert).

### The V2 results wrapping options were renamed and now apply everywhere

V2 serialises a feed as an extra object carrying `results`, so an expanded collection valued navigation
property arrives as `{"Copies": {"results": [...]}}`. The client used to strip that layer off by itself,
which confined the options to `mode: models` and left a deep insert payload with no way to state it at all.

The structure is now handed through untouched in both directions, and both options apply to every
generation mode. Their names say the direction rather than the artefact:

| before                                      | now                        |
| ------------------------------------------- | -------------------------- |
| `v2ModelsWithExtraResultsWrapping`          | `v2ResponseResultsWrapping` |
| `v2EditableModelsWithExtraResultsWrapping`  | `v2PayloadResultsWrapping`  |

There is no alias for the old names. Mind the changed behaviour as well: **a V2 client generated without
`v2ResponseResultsWrapping` no longer has the wrapping removed for you.** If your service wraps, turn the
option on. See [Extra Results Wrapper](./configuration#v2-extra-results-wrapper).

### `Edm.Stream` properties left the models

`Edm.Stream` was mapped to `string`, so a model promised a value that no server ever sends — binary content
is not part of the JSON payload. Such properties are gone from the models and query objects, and the content
is read and written through a generated service of its own instead. Entity types marked `HasStream` extend
the media entity service. See [Binary Content](../odata-client/binary-content).

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

### The query builder types are named by cardinality

`ODataQueryBuilderV2`, `ODataQueryBuilderV4` and `ExpandingODataQueryBuilderV4` no longer exist, and there
is no alias. Which one replaces them depends on what the builder is bound to:

| before                        | bound to a collection        | bound to a single model  |
| ----------------------------- | ---------------------------- | ------------------------ |
| `ODataQueryBuilderV2`         | `CollectionQueryBuilderV2`   | `ModelQueryBuilderV2`    |
| `ODataQueryBuilderV4`         | `CollectionQueryBuilderV4`   | `ModelQueryBuilderV4`    |
| `ExpandingODataQueryBuilderV4`| `ExpandingCollectionQueryBuilderV4` | `ExpandingModelQueryBuilderV4` |

The `Collection…` variants carry the same members as the old types, so that is the mechanical replacement.
Only the types changed — no runtime behaviour did. See
[What the Builder Offers](../query-builder/overview-and-setup#what-the-builder-offers-depends-on-the-resource).

### The `-name` shorthand for `--service-name` is gone

It never worked as a real short flag — multi-character short flags are invalid, and only the long form was
ever parsed reliably. Use `--service-name <serviceName>`.

## Checking your setup

Two settings are worth having whatever you upgrade from:

- **`debug: true`** while you sort things out. Without it every generated file opens with `@ts-nocheck`,
  so a type check over the output confirms nothing.
- **`prettier: true`** if you emit TypeScript and read the result.
