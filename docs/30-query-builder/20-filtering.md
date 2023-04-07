---
id: filtering
sidebar_position: 10
---

# Filtering

OData specifies numerous filter operators and functions and `odata2ts` implements most of them.
The filter capabilities are grouped into the following categories:

- [Logical Operators](#logical-operators): `and`, `or` and `not`
- [Common Operators](#common-operators): equality and comparison
- [Arithmetic Operators](#arithmetic-operators): basic math
- [Type Specific Functions](#type-specific-functions): functionality dependent on data type

To realize this functionality `odata2ts` generates `Query Objects`, which are functional twins of your
entities and complex types (see [Q-Objects](../q-objects/overview) for more details).
Each property of such a `Query Object` provides all the filter methods available for its data type.

```ts
import { QPerson } from "../generated/trippin/QTrippin";

const qPerson = new QPerson();
builder
  .filter(
    // here we see the query object "qPerson" in action and its string property "lastName"
    qPerson.lastName.startsWith("Why"),
    // each property offers only functionlity suited to its data type
    qPerson.age.plus(5).lt(30)
  )
  .build();
```

There's one distinction here to be made regarding the available methods:

- Terminal Functions, e.g. `startsWith` or `lt`
- Manipulation Functions, e.g. `plus`

The filter operation itself expects one or more filter expressions (class `QFilterExpression`),
each of which results in a `boolean` value in order to decide whether the record gets filtered.
A **"terminal function"** will produce a proper filter expression, while the **manipulation function** produces
an intermediate value object.

From a usage standpoint:
You can use as many **manipulation functions** as you like (all arithmetic operators and most type-specific functions),
but you need to end your filter expression with a **terminal function** (all common operators and some type-specific functions).

:::note

Regarding the language use of "operator" and "function": When using `odata2ts` this differentiation is
opaque for you, you will always call JavaScript methods. Hence, you can treat both terms as synonyms.
The distinction is only relevant within the syntactical context of OData: operator `x eq 2` vs function `startswith(x,'A')`.

:::

:::caution

Be aware that an OData service does not have to implement all filter functionalities.
When using an unsupported operation, then the server should respond with `501: Not Implemented`
(since the world's not perfect, you might face `500: Server Error` instead).

:::

## Basics

### Origins

The approach of generating certain objects to provide type-specific and type-safe query capabilities is by no means an
invention of `odata2ts`. On the contrary, `odata2ts` has been built in order to realize this approach for the domain
of OData queries.

For us, this concept originates in two outstanding Java libraries which are designed for the domain of
database queries: [QueryDsl](https://querydsl.com/) and [jOOQ](https://www.jooq.org/).

While `odata2ts` diverges in some aspects from those libraries, the similarities really stand out when it
comes to filtering (and ordering). Hence, the extra kudos to those libraries at this point.

### Using Other Properties Instead of Values

The following descriptions of filter operators and functions are using concrete values.
However, you can also compare properties with each other:

```ts
builder.filter(qPerson.lastName.eq(qPerson.firstName))
```

So whenever you meet any function or operator which expects a value, you can also use another property instead.

### Custom Filter Expressions

A terminal method produces a filter expression (class `QFilterExpression`).
You can also create them manually to provide raw filter expressions and mix and match them with regular ones:

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

The basic logical operators are `and`, `or` and `not`.

The `and` operator is implied when calling the `filter` operation with multiple filter expressions
or multiple times.

You control this aspect via the filter expression itself, since any `QFilterExpression` provides for
the logical operators:

```ts
builder.filter(
  qPerson.lastName.eq("Smith")
    .or(qPerson.firstName.eq("Rumpelstilzchen"))
    .not()
)
```

Result: `$filter=not(LastName eq 'Smith' or FirstName eq 'Rumpelstilzchen')`

Specification: OData V4 URL Conventions on [Logical Operators](https://docs.oasis-open.org/odata/odata/v4.01/os/part2-url-conventions/odata-v4.01-os-part2-url-conventions.html#sec_LogicalOperators).

## Common Operators

All operators listed here are valid for (nearly) all data types:

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

The following data types don't support any filtering:

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

The basic mathematical operators are specified for OData. All of them are **manipulation functions**:

| Operator Name(s)             | Example Usage     | Produced OData Query | Notes                                                                                                                           |
| ---------------------------- | ----------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| add<br/>plus                 | `q.age.plus(1)`   | `Age add 1`          |                                                                                                                                 |
| sub<br/>minus                | `q.age.minus(1)`  | `Age sub 1`          |                                                                                                                                 |
| mul<br/>multiply             | `q.age.mul(2)`    | `Age mul 2`          |                                                                                                                                 |
| div<br/>divide               | `q.age.div(2)`    | `Age div 2`          |                                                                                                                                 |
| divBy<br/>divideWithFraction | `q.age.divBy(2)`  | `Age divby 2`        | Decimal division: Commits both operands to decimal before dividing and may result in value with fraction. Only available in V4. |
| mod<br/>modulo               | `q.age.modulo(2)` | `Age mod 2`          |                                                                                                                                 |

## Type Specific Functions

### Number Functions

Here we have the typical rounding functions:

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

Manipulation Functions:

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
