---
id: filtering
sidebar_position: 10
---

# Filtering

OData specifies numerous filter operators and functions and `odata2ts` implements most of them.
The filter capabilities are grouped into the following categories:

- [Logical Operators](#logical-operators): `and`, `or` and `not`
- [Common Operators](#common-operators): equality and comparison
- [Arithmetic Operators](#arithmetic-operators): basic math operations
- [Type Specific Functions](#type-specific-functions): operators which depend on the data type

:::caution

Keep in mind that OData services don't have to provide for all filter capabilities.
When using an unsupported filter operation the OData service should respond with status code
`406 Not Implemented`, but might also return `500 Server Error`.

:::

## Basics

### Query Objects

`Query Objects` represent functional twins of the entities known from
your OData service. You use them directly within the filter part of the query
to work with their properties which provide the filter operations.

```ts
import { qPerson } from "../generated/trippin/QTrippin";

builder
  .filter(
    // here we see the query object "qPerson" in action
    qPerson.lastName.startsWith("Why"),
    // each property offers only filter operations suited to the given type of the property
    qPerson.age.plus(5).lt(30)
  )
  .build();
```

See [Q-Objects](../q-objects) for more detailed explanations.

### Custom Filter Expressions

The filter operation is fed with `QFilterExpression` objects, e.g. `qPerson.age.gt(18)` produces such a filter expression.
You can also create them manually to write raw filter expressions:

```ts
import { QFilterExpression } from "@odata2ts/odata-query-objects";

builder.filter(new QFilterExpression("LastName eq 'Smith'"), qPerson.age.gt(18)).build();
```

Non-encoded result: `People?$filter=LastName eq 'Smith' and Age gt 18`

:::info

This is only meant as an escape hatch.
If you need to use it, you should probably also file a bug / issue via Github.

:::

## Logical Operators

The `filter` operation accepts multiple filter expressions and can also be called multiple times.
In these cases filter expressions are concatenated by the `and` operator.

You control this aspect via the filter expression itself, since any `QFilterExpression` provides for
the logical operators:

- `and`
- `or`
- `not`

```ts
builder.filter(
  qPerson.lastName.eq("Smith")
    .or(qPerson.firstName.eq("Rumpelstilzchen"))
    .not()
)
```

Result: `$filter=not(LastName eq 'Smith' or FirstName eq 'Rumpelstilzchen')`

Admittedly, the usage of `not` at the end of the expression is a little weired.

Specification: OData V4 URL Conventions on [Logical Operators](https://docs.oasis-open.org/odata/odata/v4.01/os/part2-url-conventions/odata-v4.01-os-part2-url-conventions.html#sec_LogicalOperators).

## Common Operators

All operations listed here are valid for all data types:

| Operator Name(s)     | Example Usage                   | Produced OData Query       |
| -------------------- | ------------------------------- | -------------------------- |
| eq<br/>equals        | `q.lastName.eq("Whyte")`        | `LastName eq 'Whyte'`      |
| ne<br/>notEquals     | `q.lastName.notEquals("Whyte")` | `LastName ne 'Whyte'`      |
| in                   | `q.age.in(30, 31)`              | `(Age eq 30 or Age eq 31)` |
| ge<br/>greaterEquals | `q.age.greaterEquals(30)`       | `Age ge 30`                |
| gt<br/>greaterThan   | `q.age.gt(30)`                  | `Age gt 30`                |
| le<br/>lowerEquals   | `q.age.le(30)`                  | `Age le 30`                |
| lt<br/>lowerThan     | `q.age.lt(30)`                  | `Age lt 30`                |
| isNull               | `q.firstName.isNull()`          | `FirstName eq null`        |
| isNotNull            | `q.firstName.isNotNull()`       | `FirstName ne null`        |

Well, actually the following data types don't support any filtering:

- `Edm.Binary`
- `Edm.Stream`
- `Edm.Undefined`

Specification: OData V4 URL Conventions on [Logical Operators](https://docs.oasis-open.org/odata/odata/v4.01/os/part2-url-conventions/odata-v4.01-os-part2-url-conventions.html#sec_LogicalOperators).

### Meaning of Equality

A short summary of what equality means in OData:

- primitive types = same value
- entity types = same entity
- complex types = same structure and same values
- collections = same cardinality and each member is equal

See the mentioned OData V4 specification for more details.

### Emulation of `In` Operator

OData V4 specifies a proper `in` operator. Unfortunately not every V4 service supports this feature.

Since it's so utterly useful `odata2ts` emulates the `in` operator by rolling it out as a series of `equals-or`-expressions.
And by using only basic operators (`equals` and `or`) this emulated `in` operator should be supported by any V4 as well as any V2 OData service.

## Arithmetic Operators

| Operator Name(s)             | Example Usage     | Produced OData Query | Notes                                                                                     |
| ---------------------------- | ----------------- | -------------------- | ----------------------------------------------------------------------------------------- |
| add<br/>plus                 | `q.age.plus(1)`   | `Age add 1`          |                                                                                           |
| sub<br/>minus                | `q.age.minus(1)`  | `Age sub 1`          |                                                                                           |
| mul<br/>multiply             | `q.age.mul(2)`    | `Age mul 2`          |                                                                                           |
| div<br/>divide               | `q.age.div(2)`    | `Age div 2`          |                                                                                           |
| divBy<br/>divideWithFraction | `q.age.divBy(2)`  | `Age divby 2`        | Decimal division: Commits both operands to decimal before dividing. Only available in V4. |
| mod<br/>modulo               | `q.age.modulo(2)` | `Age mod 2`          |                                                                                           |

## Type Specific Functions

`Terminal Functions` result in a boolean value.

### Number Functions

| Function | Data Type                  | Example             | Produced OData Query | Description                                              |
| -------- | -------------------------- | ------------------- | -------------------- | -------------------------------------------------------- |
| ceiling  | Edm.Double<br/>Edm.Decimal | `q.price.ceiling()` | `ceiling(Price)`     | Rounds the fractional value up to the next whole number. |
| floor    | Edm.Double<br/>Edm.Decimal | `q.price.floor()`   | `floor(Price)`       | Rounds the fractional value down to the whole number.    |
| round    | Edm.Double<br/>Edm.Decimal | `q.price.round()`   | `round(Price)`       | Half-up rounding.                                        |

### String Functions

Terminal Functions:

| Function       | Example Usage                            | Produced OData Query                                              | Description                                                                                |
| -------------- | ---------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| contains       | `q.lastName.contains("hy")`              | V4: `contains(LastName,'hy')`<br/>V2:`substringof('hy',LastName)` | True if the given term is contained in the property value. The matching is case sensitive. |
| startsWith     | `q.lastName.startsWith("Why")`           | `startswith(LastName,'Why')`                                      | True if the property value starts with the given term. The matching is case sensitive.     |
| endsWith       | `q.lastName.endsWith("yte")`             | `endswith(LastName,'yte')`                                        | True if the property value ends with the given term. The matching is case sensitive.       |
| matchesPattern | `q.lastName.matchesPattern("[a-zA-Z]+")` | `matchesPattern(LastName,'[a-zA-Z]+')`                            | Only available in V4; allows for filtering by regular expression.                          |

To achieve a **case-insensitive** matching you can use `toLower` or `toUpper` like so:
`q.lastName.toLower().startsWith(x.toLowerCase())`

Transformer Functions:

| Function     | Example                          | Produced OData Query     | Result Type | Description                                                                                           |
| ------------ | -------------------------------- | ------------------------ | ----------- | ----------------------------------------------------------------------------------------------------- |
| concatPrefix | `q.lastName.concatPrefix("pre")` | `concat('pre',LastName)` | Edm.String  | Prefixes the value.                                                                                   |
| concatSuffix | `q.lastName.concatSuffix("suf")` | `concat(LastName,'suf')` | Edm.String  | Suffixes the value.                                                                                   |
| indexOf      | `q.lastName.indexOf("y")`        | `indexof(LastName,'y')`  | Edm.Int32   | Returns the zero-based character position of the first occurrence of the given term within the value. |
| length       | `q.lastName.length()`            | `length(LastName)`       | Edm.Int32   | Returns the length of the value string.                                                               |
| toLower      | `q.lastName.toLower()`           | `tolower(LastName)`      | Edm.String  | Returns the value string in lower case.                                                               |
| toUpper      | `q.lastName.toUpper()`           | `toupper(LastName)`      | Edm.String  | Returns the value string in upper case.                                                               |
| trim         | `q.lastName.trim()`              | `trim(LastName)`         | Edm.String  | Returns the value string without any leading or trailing whitespace.                                  |

### Date and Time Functions

| Function | Data Type                                             | Example                | Produced OData Query | Result Type   | Description                               |
| -------- | ----------------------------------------------------- | ---------------------- | -------------------- | ------------- | ----------------------------------------- |
| year     | Edm.Date<br/>Edm.DateTime<br/>Edm.DateTimeOffset      | `q.shippedAt.year()`   | `year(ShippedAt)`    | Edm.Int32     | Returns the year of the date as number.   |
| month    | Edm.Date<br/>Edm.DateTime<br/>Edm.DateTimeOffset      | `q.shippedAt.month()`  | `month(ShippedAt)`   | Edm.Int32     | Returns the month of the date as number.  |
| day      | Edm.Date<br/>Edm.DateTime<br/>Edm.DateTimeOffset      | `q.shippedAt.day()`    | `day(ShippedAt)`     | Edm.Int32     | Returns the day of the date as number.    |
| hour     | Edm.TimeOfDay<br/>Edm.DateTime<br/>Edm.DateTimeOffset | `q.shippedAt.hour()`   | `hour(ShippedAt)`    | Edm.Int32     | Returns the hour of the time as number.   |
| minute   | Edm.TimeOfDay<br/>Edm.DateTime<br/>Edm.DateTimeOffset | `q.shippedAt.minute()` | `minute(ShippedAt)`  | Edm.Int32     | Returns the minute of the time as number. |
| second   | Edm.TimeOfDay<br/>Edm.DateTime<br/>Edm.DateTimeOffset | `q.shippedAt.second()` | `second(ShippedAt)`  | Edm.Int32     | Returns the second of the time as number. |
| date     | Edm.DateTime<br/>Edm.DateTimeOffset                   | `q.shippedAt.date()`   | `date(ShippedAt)`    | Edm.Date      | Returns the date part of a date time.     |
| time     | Edm.DateTime<br/>Edm.DateTimeOffset                   | `q.shippedAt.time()`   | `time(ShippedAt)`    | Edm.TimeOfDay | Returns the time part of a date time.     |

### Collection Functions

Also called "Lambda Functions".

| Function | Example Usage                                  | Produced OData Query           | Description                                                                 |
| -------- | ---------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| any      | `q.trips.any((qTrip) => qTrip.price.lt(1000))` | `Trips/any(a:a/Price lt 1000)` | True if any member of the collection attribute matches the filter criteria. |
| all      | `q.trips.all((qTrip) => qTrip.price.lt(1000))` | `Trips/all(a:a/Price lt 1000)` | True if all members of the collection attribute match the filter criteria.  |
