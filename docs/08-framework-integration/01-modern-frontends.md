---
id: modern-frontends
title: Modern Frontends (React, Angular, UI5)
sidebar_position: 10
---

# Modern Frontends

## React, Vue, Svelte, ...

For frontends like React, Vue or Svelte you don't need any special configuration.

## Angular

You might want to use the Angular HTTP client so that your interceptors still work:
[AngularODataClient](../odata-client/http-client/angular)

## UI5

As UI5 brings its own OData client, we have two use cases here:

1. you only want the typings (cf. [this blog article](https://community.sap.com/t5/technology-blog-posts-by-sap/ui5-and-typescript-how-to-generate-types-for-odata-services/ba-p/13569987))
2. you want the full client

### Typings Only

First off, you need to set 2 configurations right away:

- `mode` = `models` (see [Generation Modes](../generator/configuration#generation-modes))
- `bundledFileGeneration` = `true` (see [File Layout & Cyclic Imports](../generator/configuration#file-layout--cyclic-imports))

Next, you might be surprised what typings OData generates out-of-the-box:
[OData Types](../../odata-concepts/odata-types). It's not what you're used to and not matching the conversions
the `sap.ui.model.odata.v2.ODataModel` applies.
To remedy the situation you install the [`ui5-v2-converter`](../converters/ui5-v2-converter).

### Full Client

You still want the bundled file generation:

- `bundledFileGeneration` = `true` (see [File Layout & Cyclic Imports](../generator/configuration#file-layout--cyclic-imports))

The HTTP clients you can choose from: JQueryClient or FetchClient.

Finally, you need to integrate the [tooling-modules](https://www.npmjs.com/package/ui5-tooling-modules) to be able
to consume regular NPM packages which are then converted to UI5's special module loader syntax.
