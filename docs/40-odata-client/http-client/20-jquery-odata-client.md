---
id: jquery-odata-client
sidebar_position: 20
---

# JQuery OData Client

The **JQuery OData Client** serves as HTTP client for `odata2ts`.
It uses [JQuery](https://jquery.com/) to perform HTTP requests, specifically the [ajax method](https://api.jquery.com/Jquery.ajax/).

JQuery is used by this client but not installed (declared as peer dependency).
The existing JQuery instance must be provided when initializing the client.

The whole client is meant to support usage of `odata2ts` in UI5 apps, which use Jquery for HTTP communication.

## Setup

Install package `@odata2ts/jquery-odata-client` as runtime dependency:

```bash npm2yarn
npm install --save @odata2ts/jquery-odata-client
```

JQuery is a peer-dependency of this package, so it's not contained in or installed through this package.

## Usage

The bare minimum is to create a new `JQueryODataClient` instance.
It's then usually passed to the generated main service:

```ts
import { JQueryODataClient } from "@odata2ts/jquery-odata-client";

// you pass the existing JQuery instance to the client
const odataClient = new JQueryODataClient(jq);
const trippinService = new TrippinService(odataClient, BASE_URL);
```

The client can be further configured, of course.

## Configuration

By default, the request headers `Accept` and `Content-Type` are set to `application/json`
for all requests. Also caching of `GET` requests is disabled (option `cache`).

Use the second constructor parameter to pass your global configuration for the client.
The configuration is of type `AjaxRequestConfig` (from jquery-odata-client package)
and will be applied to all requests made with this client.

Here's the JQuery documentation on its [ajax method](https://api.jquery.com/Jquery.ajax/), the configuration
object limits the available options to:

- complete
- beforeSend
- headers
- statusCode
- timeout
