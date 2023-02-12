---
id: generated-artefacts
sidebar_position: 2
---

# Generated Artefacts

`odata2ts` is able to produce three different kinds of artefacts:

- models: TypeScript interfaces
- qobjects: magic q-objects
- service: service implementations to interact with the OData service

Each artefact type depends on the existence of the former artefact type.
So you can either generate

1. only models,
2. models and qobjects or
3. models, qobjects and services.

You control this aspect of the generation process with the `mode` setting,
which has an enum representation in the config file (`import { Modes } from "@odata2ts/odata2ts"`).

You find a detailed list of artefacts at the end of this page.

## Emit Modes

`odata2ts` supports generating JS / dts or TypeScript files. You control this with the `emitMode` option,
which has an enum representation in the config file (`import { EmitModes } from "@odata2ts/odata2ts"`).

By default, JS & dts files are emitted.

### Emitting Compiled JS / dts

Since the generation process only needs to run when your OData service changes (and therewith
its metadata), it makes sense to compile the generated stuff to JS / dts at that moment.
This unburdens your TS compiler when developing your app, as it is not required to compile
the generated code.

By default, `odata2ts` tries to use the `tsconfig.json` at root level for compilation.
You can specify the path to your TS config file via the option `tsconfig`.

You can also configure to produce only JS or only DTS files, whatever that use case may be.

### Emitting TypeScript

When setting the emitMode to TypeScript, you will need to include the output folder for TypeScript.

The easiest route would be to point the output directory to something like `src/generated/trippin`,
assuming that `src` is included in your TS config.

However, a cleaner approach would be an own directory like `gen-src/trippin` and the inclusion
of the `gen-src` folder in your `tsconfig.json`.

`odata2ts` allows to prettify the generated TS files via [prettier](https://prettier.io/).
When installed and configured, you just set the option `prettier` to `true`.

## Detailed List of Artefacts

- TypeScript Model Interfaces
  - per EntityType & ComplexType: Model including optional and required properties
  - per EntityType & ComplexType: Editable model versions for create, update, and patch operations
  - per EntityType: Model representing the entity id
  - Per Function / Action: Model representing all parameters of that operation
- Query Objects
  - per EntityType, ComplexType, EnumType, and any form of collection: QueryObject for querying
  - per EntityType: one id function to format and parse entity paths, e.g. `/Person(userName='russellwhyte')`
  - per function or action: QFunction or QAction to handle operation calls
- OData Client Service
  - one main odata service as entry point
  - per EntityType, ComplexType, and any form of collection: one service
