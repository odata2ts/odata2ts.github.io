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

## Checking your setup

Two settings are worth having whatever you upgrade from:

- **`debug: true`** while you sort things out. Without it every generated file opens with `@ts-nocheck`,
  so a type check over the output confirms nothing.
- **`prettier: true`** if you emit TypeScript and read the result.
