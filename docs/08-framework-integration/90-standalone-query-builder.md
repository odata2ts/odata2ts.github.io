---
id: standalone-query-builder
title: Standalone Query Builder
sidebar_position: 90
---

# Standalone Query Builder

The query builder (package `@odata2ts/odata-query-builder`) is built into every generated service, but it
also stands on its own: it turns query objects into an encoded OData URL and stops there. Nothing is sent,
so no HTTP client and no generated service are involved.

That is worth reaching for when you want odata2ts to formulate the URL while something else performs the
request — an existing data layer, a framework's own fetching, a UI5 `ODataModel`. If you are not in that
situation, use the [generated client](../odata-client/the-main-service), where the builder is handed to you
inside `query()`.

The operations themselves are the same either way and are documented once, under
[querying](../odata-client/querying) and [filtering](../odata-client/filtering). This page is only about
getting a builder without a client.

## Setup

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
import { createQueryBuilderV4 } from "@odata2ts/odata-query-builder";
import { QPerson } from "../generated/trippin/index.js";

const builder = createQueryBuilderV4("people", new QPerson());
```

With a generated service this initialization happens for you; standalone it is yours to do.

`build()` returns the encoded URL, which is where the query builder's job ends — sending it is up to you.

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
