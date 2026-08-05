---
id: generated-artefacts
sidebar_position: 10
---

# Generated Artefacts

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

Whether the folder layout leads to cyclic imports depends on your data model — a bidirectional link
between two entities is enough, and those are common. Such cycles are perfectly valid within OData, and any
common ESM or bundler setup resolves them. Some cannot: SAP UI5 in combination with the TS Babel plugin is
the known case, as is any other bundler unable to handle cyclic dependencies. Bundling removes the cycles,
so that is the setting to reach for there.

:::note

Up to version 0.41.0 `bundledFileGeneration` defaulted to `true`, i.e. the bundled layout was what you got.
If your imports broke when upgrading, move them to the index files — or switch the option back on.

:::

## Artefact Listing

What you get depends on what the metadata declares. The names below follow the defaults, using the Trippin
service as the example:

| EDMX construct        | Models                                        | Q-Objects                            | Services                                     |
| --------------------- | --------------------------------------------- | ------------------------------------ | -------------------------------------------- |
| EntityType `Person`   | `Person`, `EditablePerson`, `PersonId`        | `QPerson` + `qPerson`, `QPersonId`   | `PersonService`, `PersonCollectionService`   |
| ComplexType `Location`| `Location`, `EditableLocation`                | `QLocation` + `qLocation`            | `LocationService`, `LocationCollectionService` |
| EnumType `Feature`    | `Feature`                                     | —                                    | —                                            |
| unbound operation `GetNearestAirport` | `GetNearestAirportParams`     | `QGetNearestAirport`                 | method on the main service                   |
| bound operation `Person/ShareTrip` | `Person_ShareTripParams`         | `Person_QShareTrip`                  | method on `PersonService`                    |
| EntitySet `People`    | —                                             | —                                    | getter on the main service                   |
| Singleton `Me`        | —                                             | —                                    | getter on the main service                   |
| the service itself    | —                                             | —                                    | `TrippinService`, the entry point            |

The **editable model** is what create, update and patch take: managed properties are gone from it, and the
navigation properties accept a related entity or a reference to an existing one. The **id model** is the key
in its minimal form, and the **id function** (`QPersonId`) formats and parses the entity path built from it,
e.g. `People('russellwhyte')`.

Several options take artefacts away again:

| Option                 | Removes                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `mode: "models"`       | all q-objects and services                                         |
| `mode: "qobjects"`     | all services                                                       |
| `skipEditableModels`   | the editable models                                                |
| `skipIdModels`         | the id models and id functions                                     |
| `skipOperations`       | the parameter models and the q-functions / q-actions               |
| `skipComments`         | the doc comments on model properties                               |

The three `skip*` options only take effect in `models` or `qobjects` mode - see
[fine-tuning artefact generation](./configuration#fine-tuning-artefact-generation).

### What that looks like in your code

```ts
// the editable model, for typing what you send
import type { EditablePerson } from "../src-generated/trippin/index.js";
// the q-object for filtering and ordering, and the main service as entry point
import { qPerson, TrippinService } from "../src-generated/trippin/index.js";

const trippin = new TrippinService(client, "https://services.odata.org/TripPinRESTierService");
```

**Querying** — `select` and `filter` work off the q-object, so a typo is a compile error rather than a
puzzling response. `expanding` goes one level deeper: it pulls in a related entity *and* lets you narrow
what comes back with it.

```ts
const result = await trippin
  .people()
  .query((builder) =>
    builder
      .select("userName", "firstName")
      .filter(qPerson.firstName.eq("Russell"))
      .expanding("trips", (trip) => trip.select("tripId", "name").top(5)),
  )
  .execute();

// typed all the way down: `Person` with only the selected properties
result.data.value[0].firstName;
```

**Creating** — `create` takes the editable model, which is where the difference to `Person` shows: managed
properties are absent, and a navigation property accepts either a new related entity or a reference to an
existing one.

```ts
const newPerson: EditablePerson = {
  userName: "russellwhyte",
  firstName: "Russell",
  lastName: "Whyte",
  // a reference to an existing person, stated by its key
  bestFriend: { "@id": "scottketchum" },
  // ... or a new related entity, created along with this one
  trips: [{ tripId: 42, name: "Trip to Berlin" }],
};

const created = await trippin.people().create(newPerson).execute();
```

**Patching** — the same editable model, but every property optional, so you send only what changes.

```ts
const person = trippin.people("russellwhyte");

await person.patch({ firstName: "Russ" }).execute();

// by default a patch answers 204 with no body; ask for the entity and the typing follows
const updated = await person
  .patch<true>({ firstName: "Russell" })
  .execute({ headers: { Prefer: "return=representation" } });
updated.data.firstName;
```
