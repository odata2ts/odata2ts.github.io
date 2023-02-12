---
id: managed-props
sidebar_position: 10
---

# Managed Properties

Some properties are managed by the server, most notably the ID field:
The server is responsible for generating a unique identifier for each new entity.
Other use cases would be fields like `createdAt` or `modifiedBy` which are
automatically handled by the server or database.

In all of these cases, the client is not allowed to directly update those managed fields.
This fact needs to be reflected in the editable model versions, which are used for create,
update, and patch actions: All managed fields need to be filtered out.

## Automatism

`odata2ts` employs the following automatism:
Single key fields, like ID, are marked as managed,
while each field of a complex key is regarded as unmanaged.

If you want to turn off that automatism, use the option `disableAutoManagedKey`.

## Configuration by Property

You can and maybe have to configure properties manually to mark them as managed.

You do so by using the setting `propertiesByName` which expects an array of objects.
Each object must have a `name` property which matches the attribute name as it is stated
in the EDMX of the OData service.

The `name` property can also be a regular expression
which matches the whole name (internally we add "^" to the beginning and "$" to the end of the expression).

```ts
const config = {
  services: {
    myService: {
      propertiesByName: [
        {
          name: /id/i, // uses case insensitive regular expression to find "ID", "id", "Id", ..
          managed: true,
        },
        // use a list of fields
        ...["createdAt", "createdBy", "modifiedAt", "modifiedBy"].map((prop) => ({ name: prop, managed: true }))
      ]
    }
  }
}
```
