---
id: generator-setup
sidebar_position: 1
---

# Generator Setup

## Installation

Install the generator as dev dependency.

```bash npm2yarn
npm install --save-dev @odata2ts/odata2ts
```

## Generator Configuration

Create the file `odata2ts.config.ts` at the root level (where your `package.json` resides)
with the following contents:

```ts
import { ConfigFileOptions } from "@odata2ts/odata2ts";

const config: ConfigFileOptions = {
  services: {
    trippin: {
      sourceUrl: "https://services.odata.org/TripPinRESTierService",
      source: "resource/trippin.xml",
      output: "build/trippin",
    }
  }
}

export default config;
```

With this minimal configuration you define:

- the URL to the root of your OData service
- the path to the downloaded XML source
- the output folder

:::caution

On each generation run the output folder of each specified service gets completely cleaned!
So create an own folder for each service and **never** use paths like `src`.

:::

### Download Metadata File(s) Manually

Because it's a one time operation, if the OData service is not under development anymore,
you can also download the metadata files manually.

You just add `/$metadata` to the base path of the service. For example, for the publicly available Trippin service:
`https://services.odata.org/TripPinRESTierService/$metadata`.

Save the XML in an own file, e.g. `resource/trippin.xml`.

`odata2ts` can handle the generation process for multiple services.

## Build Configuration

This step is not required, but it's a good practice as it documents the capabilities of your
project for other developers (or yourself at a later point in time).

Edit your `scripts` block in `package.json`:

```json
{
  "scripts": {
    "gen-odata": "odata2ts",
    ...
  }
}
```

:::info

You probably also want to execute the generation before building your own package, so add it accordingly
to your build script as well.

:::

## Usage

Update your metadata file whenever the server changes.

Run the generation process whenever the metadata or your configuration changes.
With the `gen-odata` script:

```bash npm2yarn
npm run gen-odata
```

Alternatively, you can also run:

- with yarn: `yarn odata2ts`
- with npx (works for npm and yarn): `npx odata2ts`
