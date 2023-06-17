---
id: the-main-service
sidebar_position: 10
---

# The Main Service

So `odata2ts` generated the main service class, and you created the instance:

```ts
// the generated main service
import { TrippinService } from "../build/trippin/TrippinService";

//... see complete initialization in chapter Overview & Setup

// initialize the service
const trippinService = new TrippinService(httpClient, baseUrl);
```

Equipped with this main service you have a single entry point into your OData service
and can explore the service from the client side with the power of TypeScript.

![Screenshot of auto-completion options for main Trippin service](../../static/img/trippinService-auto-completion.png)

You can see unbound operations (`getNearestAirport` or `resetDataSource`)
as well as the exposed entity sets (`people`, `airports`, etc.).
But let's discuss this in detail in the upcoming sections.

::: note

The real entity set and operation names of the TrippinService are in Pascal case
(`People`, `GetNearestAirport`, ...). Setting `allowRenaming` to `true` will
convert those names to camel case, so that this feels more "natural" from a JS / TS standpoint.
See [renaming](../generator/configuration#naming) for all the options.

:::

## OData Basics

Some relevant background on OData and its concepts.

### Entry Points

OData services expose **entity sets** and - since V4 - **singletons** as entry points into the service.
Each OData service must list these entry points when its root URL is called
(e.g. https://services.odata.org/TripPinRESTierService/).

This information is, of course, also present in the meta description of the service.
In EDMX you will find the `EntityContainer` element:

```xml
<EntityContainer Name="Container">
  <EntitySet Name="People" EntityType="Trippin.Person">...</EntitySet>
  <Singleton Name="Me" Type="Trippin.Person">...</Singleton>
  ...
</EntityContainer>
```

The **entity set** represents a collection of entities, while the **singleton** represents one entity.
Any semantics are determined by the server, e.g. that `/Me` refers to the current user.
Both concepts really only exist as means of defining entry points into the OData service.

### Navigation Properties

An entity may encompass properties which represent another entity or entity collection.

```xml
<EntityType Name="Person">
  <!-- ...  -->
  <NavigationProperty Name="BestFriend" Type="Trippin.Person" />
  <NavigationProperty Name="Trips" Type="Collection(Trippin.Trip)" />
</EntityType>
```

These relations can be traversed:

```
GET /People('russelwhyte')/Trips
GET /People('russelwhyte')/Trips(0)
GET /People('russelwhyte')/BestFriend
GET /People('russelwhyte')/BestFriend/Trips
```

### CRUD & Querying

The acronym "CRUD" describes the basic operations on an entity and has been translated into
HTTP verbs for REST web services (OData being a specialized version of REST):

- **C**reate: `POST`
- **R**ead: `GET`
- **U**pdate: `PUT` or `PATCH`
- **D**elete: `DELETE`

I think, CRUD has its conceptual shortcomings. On the one hand, there are two different update operations
(full & partial), which we discuss in a bit. But on the other hand "read" is simply misleading.
We're talking about **querying**, being able to filter or sort, and having the power to shape the response
object by means of `select` and `expand` in the case of OData. That's not "reading", but "querying"!

### `PUT`, `PATCH` & `MERGE`

So there are two different update methods: Full and partial.
The full update (`PUT`) replaces the entire entity, while the partial update (`PATCH`) only updates
those fields that have been specified.

The OData V2 spec already introduced this distinction, but it was published before the `PATCH` request
was officially supported by the HTTP spec
(it was already envisioned though; cf. the note in the
[Operations Spec](https://www.odata.org/documentation/odata-version-2-0/operations/), chap. 2.6).
So OData V2 defined its very own `MERGE` HTTP request, before adopting `PATCH` from V3 onwards.

To be sure:

- OData V2 only supports `MERGE`
- OData V3 should support both
- OData V4 only supports `PATCH`

:::tip

Custom request methods like `MERGE` are not supported by every HTTP client.
But `MERGE` can always be emulated as `POST` request with the special header `X-Http-Method: MERGE`.

:::

## Navigation

As discussed in the basics, OData exposes and advertises entry points, most often **entity sets** (e.g. `/People`).
We can traverse to a specific entity of that collection by its key(s) (e.g. `/People('russelwhyte')`)
and use its **navigation properties** to traverse ever deeper into the service
(e.g. `/People('russelwhyte')/BestFriend/Trips`). There is no defined end to this kind of navigation.

The main service lists all entity sets, so you call the appropriate function, e.g. `trippinService.people()`.

![Screenshot of auto-completion options for .people()](../../static/img/trippinService-people-auto-completion.png)

To navigate to a specific entity, you specify it's key when calling the appropriate function:
`trippinService.people({userName: "russelwhyte"})`. This is the general form which must be used when handling
entities with composite keys. However, you can use the short form for entities with single keys:
`trippinService.people("russelwhyte")`.

![Screenshot of auto-completion options for .people("xxx")](../../static/img/trippinService-person-auto-completion.png)

And ever deeper via **navigation properties**:
![Screenshot of auto-completion options for .people("xxx").bestFriend().trips()](../../static/img/trippinService-deep-auto-completion.png)

### `getPath()`

You'll find the helper method `getPath()` in most services. It will give you the current URL created by
your traversal through the service.

### `getQObject()`

Any entity related service offers the helper method `getQObject()` to retrieve the **query object** for the
entity type at hand. The query object bundles all the functionality related to that particular entity type.

## Querying

OData has powerful querying capabilities and this is where `odata2ts` might help you the most:
Building even complex OData queries with ease. But let's first start with the basics, before we get
to the query builder.

### `query()`

In the most simplistic case - which might be called "read" ;-) - you just call the `query()` function
on any entity or entity collection.

Calling `query()` will eventually execute the HTTP request to the server and so it returns a `Promise`:

```ts
// get the entire entity collection (in async-await style)
const peopleResponse = await trippinService.people().query();
// peopleResponse: HttpResponseModel<ODataCollectionResponseV4<PersonModel>>

// get a particular entity in its entirety (classical promise based style)
trippinService.people('russelwhyte').query().then((personResponse) => {
  // personResponse: HttpResponseModel<ODataModelResponseV4<PersonModel>>
});

// you can also force a sub-type by supplying it to the query via generics
const specialPersonResponse = await trippinService.people('russelwhyte').query<SpecialPerson>();
// specialPersonResponse: HttpResponseModel<ODataModelResponseV4<SpecialPerson>>
```

When the promise resolves we get an `HttpResponseModel` representing the response from the server.
It contains the response `status`, the response `headers`, and the response body evaluated to JSON,
called `data`. This conventionalized structure is used for any OData operation - CRUD or custom.

The structure of the response `data` largely depends on two factors:

- which OData version is used: V2 or V4?
- are we querying a collection type or entity type?

Querying for an entity in a V4 OData service adds no additional data structures,
the model is directly available:

![Screenshot of auto-completion options for response.data](../../static/img/trippinService-person-response-auto-completion.png)

Querying for a collection gives us a structure with the `value` property,
which contains the result array of the given entity type. When using the
`count()` operation of the query builder, then `@odata.count` will give you
the total amount of records (defined as `Edm.Int64`):

![Screenshot of auto-completion options for response.data.value](../../static/img/trippinService-people-response-auto-completion.png)

### Query Builder

Let's take a look at the query builder. To get the builder you provide a **callback function**
as parameter to the `query()` method. The signature of the callback function:

- **first parameter**: fully initialized query builder
- **second parameter** (optional): query object representing the entity type in question
- **returns**: the query builder

```ts
await trippinService.people().query((builder, qPerson) => {
  return builder
    // filter and orderBy operations make use of the query object
    .filter(qPerson.age.gt(65).or(qPerson.age.lt(18)), qPerson.lastName.contains("x"))
    .orderBy(qPerson.lastName.asc(), qPerson.firstName.asc(), qPerson.age.desc())
    // response shaping operations: select and expanding
    // here we just use the keys, but still in a type-safe fashion
    .select("lastName", "firstName", "age")
    .expanding("bestFriend", (bfBuiler) => bfBuiler.select("lastName"))
    .expanding("trips", (tripBuilder, qTrip) => {
      return tripBuilder.orderBy(qTrip.budget.desc())
    })
  }
);
```

From this example you can see that the builder

- offers a fluent API
- makes heavy use of the query objects to provide for type-safe filtering
- also makes use of the bare property names, but still in a type-safe fashion

You get the complete [query builder documentation](../query-builder/querying) in its own chapter.

## CUD Operations

**Creating** an entity necessarily happens on the collection level,
while **updating** and **deleting** requires the entity in question.

```ts
await trippinService.people().create(model);
await trippinService.people("russelwhyte").update(model);
await trippinService.people("russelwhyte").patch(model);
await trippinService.people("russelwhyte").delete();
```

### Editable Model Versions

Now the type that is used for create or update parameters (e.g. `EditablePerson`) is not the same one that
you get from a query response (e.g. `Person`). There are multiple reasons for that distinction.

For one, when querying for something like an ID field, you definitely get a value, because from a database
standpoint, it is required. However, when creating a new entity - and the server is responsible for generating
the ID (as it should be) - you cannot specify the ID that is about to be generated. So the whole property
should be left out for create (and update) requests. `odata2ts` allows to configure these
[managed properties](../generator/configuration#managed-properties),
which only affect the editable model version (e.g. `EditablePerson`).

```ts
import { Person, EditablePerson } from "../generated/TrippinModel"

const model: EditablePerson = {...};
await trippinService.people().create(model);
```

The naming in regard to "Editable" is completely configurable:
see [configuring naming schemes](../generator/configuration#configuring-naming-schemes).

:::note

Currently, `odata2ts` does not differentiate models for update and create. This might become relevant
in the future though: See [#140](https://github.com/odata2ts/odata2ts/issues/140)

:::

### Return Types

## Custom Operations

"Operations" is the general term used to denominate "functions" and "actions".
**Functions** represent custom `GET` requests for the purpose of retrieving data;
ideally, functions are free from side effects.
**Actions** represent custom `POST` requests for the purpose of creating a side effect,
most often manipulation of state.

You find **custom operations** bound to different levels of the service hierarchy:

- unbound: found at the root level of the service, where entity sets reside
- bound to an entity: the first parameter will be the given entity defined by the URL path
- bound to an entity collection

```ts
// unbound function
const popReponse = await trippinService.getPersonWithMostFriends();
// popResponse: HttpResponseModel<ODataModelResponseV4<Person>>

// unbound function with parameters
const nearResponse = await trippinService.getNearestAirport({ lat:51.918777, lon: 8.620930 });
// nearResponse: HttpResponseModel<ODataModelResponseV4<Airport>>

// entity bound action
await trippinService.people("russelwhyte").shareTrip({tripId: 1, userName: "russelwhyte"})
```

:::note

For SAP users: RAP is only able to bind operations to entity collections or entity types;
there is no way to create an unbound operation.

:::

### V2: Unbound Functions Only

OData V2 only knows functions on the root level (find the `FunctionImport` element in EDMX),
i.e. **unbound functions**.

This means on a practical level, that any V2 service is limited to custom `GET` requests.
Actually, V2 also allows to change the HTTP method to `POST` (attribute `m:HttpMethod="POST"`)
and this is also supported by `odata2ts` out-of-the-box.
However, even as `POST` request the payload of that request is never the request body,
but always only the URL query parameters. Hence, it cannot really be regarded as a `POST` request.

:::tip

As `GET` request have limitations regarding the payload (URLs have browser-dependent limit on their length),
`POST` requests are often necessary. One work-around I've heard of: defining a custom entity
and semantically misusing the `create` request.

:::

## Request Configuration

Whatever the request - CRUD or custom - you always have the option to pass a request configuration as last
parameter. At the utmost minimum, you should be able to set custom headers for the request.

However, the type of the request configuration is entirely dependent on the chosen [HTTP client](./http-client/).
