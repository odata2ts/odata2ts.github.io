---
id: overview-and-setup
sidebar_position: 1
---

# Overview & Setup

For each OData service `odata2ts` will generate one corresponding OData client.
It is generated so that we can bake all the domain knowledge from the metadata into the OData client.
In this way we can have a full-fledged and truly type-safe odata client, which:

- supports all CRUD (create, read, update, delete) operations for each entity
- supports bound and unbound operations (functions and actions)
- allows for fully type-safe queries by virtue of our query builder
- allows for reconfiguring (maybe even fixing) properties and entities
- supports type converters, e.g. `Edm.DateTimeOffset` to Luxon's `DateTime` object
- allows for renaming most aspects of the generated stuff

## Setup

If you've followed the [Getting Started Guide](../getting-started/use-case_full-service) for this
use case, then you already are good to go. Skip this section and go to TODO.

Install the runtime dependency `@odata2ts/odata-service`:

```bash npm2yarn
npm install --save @odata2ts/odata-service
```

You also need an [HTTP client](./http-client) to execute requests. The reference implementation is
the [axios-odata-client](./http-client/axios-odata-client) which you would also install as
runtime dependency:

```bash npm2yarn
npm install --save @odata2ts/axios-odata-client
```

## Configuration

Create the config file `odata2ts.config.ts` in the root folder of your project:

- set the `mode` option to `service` or `all`
- see [renaming entities and properties](../generator/configuration#renaming-entities-and-properties) to understand
  the `allowRenaming` setting
- for each OData service:
  - set the path to your downloaded metadata file
  - set the output folder for the generated stuff

:::caution

On each generation run the output folder of each specified service gets completely cleaned!
So create an own folder for each service and **never** use paths like `src`.

:::

Minimal example using the legendary [Trippin service](https://www.odata.org/odata-services/):

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

## Initialization

Initialize the main OData service by providing the http client implementation you have chosen and the `baseUrl`
which points to the root of your OData service:

```ts
// the generated main service
import { TrippinService } from "../build/trippin/TrippinService";
// the chosen http client implementation
import { AxiosODataClient } from "@odata2ts/axios-odata-client";

const baseUrl = "https://services.odata.org/TripPinRESTierService"
// initialize and, optionally, configure the http client
const odataClient = new AxiosODataClient();
// initialize the client service
const trippinService = new TrippinService(odataClient, baseUrl);
```

For each OData service you create one corresponding client service.
Each client service can and probably should be treated as singleton: You only need one instance of such a service
for your entire app.
