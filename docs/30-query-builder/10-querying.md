---
id: querying
sidebar_position: 10
---

# Querying

One of OData's core strengths is its powerful querying capabilities.

On the one hand you get your typical SQL-like operations:

- filter
- sort
- count
- top & skip

On the other hand you also get the ability to shape the response structure:

- select: only selected attributes of the entity / complex type are fetched
- expand: attributes which relate to other entities can be expanded, so that they are included in the result type

This feature of OData can have a huge impact. A well crafted API could easily be used to
serve very different clients: Each client would only select and expand the relevant information.

Last but not least V4 defines additional functionality:

- search: free-text search capabilities (logic is defined by server)
- compute: create computed properties; allows to simulate a group-by clause

## General Usage

The builder is fluent, i.e. it returns itself, so that you're able to define your whole query in one go
(also known as Builder Pattern).

At the end you will have to call `build()` to get the final URI string.
It will be properly encoded.

Minimal example:
`createUriBuilderV4("People", qPerson).build()`<br/>
Result: `People`

### Stay Fluent

To not break the fluent API style, your expressions can evaluate to `null` or `undefined`
and will get filtered out automatically. This applies to all operations of the query builder.

```ts
createUriBuilderV4("People", qPerson)
  .select("lastName", isAgeRelevant ? "age" : undefined)
  .filter(null)
  .build()
```

Result, if `age` doesn't matter: `/People?$select=LastName`

### Keep Adding

You can call all operations multiple times. This will just keep adding stuff.
Only in the case of `skip`, `top` and `count` this will overwrite the previous value.

```ts
createUriBuilderV4("People", qPerson)
  .select("lastName")
  .select("age")
  .filter(qPerson.age.gt(18))
  .filter(qPerson.age.lowerThan(66))
  .build()
```

Non-encoded result: `/People?$select=LastName,Age&$filter=Age gt 18 AND Age lt 66`

## Select

By default, the response structure for an entity will consist of
the following properties:

- all primitive properties (EDMX type: `Edm.*`, e.g. `Edm.String`)
- all properties representing a `ComplexType`
- none of the properties representing an `EntityType` or a collection thereof
  - in V2 you get a placeholder element instead, known as `DeferredContent`

By using `select` you only pick those properties you care about.

```ts
createUriBuilderV4("People", qPerson)
  .select("lastName", "firstName")
  .build()
```

The non-encoded result: `People?$select=lastName,firstName`<br/>
Response structure example:

```ts
[
  {
    lastName: "Tester",
    firstName: "Heinz"
  }
]
```

### Deep Select

A deep select (something like `$select=bestFriend/lastName`) is not possible via the `select`
operation of the query builder.

It's considered to not being needed.
Use the `expanding` operation of the query builder instead and then `select` those props you need.

## Expand

By default, associated entities are not included in response structures (in contrast to ComplexTypes).

- V4 leaves out any property which establishes an entity relation (EDMX: NavigationProperty)
- V2 replaces the property value with a `DeferredContent` placeholder

To "expand" means to include the associated entity or entity collection in the response structure.
The query builder offers two different methods: `expand` and `expanding`.

### Simple Expand

Use `expand` to expand the complete entity behind a property.

```ts
createUriBuilderV4("People", qPerson)
  .expand("trips", "bestFriend")
  .build()
```

Non-encoded result: `/People?$expand=Trips,BestFriend`

### Complex Expanding

Use `expanding` to further shape the response structure of an expanded property to your needs.
Works for V2 and V4.

You write a callback function, which will receive an own query builder as first parameter
and the appropriate query object as second parameter. With the help of the builder
you can further `select` & `expand`.

In addition, V4 also allows to use `filter`, `orderBy`, `skip` and `top` on expanded collections.

```ts
createUriBuilderV4("People", qPerson)
  .expanding("trips", (tripsBuilder, qTrip) =>
    tripsBuilder
      .select("budget")
      .orderBy(qTrip.budget.desc())
      .top(1)
  )
  .build()
```

Non-encoded result: `/People?$expand=Trips(select=Budget;orderby=Trips desc;top=1)`

NOTE: Always return the passed query builder from your callback function.
It's currently not mandatory, but will be in the future.

### Complex Expanding in V2

The V2 query builder offers the same `expand` and `expanding` operations as its V4 counterpart.

The builder which works on the expanded property won't offer any collection operations
like `filter` or `top` as they are not supported by OData V2.
But `select`, `expand` and `expanding` work just the same.

The translation into V2 is completely different, however.

```ts
import { createUriBuilderV2 } from "@odata2ts/odata-query-builder";

createUriBuilderV2("Product", qProduct)
  .expanding("supplier", (catBuilder, qSupplier) =>
    catBuilder
      .select("name", "id")
  )
  .build()
```

Non-encoded result: `/Product?$expand=supplier&$select=supplier/name,supplier/id`

Using the V4 API also for V2 avoids repetition and pitfalls.

## Filter

Filtering makes direct use of the generated `query-objects` to support type-safety and code assistance all around.
They are the functional counterparts to each known entity. Each property of such a query object brings its
own type specific filter operations:

```ts
createUriBuilderV4("People", qPerson)
  .filter(
    // lastName will only offer string based operations and requires string as argument
    qPerson.lastName.eq("Smith"),
    // age as number property only accepts numbers
    qPerson.age.gt(18)
  )
```

Non-encoded result: `People?$filter=LastName eq 'Smith' AND Age gt 18`

### Filter Operations

All individual operations of any filter type are documented in [Filter Operations](./filter-operations).

The following is only concerned with the `filter` operation of the builder.

### Logical Operators

The `filter` operation accepts one or more filter expressions which are concatenated by an `AND` expression.
The same holds true when calling the operation multiple times.

#### Or-Expression

An `OR` expression would look like this (`AND` can also be used in this same way):

```ts
builder.filter(qPerson.lastName.eq("Smith").or(qPerson.firstName.eq("Rumpelstilzchen")))
```

Result: `$filter=(LastName eq 'Smith' or FirstName eq 'Rumpelstilzchen')`

As you can see parentheses are added around the or-expression.

#### Not-Expression

In the same manner you can negate any expression by calling `not()`:

```ts
builder.filter(qPerson.lastName.eq("Smith").or(qPerson.firstName.eq("Rumpelstilzchen")).not())
```

Result: `$filter=not(LastName eq 'Smith' or FirstName eq 'Rumpelstilzchen')`

### Custom Filter Expressions

You can create custom filter expressions directly. This is meant to be used as an escape hatch:

```ts
builder.filter(new QFilterExpression("name eq 'Heinz'").and(new QFilterExpression("age eq 8")))
```

## Count

When querying on collections you can use the `count` operation to get the total count
of all items as special field within the response.

This becomes relevant when the server delivers limited/paged results.

```ts
builder.count().build();
```

Result: `$count=true`

## Top

When querying on collections you can use the `top` operation to limit the result size.

To only retrieve a maximum of three records:

```ts
builder.top(3)
```

Result: `$top=3`

## Skip

When querying on collections you can use the `skip` operation to select the start position
of the data slice. You would need this to implement pagination or something like a
"More"-Button to load the next results.

To retrieve results from the 11th item onwards:

```ts
builder.skip(10)
```

Result: `$skip=10`

## OrderBy

When querying on collections you can use the `orderBy` operation to sort the result list.

You use the generated `query-object` directly:

```ts
createUriBuilderV4("People", qPerson)
  .orderBy(qPerson.lastName.desc(), qPerson.firstName.asc())
  .build()
```

Result: `People?$orderby=lastName desc,firstName asc`

## Search

The `search` operation is a V4 only feature. It allows to specify free text terms
and phrases which can be combined with logical operators.
The server decides how to apply these search values.

The query builder abstracts away the difference between term and phrase:
By virtue of white spaces it is automatically determined if a search term
is a term or a phrase.

```ts
builder.search("operation", "odata v4").build();
```

Result: `$search=operation AND "odata v4"`<br/>
As you can see the phrase needs to be wrapped with double quotes.

### Logical Operators

Calling `search` with multiple parameters or calling it multiple times will
concatenate the terms and phrases by the `and` operator.

To use the other logical operators you'll need a utility called `searchTerm`

```ts
import { searchTerm } from "@odata2ts/odata-query-objects";

builder.search(searchTerm("operation").or("odata v4").not()).build();

```

Result: `$search=NOT(operation OR "odata v4")`

## GroupBy

Currently, the query builder only supports a very simple `groupBy` operation which makes
use of the advanced `apply` operation, which is a V4 only feature.

```ts
builder.groupBy("name", "age").build()
```

Result: `$apply=groupby((name,age))`
