---
id: use-case_data-models
sidebar_position: 10
---

# Use Case: Data Models

In the most simple case you are only interested in TypeScript interfaces, representing input and output
models of the given OData service.

## Runtime Dependencies

None. The generated interfaces do not have any dependencies themselves.

## Generation Settings

Adapt your config file `odata2ts.config.ts`: Set the `mode` option to `models`.
The following example highlights the central settings for this use case:

```ts
import { ConfigFileOptions, EmitModes, Modes } from "@odata2ts/odata2ts";

const config: ConfigFileOptions = {
  mode: Modes.models,
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

Via the `skipXXX` options you can tell `odata2ts` to not generate model interfaces for certain things.

## Usage

Update your metadata file if necessary.

Run `yarn gen-odata` or `npm run gen-odata` to trigger the generation process.

Now you can use the generated models in your code by importing them from the configured build folder.
