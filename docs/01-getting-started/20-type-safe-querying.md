---
id: use-case_query-builder
sidebar_position: 20
---

# Use Case: Type-Safe Querying

The most helpful part of `odata2ts` is the query-builder which enables type-safe
querying and offers a fluent API.
It abstracts away the tricky parts about formulating a valid OData URL, reduces the necessary amount of
knowledge about the OData protocol, and allows for mapped names and converted values.

The query builder relies on the generated models and q-objects.

## Runtime Dependencies

You rely on the query builder as runtime dependency:

```bash npm2yarn
npm install --save @odata2ts/odata-query-builder
```

## Generation Settings

Adapt your config file `odata2ts.config.ts`: Set the `mode` option to `qobjects`.

```ts
import { ConfigFileOptions, EmitModes, Modes } from "@odata2ts/odata2ts";

const config: ConfigFileOptions = {
  mode: Modes.qobjects,
  skipEditableModels: false,
  skipIdModels: false,
  skipOperations: false,
  services: {
    trippin: {
      source: "resource/trippin.xml",
      output: "build/trippin",
    }
  }
}

export default config;
```

## Usage

Update your metadata file whenever the server changes.

Run the `gen-odata` script:

```bash npm2yarn
npm run gen-odata
```

Create the builder by providing the path to the resource and the generated query object:

```ts
import { createUriBuilderV4 } from "@odata2ts/odata-uri-builder";
import { qPerson } from "../build/QTrippin"

createQueryBuilderV4("People", qPerson)
  .select("lastName", "age") // => typesafe: only model attributes are allowed
  .filter(qPerson.userName.equals("russellwhyte"))
  .expand("homeAddress") // => typesafe: only expandable properties are allowed
  .expanding("trips", (builder, qTrip) => {
    builder
      .select("tripId", "budget", "description")
      .top(1)
      .filter(qTrip.budget.gt(1000));
  })
  .build();
```

For V2, you use the factory function `createUriBuilderV2`.
