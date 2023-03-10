---
id: use-case_full-service
sidebar_position: 30
---

# Use Case: Full-Fledged OData Client

You're using a modern frontend framework of your choice and need to interact with an OData service?
Then the full-fledged odata client is for you. `odata2ts` will generate services encapsulating all the
domain knowledge we can gather from the metadata description. In combination with the `axios-odata-client`
we get the full-fledged and type-safe odata client:

- allows for complex queries by virtue of our query builder
- CRUD capabilities
- bound and unbound function and actions are supported
- completely navigatable model

## Runtime Dependencies

You require the following runtime dependencies:

```
yarn add @odata2ts/odata-service @odata2ts/axios-odata-client
```

## Generation Settings

Adapt your config file `odata2ts.config.ts`: Set the `mode` option to `service` or `all`.

```ts
import { ConfigFileOptions, EmitModes, Modes } from "@odata2ts/odata2ts";

const config: ConfigFileOptions = {
  mode: Modes.service,
  allowRenaming: true,
  services: {
    trippin: {
      source: "resource/trippin.xml",
      output: "build/trippin",
    }
  }
}

export default config;
```

Setting the `allowRenaming` flag allows odata2ts to change attribute names of entities and complex types by using naming
strategies like PascalCase or camelCase. The naming is configurable.

## Usage

Update your metadata file if necessary.

Run `yarn gen-odata` or `npm run gen-odata` to trigger the generation process.

Initialize the main OData service:

```ts
// the generate main service
import { TrippinService } from "../build/trippin/TrippinService";
import { AxiosODataClient } from "@odata2ts/axios-odata-client";

const baseUrl = "https://services.odata.org/TripPinRESTierService"
const odataClient = new AxiosODataClient();
const trippinService = new TrippinService(odataClient, baseUrl);
```

The rest can be explored from here on. Thanks, TypeScript!
