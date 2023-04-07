---
id: overview-and-setup
sidebar_position: 1
---

# Overview & Setup

OData is quite powerful when it comes to querying. You get operations which you probably know from SQL:
select, filter, count, skip, top. You also get the ability to expand related entities which in turn can be
filtered, selected or further expanded.

Selecting and expanding really means that the client has the power to shape the response structure.
graphQL should come to mind...

Additionally, OData V4 specifies even more functionalities like searching or aggregation.

:::caution

Be aware that an OData service does not have to implement all functionalities.
When using an unsupported operation, then the server should respond with `501: Not Implemented`
(since the world's not perfect, you might face `500: Server Error` instead).

:::

## Query Builder

The query builder (package `@odata2ts/odata-query-builder`) offers a fluent and type-safe API
and allows to formulate even complex queries with ease.
It supports

- all standard operations: select, filter, expand, count, skip, top
- most filter operations: from `eq` to `any`
- V4 search operation
- simple group-by

It depends on the generated `Query Qbjects` and is itself built into any generated `service`.

## Setup

If you've followed the [Getting Started Guide](../getting-started/use-case_query-builder) or already installed `odata-service`,
then you're already good to go: [See Initialization](#initialization).

Install as regular runtime dependency:

```bash npm2yarn
npm install --save @odata2ts/odata-query-builder
```

## Configuration

Generation `mode` must be set to `qobjects` or `service`.

## Initialization

Two factory functions are provided (one for V2 the other for V4) to create a query builder.
You need to provide two arguments:

1. the path to the resource
2. the `query-object` representing this resource

```ts
import { createQueryBuilderV4  } from "@odata2ts/odata-query-builder";
import { QPerson } from "../generated/trippin/QTrippin"

const builder = createQueryBuilderV4("people", new QPerson());
```

This kind of initialization is automatically performed when using the generated services.

### Why do I need to pass the path?

Doesn't the entity type itself know which path it has? No, it only has a name;
it's actually the `EntitySet` which exposes its initial path and then also "navigation props".
So the conclusion arises: The same `EntityType` can be exposed via multiple paths.

The Trippin service demonstrates this quite clearly:

```xml
<Schema Namespace="Trippin" xmlns="http://docs.oasis-open.org/odata/ns/edm">
  <!-- the EntityType only knows its own name, which is needed for referencing -->
  <EntityType Name="Person">
    <Key>
      <PropertyRef Name="UserName" />
    </Key>
    <Property Name="UserName" Type="Edm.String" Nullable="false" />
    ...
    <!-- now, the very same entity becomes available under /BestFriend -->
    <NavigationProperty Name="BestFriend" Type="Trippin.Person" />
    <!-- or as collection with yet another path -->
    <NavigationProperty Name="Friends" Type="Collection(Trippin.Person)" />
  </EntityType>
  ...
  <EntityContainer Name="Container">
    <!-- Here is the real entry point: /People -->
    <EntitySet Name="People" EntityType="Trippin.Person">...</EntitySet>
  </EntityContainer>
</Schema>
```

So we might navigate to `/People('russelwhyte')/BestFriend` to get to a very specific `Person` entity.
The path itself cannot be known in advance.
