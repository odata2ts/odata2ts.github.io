---
sidebar_position: 1
---

# Intro

If you use TypeScript and need to interact with an OData service, then `odata2ts` might
be for you. It centers around the generation of TypeScript artefacts
out of readily available metadata descriptions of given OData services.

With the help of `odata2ts` you can:

- generate tailor-made TypeScript model interfaces for entities, complex types and what not
- generate powerful q-objects to leverage the type-safe and fluent query builder
- generate a full-fledged, domain-savvy OData client supporting type-safe queries, CRUD operations and more

Feature Highlights:

- support for OData V2 and V4
- generation of compiled JS / DTS or (prettified) TypeScript files
- allows for handling multiple odata services
- TypeScript based configuration file
- powerful, type-safe and fluent query builder
- use existing or own converters to interact with data types of your choice
- allows for name mappings of attributes

The generated code artefacts can be used in Browser or Node.js environments.
