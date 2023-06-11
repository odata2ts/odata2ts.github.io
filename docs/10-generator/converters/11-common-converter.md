---
id: common-converter
sidebar_position: 11
---

# Common Converters

A collection of converters for common use cases.

## Conversions

| OData Type           | Result Type      | Converter Id                  | Description                            |
| -------------------- | ---------------- | ----------------------------- | -------------------------------------- |
| `Edm.DateTimeOffset` | `Date`           | dateTimeOffsetToDateConverter | Conversion to JS' date instance        |
| `Edm.Duration`       | `SimpleDuration` | simpleDurationConverter       | Result type is provided by the package |
| `Edm.Int64`          | `bigint`         | int64ToBigIntConverter        | Converts to JS' built-in `bigint` type |

By default, only the `dateTimeOffsetToDateConverter` is included when the whole converter package is used.
It's rather intended to pick the converters you need.

### `SimpleDuration`

Converts duration string (e.g. `P12YT09H13S`) into a simple duration object:

```ts
export interface SimpleDuration {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}
```

Note: `seconds` can be a fraction to represent milliseconds, e.g. `23.123` = 23 sec and 123 ms

## Installation

```shell npm2yarn
npm install --save @odata2ts/converter-common
```

## Configuration

To integrate this converter into any `odata2ts` project, add it to the list of converters within the project configuration file `odata2ts.config.ts`.
Converters are referenced by their package name, so in this case `@odata2ts/converter-common`.

```typescript
import { ConfigOptions } from "@odata2ts/odata2ts";

const config: ConfigOptions = {
  converters: ["@odata2ts/converter-common"],
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
        module: "@odata2ts/converter-common",
        use: ["dateTimeOffsetToDateConverter", "simpleDurationConverter", "int64ToBigIntConverter"],
      },
    ],
    ...
```
