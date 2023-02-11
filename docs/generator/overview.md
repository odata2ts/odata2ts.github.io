---
id: generator-overview
sidebar_position: 1
---

# The Generator

The package `@odata2ts/odata2ts` realizes the generation process for all types of artefacts.
It uses the metadata description of an OData service as its source.

Generate TypeScript models, query objects and / or complete client services from a given metadata description of an OData service.

## Installation

```
npm install --save-dev @odata2ts/odata2ts

yarn add --dev @odata2ts/odata2ts
```

## Download Metadata File(s)

Download the metadata description file of your OData service.

You just add `/$metadata` to the base path of the service, e.g. https://services.odata.org/V4/Northwind/Northwind.svc/$metadata.
<br/>Save the XML in an own file, e.g. `resource/northwind.xml`.

`odata2ts` can handle the generation process for multiple services.

## Usage

`odata2ts` is the main command which is called via script in package.json, or directly via npx or yarn:

```
 // package.json script
 scripts: {
   ...
   "gen-odata": "odata2ts -s src/odata/northwind.xml -o build/northwind"
 }
 // then from command line
 npm run gen-odata
```

```
// directly from command line via npx or yarn
yarn odata2ts -s src/odata/northwind.xml -o build/northwind
```

These usage examples highlight the minimal configuration which is required for each OData service:

- source: the downloaded metadata file
- output: the output directory for the generated files

### Config file: `odata2ts.config.ts`

Instead of specifying these or other parameters via the command line you can use a config file written in TypeScript.
It centralizes all configurations and allows for handling multiple OData services:

```ts
import { ConfigFileOptions } from "@odata2ts/odata2ts";

const config: ConfigFileOptions = {
  services: {
    northwind: {
      source: "src/odata/northwind.xml",
      output: "build/northwind",
    },
    trippin: {
      source: "src/odata/trippin.xml",
      output: "build/trippin",
    }
  }
}
export default config;
```

With this configuration in place, we can now call `odata2ts` without any options.
Additionally, individual services can be addressed as arguments:

```
yarn odata2ts                      // start generation process for all configured services
yarn odata2ts northwind            // start generation process for one specific service
yarn odata2ts northwind trippin    // start generation process for multiple services
```

## Generated Artefacts

The following artefacts can be generated based on `mode` configuration:

- TypeScript model interfaces
  - per EntityType & ComplexType: Model including optional and required properties
  - per EntityType & ComplexType: Editable model versions for create, update, and patch operations
  - per EntityType: Model representing entity id
  - Per Function / Action: Model representing all parameters of that operation
- Query Objects
  - per EntityType, ComplexType, EnumType, and any form of collection: QueryObject for querying
  - per EntityType: one id function to format and parse entity paths, e.g. `/Person(userName='russellwhyte')`
  - per function or action: QFunction or QAction to handle operation calls
- OData Client Service
  - one main odata service as entry point
  - per EntityType, ComplexType, and any form of collection: one service

Each artefact type depends on the existence of the former artefact type. So you can either generate

1. only models,
2. models and qobjects or
3. models, qobjects and services.

### Default Settings vs Base Settings vs Service Settings

The [defaultConfig](https://github.com/odata2ts/odata2ts/blob/main/packages/odata2ts/src/defaultConfig.ts) lists all default values, which are always used.

All settings except the `services` attribute are **base settings**, which will also be used as default settings,
i.e. on top of the defaultConfig.

All settings starting from the `services` attribute are only valid for a specific service and only applied
for its generation run. Service specific settings are applied on top of the base settings.

Additionally, CLI options can be used to override base or service settings.
