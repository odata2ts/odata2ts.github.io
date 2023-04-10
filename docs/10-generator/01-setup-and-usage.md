---
id: setup-and-usage
sidebar_position: 1
---

# Setup & Usage

The package `@odata2ts/odata2ts` realizes the generation process and as such is the heart of the `odata2ts` system.
It uses the metadata description of an OData service (V2 and V4) as its source to generate different sorts
of artefacts that you can use in your TypeScript code.

## Setup

The base setup for the generator is part of the getting started guide: [Generator Setup](../getting-started/generator-setup).
So if you're already set up, go to [usage](#Usage)

Install the generator as dev dependency with the weapon of your choice:

```bash npm2yarn
npm install --save-dev @odata2ts/odata2ts
```

### Build Integration

Usually you would not commit the generated stuff, but generate it as part of your build.

Typically, you use the "scripts" block of the `package.json` along these lines:

```json
{
  "scripts": {
    "gen-odata": "odata2ts",
    "build": "odata2ts && ORIGINAL_BUILD_COMMAND"
  }
}
```

## Configuration

For each OData service two settings must be specified:

- source: the downloaded metadata file
- output: the output directory for the generated files; warning: this folder gets wiped on generation

`odata2ts` doesn't necessarily requires a config file, since the essential settings are available as CLI options.
However, the pure CLI usage is restricted to generating only one service. With the help of the config file,
you centralize all your settings, allow for handling the generation for multiple services and have type-safety
and a documentation at your fingertips. In other words, it's highly recommended to use the config file.

:::caution

On each generation run the output folder of each specified service gets completely cleaned!
So make up an own folder for each service and **never** use paths like `src`.

:::

### Config File

Create a file at the root of your project (where `package.json` resides)
and call it: `odata2ts.config.ts`. Create a variable of type `ConfigFileOptions`
and default export it.

You get types and enums from the generator package `@odata2ts/odata2ts`.

The following example demonstrates the minimal configuration needed to generate typings
for two OData services:

```ts
import { ConfigFileOptions, Modes } from "@odata2ts/odata2ts";

const config: ConfigFileOptions = {
  mode: Modes.models,
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

## Usage

With the configuration file in place, we can simply call `odata2ts` without any options.
For example, with yarn:

```shell
yarn odata2ts
```

Since the config file is able to handle multiple services, you may use arguments to address
one or more of these services (without arguments all configured services get generated):

```shell
yarn odata2ts northwind
yarn odata2ts northwind trippin
```

### Pure CLI usage

Without the config file you need to set the two required settings via options:

| Setting | Option   | Shorthand |
| ------- | -------- | --------- |
| source  | --source | -s        |
| output  | --output | -o        |

```shell
yarn odata2ts -s resource/trippin.xml -o build/trippin
```

Of course, you can always use any CLI option to override any other settings.
See [./configuration#cli-options] for a listing of all available CLI options.
