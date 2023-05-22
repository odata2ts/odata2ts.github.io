---
id: v2-to-v4-converter
sidebar_position: 10
---

# V2 to V4 Converter

Convert certain OData V2 types to their V4 analog.
Thus, other converters only need to take care of V4 data types.

## Conversions

| OData V2 Type  | Result Type          | Converter Id                      | Description                                                                                            |
| -------------- | -------------------- | :-------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Edm.DateTime` | `Edm.DateTimeOffset` | dateTimeToDateTimeOffsetConverter | Converts "/Date(123...)/" to ISO8601 "2022-02-22T12:00:00Z"; offsets are supported "/Date(123..+120)/" |
| `Edm.Byte`     | `number`             | stringToNumberConverter           |                                                                                                        |
| `Edm.SByte`    | `number`             | stringToNumberConverter           |                                                                                                        |
| `Edm.Single`   | `number`             | stringToNumberConverter           |                                                                                                        |
| `Edm.Double`   | `number`             | stringToNumberConverter           |                                                                                                        |
| `Edm.Time`     | `Edm.TimeOfDay`      | timeToTimeOfDayConverter          | Converts duration format to time format, e.g. `PT12H15M` to `12:15:00`                                 |
| `Edm.Time`     | `Edm.Duration`       | timeToDurationConverter           | Relabels `Edm.Time` to `Edm.Duration` (no conversion required); not a default converter                |

`Edm.Int64` & `Edm.Decimal` do not get converted to the `number` type as V4 does it;
they remain `string` types as they potentially don't fit into JS' number type with the implied precision loss.

## Installation

```shell npm2yarn
npm install --save @odata2ts/converter-v2-to-v4
```

## Configuration

To integrate this converter into any `odata2ts` project, add it to the list of converters within the project configuration file `odata2ts.config.ts`.
Converters are referenced by their package name, so in this case `@odata2ts/converter-v2-to-v4`.

```typescript
import { ConfigOptions } from "@odata2ts/odata2model";

const config: ConfigOptions = {
  converters: ["@odata2ts/converter-v2-to-v4"],
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
        module: "@odata2ts/converter-v2-to-v4",
        use: ["dateTimeToDateTimeOffsetConverter", "stringToNumberConverter", "timeToDurationConverter"],
      },
    ],
    ...
```

## Notes on `Edm.Time`

By default `Edm.Time` is converted to `Edm.TimeOfDay`, since that is what I believe the spec intended it to mean.
However, it can also be used to mean a duration. In that case you could use the `timeToDurationConverter` by
selecting converters (see chapter "Select Converters").

`Edm.Time` has an unfortunate definition: On the one hand the spec states that it is intended to represent
a certain time of a day, but on the other hand it is defined as duration.
Formally, it adheres to the [ISO8601 duration format](https://en.wikipedia.org/wiki/ISO_8601#Durations),
but restricts it to the time part (actually, the formal spec allows for day durations,
so that `P12D` (12 days) would be valid, which is not representable as time of day).

However, durations and times are two different things. A duration might span days, weeks, etc.
(and Edm.Time nearly correctly restricts this) and a duration only needs to specify one part,
e.g. PT12S (12 seconds) is a valid duration. In contrast, the time part of an ISO 8601 DateTime format
requires the specification of hours and minutes as minimum, e.g. "12:15".

I think that these are the reasons why `Edm.Time` was replaced in V4 by `Edm.TimeOfDay`
and `Edm.Duration`.
