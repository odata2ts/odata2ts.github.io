---
id: generator-setup
sidebar_position: 1
---

# Generator Setup

## Download Metadata File(s)

Download the metadata description file of your OData service.

You just add `/$metadata` to the base path of the service. For example, for the publicly available Trippin service:
`https://services.odata.org/TripPinRESTierService/$metadata`.

Save the XML in an own file, e.g. `resource/trippin.xml`.

`odata2ts` can handle the generation process for multiple services.

## Installation

Install the generator as dev dependency.

```
yarn add --dev @odata2ts/odata2ts
```

## Generator Configuration

Create the file `odata2ts.config.ts` at the root level (where your `package.json` resides)
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

With this minimal configuration you define:

- the path to the downloaded XML source
- the output folder

## Build Configuration

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

## Usage

Update your metadata file whenever the server changes.

Run `yarn gen-odata` or `npm run gen-odata` to trigger the generation process.
