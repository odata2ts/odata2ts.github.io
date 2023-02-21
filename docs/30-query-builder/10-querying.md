---
id: query-builder-querying
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
