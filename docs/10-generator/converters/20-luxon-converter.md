---
id: luxon-converter
sidebar_position: 20
---

# Luxon Converter

[Luxon](https://moment.github.io/luxon) based [`odata2ts`](https://github.com/odata2ts/odata2ts) compatible converters for date and time related OData types.

User facing data types:

- [DateTime](https://moment.github.io/luxon/api-docs/index.html#datetime)
- [Duration](https://moment.github.io/luxon/api-docs/index.html#duration)

## Conversions

| OData Type           | Result Type | Converter Id                   | Description                                                                     |
| -------------------- | ----------- | ------------------------------ | ------------------------------------------------------------------------------- |
| `Edm.DateTimeOffset` | `DateTime`  | dateTimeOffsetToLuxonConverter |                                                                                 |
| `Edm.Date`           | `DateTime`  | dateToLuxonConverter           | Luxon's DateTime will still have the time part, which should be ignored by user |
| `Edm.TimeOfDay`      | `DateTime`  | timeOfDayToLuxonConverter      | Luxon's DateTime will still have the date part, which should be ignored by user |
| `Edm.Duration`       | `Duration`  | durationToLuxonConverter       |                                                                                 |

All result types are provided by Luxon.

## Installation

```shell npm2yarn
npm install --save @odata2ts/converter-luxon
```

Luxon is declared as peer dependency.

:::info

This converter expects, that Luxon itself has been already installed,
it doesn't pull Luxon automatically into your project. So if not already present, also install `luxon`.

:::

## Configuration

To integrate this converter into any `odata2ts` project, add it to the list of converters
within the project configuration file `odata2ts.config.ts`.
Converters are referenced by their package name, so in this case `@odata2ts/converter-luxon`.

For V2, the [v2-to-v4-converter](./v2-to-v4-converter) should also be installed to handle
V2 date times (Edm.DateTime) with Luxon as well. For V4 you just leave it out.

```typescript
import { ConfigOptions } from "@odata2ts/odata2model";

const config: ConfigOptions = {
  converters: ["@odata2ts/converter-v2-to-v4", "@odata2ts/converter-luxon"],
};

export default config;
```

### Select Converters

You can also choose to exactly specify which converters to use instead of automatically integrating all of them.
Instead of a simple string you specify an object where the converters are listed by their id.
These converter ids are listed in the [conversions table](#conversions).

```typescript
    ...
    converters: [
      {
        module: "@odata2ts/converter-luxon",
        use: ["dateTimeOffsetToLuxonConverter", "durationToLuxonConverter"],
      },
    ],
    ...
```
