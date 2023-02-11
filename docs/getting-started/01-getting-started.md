---
id: getting-started
sidebar_position: 1
---

# Base Setup

This setup procedure is required for any use case.

## Installation

Install the generator as dev dependency.

```
yarn add --dev @odata2ts/odata2ts
```

## Download Metadata File

Download the metadata description file of your OData service.

You just add `/$metadata` to the base path of the service. For example, the publicly available Trippin service
has the following base path: `https://services.odata.org/TripPinRESTierService`. So we will use
`https://services.odata.org/TripPinRESTierService/$metadata`.

Save the XML in an own file, e.g. `resource/trippin.xml`.

## Configuration

Edit your `scripts` block in `package.json`:

```json
{
  "scripts": {
    "gen-odata": "odata2ts",
    ...
  }
}
```

NOTE: you'll probably also want to execute the generation before building your own package, so add it accordingly
to your build script as well.

Create the file `odata2ts.config.ts` at the root level (beside `package.json`)
with the following contents:

```ts
import { ConfigFileOptions } from "@odata2ts/odata2ts";

const config: ConfigFileOptions = {
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

Update your metadata file if necessary.

Run `yarn gen-odata` or `npm run gen-odata` to trigger the generation process.
