---
id: generated-artefacts
sidebar_position: 10
---

# Generated Artefacts

## Artefact Listing

- Model Types
  - per EntityType & ComplexType: Model representation used for query responses
  - per EntityType & ComplexType: Editable model version used for requests (create, update, and patch)
  - per EntityType: Model representing the entity id
  - per Function / Action: Model representing all parameters of that operation
- Q-Objects
  - per EntityType, ComplexType and any form of collection: one QueryObject
  - per EntityType: one id function to format and parse entity paths, e.g. `/Person(userName='russellwhyte')`
  - per function or action: QFunction or QAction to handle operation calls
- OData Client Service
  - one main odata service as entry point
  - per EntityType, ComplexType, and any form of collection: one service

## File Layout

By default the artefacts of one model live together in a **folder of their own**, one level below a folder
per namespace:

```
src-generated/library/
├── index.ts                        ← root barrel
├── LibraryModel.ts                 ← parameter models of unbound operations
├── LibraryService.ts               ← the main service
├── QLibrary.ts
├── library-catalog/                ← namespace "Library.Catalog"
│   ├── index.ts                    ← namespace barrel
│   ├── book/
│   │   ├── Book.ts
│   │   ├── BookService.ts
│   │   └── QBook.ts
│   └── ...
├── library-circulation/
└── publisher-registry/
```

Folder names derive from the namespace and the model name in kebab-case; the file names follow the
[naming configuration](./configuration#naming).

### Index Files

Every folder holding generated files gets an `index.ts`, and so does the output directory itself. **Import
through those barrels rather than through individual files** — that way your imports do not depend on where
an artefact happens to end up, which matters because its location follows the model.

```ts
import { Book, EditableBook, QBook } from "../src-generated/library/library-catalog/index.js";
```

The root barrel re-exports the files on root level directly, but each namespace **under its own name**:

```ts
export * from "./LibraryModel.js";
export * from "./LibraryService.js";
export * from "./QLibrary.js";
export * as libraryCatalog from "./library-catalog/index.js";
export * as libraryCirculation from "./library-circulation/index.js";
export * as publisherRegistry from "./publisher-registry/index.js";
```

That is not decoration: OData allows the same type name in two namespaces, and a flat re-export would make
both of them unreachable. Where a model has only **one** namespace the question does not arise, so there
the root barrel stays flat and exports everything directly.

### One File per Artefact Kind

Set [`bundledFileGeneration`](./configuration#file-layout) to `true` and the generation collapses into one
file per kind of artefact instead:

```
src-generated/library/
├── index.ts
├── LibraryModel.ts     ← all models
├── LibraryService.ts   ← all services
└── QLibrary.ts         ← all q-objects
```

The folder layout entails cyclic imports between the models. Those are perfectly valid within OData, and
any common ESM or bundler setup resolves them — but not all do. SAP UI5 in combination with the TS Babel
plugin is the known case, as is any other bundler unable to handle cyclic dependencies. Bundling removes
the cycles.

:::note

Up to v0.x `bundledFileGeneration` defaulted to `true`, i.e. the bundled layout was what you got. If your
imports broke when upgrading, move them to the index files — or switch the option back on.

:::
