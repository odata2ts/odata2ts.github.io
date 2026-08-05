---
id: ui5-v2-converter
sidebar_position: 50
---

# UI5 V2 ODataModel Converter

Converter package for interoperability between [odata2ts](https://github.com/odata2ts/odata2ts) and
SAP's V2 ODataModel (`sap.ui.model.odata.v2.ODataModel`).

The `ODataModel` is not only responsible for the REST communication, but also takes care of data type conversion.
This converter package supplies `odata2ts` with all converters needed to use the same types as the `ODataModel` does.

This way you get the correct types, when generating model types which represent `sap.ui.model.odata.v2.ODataModel`
values. On the other hand, it also allows you to use the generated OData client in combination with the `ODataModel`.

## Conversions

This package adds only one special converter for converting `Edm.Time` to a custom object which holds the milliseconds
since midnight. All other converters are imported from other packages:

- converter-v2-to-v4
- converter-common

| OData Type           | JSON Rep. | Format                                           | Result Type      | Uses                                                                |
| -------------------- | --------- | ------------------------------------------------ | ---------------- | ------------------------------------------------------------------- |
| `Edm.DateTime`       | `string`  | `/Date(timestamp)/`                              | `Date`           | dateTimeToDateTimeOffsetConverter<br/>dateTimeOffsetToDateConverter |
| `Edm.DateTimeOffset` | `string`  | ISO 8601 Date and Time<br/>with offsets          | `Date`           | dateTimeOffsetToDateConverter                                       |
| `Edm.Time`           | `string`  | ISO 8601 Duration<br/>(limited to the time part) | `{ ms: number }` | timeToMsDurationConverter                                           |
| `Edm.Byte`           | `string`  |                                                  | `number`         | stringToNumberConverter                                             |
| `Edm.SByte`          | `string`  |                                                  | `number`         | stringToNumberConverter                                             |
| `Edm.Single`         | `string`  |                                                  | `number`         | stringToNumberConverter                                             |
| `Edm.Double`         | `string`  |                                                  | `number`         | stringToNumberConverter                                             |

## Installation

```shell npm2yarn
npm install --save @odata2ts/converter-ui5-v2
```

## Configuration

To integrate this converter into any `odata2ts` project, add it to the list of converters
within the project configuration file `odata2ts.config.ts`.
Converters are referenced by their package name, so in this case `@odata2ts/converter-ui5-v2`.

```typescript
import { ConfigOptions } from "@odata2ts/odata2ts";

const config: ConfigOptions = {
  converters: ["@odata2ts/converter-ui5-v2"],
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
        module: "@odata2ts/converter-ui5-v2",
        use: ["dateTimeToDateTimeOffsetConverter", "dateTimeOffsetToDateConverter"],
      },
    ],
    ...
```
