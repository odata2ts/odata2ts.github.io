---
id: converters
sidebar_position: 20
---

# Converters

While some OData types (`Edm.String`, `Edm.Boolean`, ...) can easily and perfectly be mapped to native JS types,
more advanced types are simply strings:

- `Edm.DateTimeOffset`: `"1999-31-12T23:59:59Z"`
- `Edm.Duration`: `"PT10H"`

As you can imagine, there are countless third-party libs and custom data structures
which could be used in these cases. Thus, the choice of how to map data types
must be left open to the user.

To support different converters and stay open to custom converter implementations
odata2ts supports a plugin architecture. So you install only those converters you need
and configure them in the config file.

Furthermore, you are invited to roll your own converters.
The `converter-api` package specifies the interfaces to implement and the data structures to return.
You can use the existing converters as example.

## Provided Converters

The following converters are provided by `odata2ts`:

- [v2-to-v4-converter](https://www.npmjs.com/package/@odata2ts/converter-v2-to-v4)
  - you probably want V2 number types to be JS numbers
  - by converting v2 to v4 data types other converters only need to take care of V4 data types
  - makes switch between V2 and V4 versions of the same OData service more pain-free
- [luxon-converter](https://www.npmjs.com/package/@odata2ts/converter-luxon)
  - third-party `DateTime` type
  - third-party `Duration` type
