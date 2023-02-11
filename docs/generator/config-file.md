---
id: config-file
title: Config File
sidebar_position: 2
---

Create a file at the root of your project (beside package.json)
and call it: `odata2ts.config.ts`.

None of the options are required, so here is just an example:

```ts
import { ConfigFileOptions, EmitModes } from "@odata2ts/odata2ts";

const config: ConfigFileOptions = {
  debug: true,
  emitMode: EmitModes.ts,
  prettier: true,
  converters: ["@odata2ts/v2-to-v4-converter"],
  services: {
    northwind: {
      source: "src/odata/northwind.xml",
      output: "build/northwind",
      serviceName: "StrongWind"
    }
  }
}
export default config;
```

As you can see, enums are provided for `emitMode` and the same goes for the `mode` option.

The usage of converters is documented in the [converter-api](https://github.com/odata2ts/converter/tree/main/packages/converter-api).
