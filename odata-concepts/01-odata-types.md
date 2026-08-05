---
id: odata-types
title: OData Data Types
sidebar_position: 1
---

# About OData's Data Types

The data types in OData V2 are a mess regarding date and time types. But hey, that's somehow true even for
major languages like Java before a certain version (when Joda was still with us).

This page is dedicated to list the data types for V2 and V4, contrast them with each other and
illustrate them with examples; yeah well, and rant a bit about specification flaws at the end.

Here are the main differences between V2 and V4 data types:

| OData Type         | V2      | Format (V2)                                                      | V4      | Format (V4)                                                      |
| ------------------ | ------- | ---------------------------------------------------------------- | ------- | ---------------------------------------------------------------- |
| Edm.String         | string  | —                                                                | string  | —                                                                |
| Edm.Boolean        | boolean | `true` / `false`                                                 | boolean | `true` / `false`                                                 |
| Edm.Int16          | number  | e.g. `42`                                                        | number  | e.g. `42`                                                        |
| Edm.Int32          | number  | e.g. `123456`                                                    | number  | e.g. `123456`                                                    |
| Edm.Byte           | string  | e.g. `"255"`                                                     | number  | e.g. `255`                                                       |
| Edm.SByte          | string  | e.g. `"-128"`                                                    | number  | e.g. `-128`                                                      |
| Edm.Int64          | string  | e.g. `"9007199254740993"`                                        | number  | e.g. `9007199254740993`                                          |
| Edm.Single         | string  | e.g. `"3.14"`                                                    | number  | e.g. `3.14`                                                      |
| Edm.Double         | string  | e.g. `"3.1415926535"`                                            | number  | e.g. `3.1415926535`                                              |
| Edm.Decimal        | string  | e.g. `"123.45"`                                                  | number  | e.g. `123.45`                                                    |
| Edm.Binary         | string  | Base64-encoded string                                            | string  | Base64-encoded string                                            |
| Edm.Stream         | —       | —                                                                | —       | Stream access, not represented as JS value                       |
| Edm.DateTimeOffset | string  | `/Date(<milliseconds>±HHmm)/`, e.g. `/Date(1672485300000+0100)/` | string  | ISO 8601 date-time with offset, e.g. `2022-12-31T12:15:00+01:00` |
| Edm.Date           | —       | —                                                                | string  | `yyyy-MM-dd`, e.g. `2022-12-31`                                  |
| Edm.TimeOfDay      | —       | —                                                                | string  | `HH:mm:ss[.fffffff]`, e.g. `12:15:00`                            |
| Edm.Duration       | —       | —                                                                | string  | ISO 8601 duration, e.g. `P12DT12H15M`                            |
| Edm.Time           | string  | ISO 8601 duration restricted to the day part, e.g. `PT12H15M`    | —       | —                                                                |
| Edm.DateTime       | string  | `/Date(<milliseconds>)/`, e.g. `/Date(1672485300000)/`           | —       | —                                                                |

As you can see:

- All values are simple in the end: When in doubt it's a string!
  - easily serializable
  - not cool for end user to use in raw form
- In V2 most number types are just strings, V4 makes that better
- Date and Time types are a story of their own

## V4 Data Types

| OData V4 Type      | Description                                                         | URL format | URL Example                                         | JSON type             |
| ------------------ | ------------------------------------------------------------------- | ---------- | :-------------------------------------------------- | --------------------- |
| Edm.Boolean        | boolean value                                                       | literal    | true<br/>false                                      | boolean               |
| Edm.String         | string value                                                        | quoted     | 'Some Test'                                         | string                |
| Edm.Byte           | unsigned 8-bit integer value                                        | literal    | 1                                                   | number                |
| Edm.SByte          | signed 8-bit integer value                                          | literal    | -1                                                  | number                |
| Edm.Int16          | signed 16-bit integer value                                         | literal    | 123                                                 | number                |
| Edm.Int32          | signed 32-bit integer value                                         | literal    | 123                                                 | number                |
| Edm.Int64          | signed 64-bit integer value                                         | literal    | 123                                                 | number                |
| Edm.Single         | floating point number with 7 digits precision                       | literal    | 1.1                                                 | number                |
| Edm.Double         | floating point number with 15 digits precision                      | literal    | 1.2                                                 | number                |
| Edm.Decimal        | numeric values with arbitrary precision and scale                   | literal    | 12.22                                               | number                |
| Edm.Guid           | 16-byte (128-bit) unique identifier value                           | literal    | ...                                                 | string                |
| Edm.Duration       | duration                                                            | literal    | PT12H59M10S<br/> P1Y<br/> PT12.123S                 | string                |
| Edm.TimeOfDay      | specific time of day                                                | literal    | 12:59:10<br/>12:15<br/> 12:15:03.123                | string                |
| Edm.Date           | specific day                                                        | literal    | 2022-12-31                                          | string                |
| Edm.DateTimeOffset | specific point in time                                              | literal    | 2022-12-31T23:59:59Z<br/> 2022-12-31T23:59:59+02:00 | string                |
| Edm.Binary         | fixed or variable length binary data                                |            |                                                     | base64 encoded string |
| Edm.Stream         | most filter operations don't work here<br/> also exclusive handling |            |                                                     |                       |
| Edm.Geography.\*   |                                                                     |            |                                                     |                       |
| Edm.Geometry.\*    |                                                                     |            |                                                     |                       |

### Conclusions

- Sensible data types especially regarding date and time types
- The one exception are big number types: `Edm.Double` and `Edm.Decimal`
  - V4 overreached there a bit, as Decimal and Double could lose precision unnoticed when converted to JS Number
  - you have to use a special header to turn these types into strings again

## V2 Data Types

The special thing about V2 OData services is, that we have to differentiate between using
OData types in the URL or in JSON, since they are formatted differently:

- URL: values in filter queries ($filter) or function parameters (which are query parameters)
- JSON: values in request or response bodies

The following table lists information about all V2 data types according to the official resources used.

For URL usage, see chapter 6 "Primitive Data Types" of the
[V2 overview document](https://www.odata.org/documentation/odata-version-2-0/overview/).
This is the most authoritative resource despite it's lack of being a true specification.

For JSON usage, see chapter 4 "Primitive Types" of the document about the
[V2 JSON format](https://www.odata.org/documentation/odata-version-2-0/json-format/).

| OData V2 Type      | Description                                       | URL format                   | URL example                          | JSON type             | JSON example                |
| ------------------ | ------------------------------------------------- | ---------------------------- | :----------------------------------- | --------------------- | --------------------------- |
| Edm.Boolean        | boolean value                                     | literal                      | true                                 | boolean               | true                        |
| Edm.String         | string value                                      | quoted                       | 'test'                               | string                | "test"                      |
| Edm.Byte           | unsigned 8-bit integer value                      | literal                      | 1                                    | string                | "1"                         |
| Edm.SByte          | signed 8-bit integer value                        | literal                      | -1                                   | string                | "-1"                        |
| Edm.Int16          | signed 16-bit integer value                       | literal                      | 123                                  | number                | 123                         |
| Edm.Int32          | signed 32-bit integer value                       | literal                      | 123                                  | number                | 123                         |
| Edm.Int64          | signed 64-bit integer value                       | type suffix "L"              | 123L                                 | string                | "123"                       |
| Edm.Single         | floating point number with 7 digits precision     | type suffix "f"              | 1.1f                                 | string                | "1.1"                       |
| Edm.Double         | floating point number with 15 digits precision    | type suffix "d"              | 1.2d                                 | string                | "1.2"                       |
| Edm.Decimal        | numeric values with arbitrary precision and scale | type suffix "M" or "m"       | 12.22M                               | string                | "12.22                      |
| Edm.Guid           | 16-byte (128-bit) unique identifier value         | type prefix "guid"           | guid'xxx...'                         | string                | "xxx..."                    |
| Edm.Time           | day time duration representing time of day        | type prefix "time"           | time'PT12H59M10S'                    | string                | "PT12H59M10S"               |
| Edm.DateTime       | specific point in time                            | type prefix "datetime"       | datetime'2022-12-31T23:59:59'        | string                | "/Date(123...)/"            |
| Edm.DateTimeOffset | specific point in time                            | type prefix "datetimeoffset" | datetimeoffset'2022-12-31T23:59:59Z' | string                | "2022-12-31T23:59:59+01:00" |
| Edm.Binary         | fixed or variable length binary data              | type prefix "X" or "binary"  | binary'23A'                          | base64 encoded string | "..."                       |

### Oddities

Edm.DateTime is quite special in multiple ways:

1. URL and JSON representation are completely different
2. the JSON representation has quite a unique format
3. Edm.DateTime is not really consistent with Edm.DateTimeOffset

Another oddity is Edm.Time, since it is defined as duration (by the way, the static "P" stands for "period").
Now the "spec" states, that it should represent a specific time of day and refers to the "day time duration" as
definition.

I think that the definition is flawed for two reasons.
First, ["day time duration"](https://www.w3.org/TR/xmlschema11-2/#nt-duDTFrag) also allows for specifying
a period of days, which doesn't overlap with time of day.
Second, a duration might be able to represent a time of day, in the sense that a duration of 6 hours and
12 minutes might also represent "06:12", but both data types usually have different restrictions.
Time of day requires the specification of hours and minutes, while duration might specify any of its
parts, e.g. only seconds "PT12S".
