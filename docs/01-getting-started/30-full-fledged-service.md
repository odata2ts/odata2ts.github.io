---
id: use-case_full-service
sidebar_position: 30
---

# Use Case: Full-Fledged OData Client

You're using a modern frontend framework of your choice and need to interact with an OData service?
Then the full-fledged odata client is for you. `odata2ts` will generate services encapsulating all the
domain knowledge we can gather from the metadata description. In combination with one of the http clients
(fetch, axios, jquery) we get the full-fledged and type-safe odata client:

- allows for complex queries by virtue of our query builder
- CRUD capabilities
- bound and unbound function and action calls
- completely navigatable model

## Runtime Dependencies

You require the following runtime dependencies:

```bash npm2yarn
npm install --save @odata2ts/odata-service @odata2ts/http-client-fetch
```

If you prefer Axios, you install the appropriate http client and also `axios` itself:

```bash npm2yarn
npm install --save @odata2ts/odata-service @odata2ts/http-client-axios axios
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

See [renaming entities and properties](../generator/configuration#renaming-entities-and-properties) to understand
the `allowRenaming` setting.

## Usage

Update your metadata file whenever the server changes.

Run the `gen-odata` script:

```bash npm2yarn
npm run gen-odata
```

Initialize the main OData service:

```ts
// the generate main service
import { TrippinService } from "../build/trippin/TrippinService";
import { FetchClient } from "@odata2ts/http-client-fetch";

const baseUrl = "https://services.odata.org/TripPinRESTierService"
const httpClient = new FetchClient();
const trippinService = new TrippinService(httpClient, baseUrl);
```

The rest can be explored from here on. Thanks, TypeScript!
