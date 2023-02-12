---
id: generator-overview
sidebar_position: 1
---

# Overview

The package `@odata2ts/odata2ts` realizes the generation process for all types of artefacts.
It uses the metadata description of an OData service as its source to generate three different kinds
of artefacts:

- TypeScript models
- magic q-objects
- complete client services

## Setup

The base setup for the generator is part of the getting started guide: [Generator Setup](../getting-started/generator-setup)

## Usage

The generator is a command line program called ... drum rolls... odata2ts.
As such it is called via script in package.json or directly via npx or yarn.

`odata2ts` doesn't necessarily requires a config file, since the essential settings are available as CLI options.
However, the pure CLI usage is restricted to generating only one service. With the help of the config file,
you centralize all your settings, allow for handling the generation for multiple services and have type-safety
and a documentation at your fingertips.

For each OData service two settings must be specified:

- source: the downloaded metadata file
- output: the output directory for the generated files

### Pure CLI usage

```
 // package.json script
 scripts: {
   ...
   "gen-odata": "odata2ts -s resource/trippin.xml -o build/trippin"
 }
 // then from command line
 npm run gen-odata
```

```
// directly from command line via npx or yarn
yarn odata2ts -s resource/trippin.xml -o build/trippin
```

### With Config file

Create a file at the root of your project (where `package.json` resides)
and call it: `odata2ts.config.ts`. Create a variable of type `ConfigFileOptions`
and default export it.

You get types and enums from the generator package `@odata2ts/odata2ts`.

The following example demonstrates the minimal configuration needed to integrate two OData services:

```ts
import { ConfigFileOptions } from "@odata2ts/odata2ts";

const config: ConfigFileOptions = {
  services: {
    northwind: {
      source: "resource/northwind.xml",
      output: "build/northwind",
    },
    trippin: {
      source: "resource/trippin.xml",
      output: "build/trippin",
    }
  }
}
export default config;
```

With this configuration in place, we can now call `odata2ts` without any options.
Since we've specified two services, `odata2ts` will generate stuff for both of them.
For example, with yarn:

```shell
yarn odata2ts
```

Additionally, individual services can be addressed as arguments:

```shell
yarn odata2ts northwind
yarn odata2ts northwind trippin
```
