---
id: converters
sidebar_position: 20
---

# Converters

While some OData types (`Edm.String`, `Edm.Boolean`, ...) can easily and perfectly be mapped to native JS types,
more advanced types are simply strings:

- `Edm.DateTimeOffset`: `"1999-31-12T23:59:59Z"`
- `Edm.Duration`: `"PT10H"`

As you can imagine, there are countless third-party libs and custom data structures
which could be used in these cases. Thus, the choice of how to map data types
must be left open to the user.

To support different converters and stay open to custom converter implementations
`odata2ts` supports a plugin architecture. So you install only those converters you need
and configure them in the config file.

Furthermore, you are invited to roll your own converters.
The `converter-api` package specifies the interfaces to implement and the data structures to return.
You can use the existing converters as example.

## Provided Converters

The following converters are provided by `odata2ts`.

### General Purpose

- [v2-to-v4-converter](./v2-to-v4-converter)
  - V2 numeric types are converted from `string` to `number`
  - `Edm.Int64` and `Edm.Decimal` are also converted
  - `Edm.DateTime` is converted to `Edm.DateTimeOffset`, i.e. proper ISO 8601 date and time presentation
  - `Edm.Time` is by default converted to `Edm.TimeOfDay` (ISO 8601 time), but can also be relabeled as `Edm.Duration`
- [UI5 V2 Converters](./ui5-v2-converter)
  - type alignment with UI5 V2 ODataModel (`sap.ui.model.odata.v2.ODataModel`)

### Date and Time Handling

- [Common Converters](./common-converter)
  - `Edm.DateTimeOffset`: JavaScript `Date` type
  - `Edm.Duration`: simple duration object
- [Luxon Converters](./luxon-converter)
  - `Edm.DateTimeOffset`: Luxon's `DateTime` type
  - `Edm.Date`: Luxon's `DateTime` type
  - `Edm.TimeOfDay`: Luxon's `DateTime` type
  - `Edm.Duration`: Luxon's `Duration` type

### Number Handling

- [Common Converters](./common-converter)
  - `Edm.Int64`: JavaScript `bigint` type
- [BigNumber Converter](./big-number-converters)
  - `Edm.Int64`: `BigNumber` type from bignumber.js
  - `Edm.Decimal`: `BigNumber` type from bignumber.js
- [Decimal Converter](./big-number-converters)
  - `Edm.Int64`: `Decimal` type from decimal.js
  - `Edm.Decimal`: `Decimal` type from decimal.js

## About Converters

Consumers of an OData service need to handle the data types known to OData and in this regard
also need to take into account which OData version is used, because there are quite some
differences between V2 and V4.

Converters allow to use a different representation for a given data type by converting
from and to the OData type. For example, the type `Edm.DateTimeOffset` represents a certain
point in time by using the ISO 8601 DateTime format; we might want to use a JS Date object
instead. So the converter would do the following conversions:

- convert from the OData type to JS Date
- convert from JS Date to the OData type

With the help of converters the consumer then only needs to handle JS date objects.
Furthermore, converters can also remedy the different representations of V2 and V4
(see [@odata2ts/v2-to-v4-converter](https://www.npmjs.com/package/@odata2ts/converter-v2-to-v4)).

## Converter Setup

To use converters in the generation process of `odata2ts`, you first have to install them:

```shell npm2yarn
npm install --save @odata2ts/v2-to-v4-converter
```

Then you configure them via the config file `odata2ts.config.ts`:

```ts
import { ConfigFileOptions } from "@odata2ts/odata2ts";

// minimal case: only one converter package is configured, nothing else
const config: ConfigFileOptions = {
  converters: ["@odata2ts/v2-to-v4-converter"]
}
export default config;
```

This would use the default list of converters specified in the v2-to-v4-converter module.
To only use specific converters of that package, we require a different syntax:

```ts
  ...
  converters: [
    {
      module: "@odata2ts/v2-to-v4-converter",
      use: ["dateTimeToDateTimeOffsetConverter", "stringToNumberConverter"]
    },
    "@odata2ts/luxon-converter"
  ]
  ...
```

Each converter package must list the converters it offers and a unique identifier for each converter.
This unique identifier is listed here via the `use` parameter.

### The Order of Converters

Multiple converters may specify the same source type. In this case the last specified converter wins.

### Converter Chains

The given list of converters will get evaluated by `odata2ts`, so that converter chains are automatically created.

The starting point for any converter chain must be an OData type, since that's what we get from the OData service.
So for each OData type we check if a converter was specified.
If so, we check with the resulting data type for the next converter and so forth.

## Creating Your Own Converter Module

Converters live in their own modules with their own `package.json`.
Multiple converters can reside in one converter module.

So you need to set up an own module first and don't forget the `main` attribute in the `package.json`.
Compare existing converter implementations.

### Installation

```shell npm2yarn
npm install --save @odata2ts/converter-api
```

If you want to use enums for referencing OData types, which is recommended, then also install:

```shell npm2yarn
npm install --save @odata2ts/odata-core
```

### Writing a Converter

You should implement the interface `ValueConverter<SourceType, TargetType>`,
where "SourceType" is the JS type of the OData type you want to convert from
and "TargetType" is the JS type of the new data type you want to convert to.

Let's take the following conversion as example here:
From OData's date time type ("2022-12-31T12:15:00Z") to JS' Date object.
So we get the following converter: `ValueConverter<string, Date>`.

You require:

- id: this must match exactly the name of your exported variable, since it is used to import this converter from your module
- from: the data type(s) you want to convert from, in this case `Edm.DateTimeOffset`
- to: the data type of your choice, in this case `Date`
- convertFrom: conversion from OData type
- convertTo: conversion to OData type

```ts
import { ParamValueModel, ValueConverter } from "@odata2ts/converter-api";
import { ODataTypesV4 } from "@odata2ts/odata-core";

export const myConverter: ValueConverter<string, Date> = {
  id: "myConverter",
  from: ODataTypesV4.DateTimeOffset, // or just "Edm.DateTimeOffset"
  to: "Date",
  convertFrom: (value: ParamValueModel<string>): ParamValueModel<Date> => {
    return typeof value !== "string" ? value : new Date(value);
  },
  convertTo: (value: ParamValueModel<Date>): ParamValueModel<string> => {
    return !value ? value : value.toISOString();
  }
}
```

The `ParamValueModel<Type>` makes sure that `null` and `undefined` are valid values:

- `null` is simply allowed as value
- `undefined` is used to signal that the conversion failed

Attribute `from` can be a list of types.

### About Data Types

The handling of data types within the ValueConverter is a bit special, but follows these rules:

- the types of JS data types are just written as strings: `"number"`, `"string"`, `"Date"`, ...
- OData Types always have the prefix "Edm.", e.g. `"Edm.String"`, `"Edm.DateTimeOffset"`, ...
  - enums for V2 and V4 data types are available via `@odata2ts/odata-core`
- Third-party data types (need to be imported before usage) specify their module as prefix separated by a dot, e.g. `"luxon.Duration"`
  - `"module.DataType"` becomes `import { DataType } from "module"`;

### The Module Export

Each converter module must have a default export or alternatively an export called `config`.
The type of this export is `ConverterPackage`, which requires an ID and a list
of those converters that should be used by default.

Additionally, all available converters must be exported individually.
The export name must match the id of the converter.

```ts
import { ConverterPackage } from "@odata2ts/converter-api";
import { myConverter } from "./MyConverter"

export const config: ConverterPackage = {
  id: "MyConverters",
  converters: [myConverter]
}
export {
  myConverter
}
```
