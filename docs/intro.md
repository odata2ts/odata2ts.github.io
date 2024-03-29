---
sidebar_position: 1
---

# Intro

The basic idea of `odata2ts` is to leverage the readily available metadata of any OData service
to generate different sorts of typed artefacts which you use in your TypeScript code.

Main use cases:

- You want typings for the request and response models of your OData service
- You want a modern query builder to formulate complex queries
- You want full-fledged OData client as means to interact with your OData service

## Modularity

As system `odata2ts` really centers around the generator (also called `odata2ts`),
which you always need to install as dev dependency and configure as part of your build chain.

Apart from that `odata2ts` is build in a modular way to support different use cases.
If you're only interested in typings than you're good to go, you only need the generator.
More advanced use cases and artefacts will involve additional runtime dependencies, e.g.
`@odata2ts/odata-query-builder` or `@odata2ts/odata-service`.

The [Getting Started Guide](./category/getting-started) walks you through installation and
configuration based on one of the main use cases.

## Generator

The generator is supposed to be used with a TypeScript based configuration file.
Then it's able to handle the generation for multiple OData services.

It comes with powerful configuration options. Some highlights:

- generation of TypeScript files or compiled JS / DTS files
  - TS: option to use prettier on generated TS files
  - JS/DTS: option to specify path to `tsconfig.json`
- use type converters
  - work with data types of your choice
  - integrate with other technologies
- name or rename stuff
  - naming of pretty much any aspect of the generated artefacts
  - e.g. all types should be prefixed with an "I", `Person` => `IPerson`
  - consistent casing (as in "camelCase" or "PascalCase") even for property names of entity types

See the [generator documentation](./category/generator) for more information.

## Full-Fledged OData Client

If you want to use the full-fledged OData client, then `odata2ts` really starts to shine.
This is where all generated artefacts and provided libraries come together.

Feature Highlights:

- powerful, fluent and type-safe [query builder](./category/query-builder)
- type-safe CRUD operations
- type-safe (unbound or bound) functions and actions
- configurable [HTTP client](./odata-client/http-client/) (fetch, Axios, ...)
- use [type converters](./generator/converters/) to interact with data types of your choice
  - use provided ones: v2-to-v4-converter, luxon-converter
  - roll your own
- allow [renaming of entity properties](./generator/configuration#renaming-entities-and-properties)
  - establish consistent casing, e.g. `camelCase`
  - rename an individual property

### Generated Main Service

`odata2ts` generates **one main service** as entry point for you, which reflects your whole
OData service:
From there you can navigate to all of its parts, perform your typical CRUD operations,
call unbound and bound functions / actions and execute even complex queries with ease.

See [the main service documentation](./odata-client/the-main-service).

### HTTP Client

A proper HTTP client is required to perform the actual HTTP requests. Of course, a multitude
of approaches (go native with `fetch`) and libraries (e.g. Axios) are available.

To keep this aspect configurable `odata2ts` defines and uses its "own" API:
the [HTTP Client API](https://www.npmjs.com/package/@odata2ts/http-client-api).

Three implementations are currently provided:

- [Fetch Client](./odata-client/http-client/fetch)
- [Axios Client](./odata-client/http-client/axios)
- [JQuery Client](./odata-client/http-client/jquery)

See [HTTP Client](./odata-client/http-client/) for more details.
