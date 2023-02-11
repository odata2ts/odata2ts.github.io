---
id: use-cases
title: Use Cases
sidebar_position: 2
---

In all cases `@odata2ts\odata2ts` should be installed as dev dependency.

### Data Models Only
In the most simple case you are only interested in TypeScript interfaces, representing input and output
models of the given OData service.

Set `mode = models` to only generate models.

Runtime dependencies: None. The generated interfaces do not have any dependencies themselves.

By default `odata2ts` will generate all kinds of models. You can opt out of that via configuration:
* skipEditableModels
* skipIdModels
* skipParamModels

You can also fine-tune the naming of the generated models via config option `naming.models`.

### Type-safe Querying
The most helpful part of `odata2ts` is the
[OData Query Builder](https://www.npmjs.com/package/@odata2ts/odata-query-builder) which enables type-safe
querying and offers a fluent API.
It abstracts away the tricky parts about formulating a valid OData URL, reduces the necessary amount of
knowledge about the OData protocol, and allows for mapped names and converted values.

The query builder makes use of so-called "query-objects", which provide all the necessary functionality.

Set `mode = qobjects` to generate models and query objects.

Runtime dependency: `@odata2ts/odata-query-builder`

You can fine-tune the naming of the generated models via config option `naming.queryObjects`.
All model settings also apply.

### Full-Fledged OData Client
This is the default mode, which can be explicitly set via `mode = services` or `mode = all`.

Runtime dependencies:
* `@odata2ts/odata-service`
* `@odata2ts/axios-odata-client` or any module implementing `@odata2ts/odata-client-api`

You can fine-tune the naming of the generated services via config option `naming.services`.
All model and query object settings also apply.
