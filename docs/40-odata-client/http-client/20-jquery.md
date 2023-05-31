---
id: jquery
sidebar_position: 20
---

# JQuery Client

The **JQuery HTTP Client** uses [JQuery's ajax function](https://api.jquery.com/Jquery.ajax/)
to perform HTTP requests.

JQuery is used by this client but not installed (declared as peer dependency).
The existing JQuery instance must be provided when initializing the client.

The whole client is meant to support usage of `odata2ts` in UI5 apps, which use Jquery for HTTP communication.

## Setup

Install package `@odata2ts/http-client-jquery` as runtime dependency:

```bash npm2yarn
npm install --save @odata2ts/http-client-jquery
```

JQuery is a peer-dependency of this package, so it's not contained in or installed through this package.

## Usage

The bare minimum is to create a new `JQueryClient` instance.
It's then usually passed to the generated main service:

```ts
import { JQueryClient } from "@odata2ts/http-client-jquery";

// you pass the existing JQuery instance to the client
const httpClient = new JQueryClient(jq);
const trippinService = new TrippinService(httpClient, BASE_URL);
```

The client can be further configured, of course.

## Configuration

By default, the request headers `Accept` and `Content-Type` are set to `application/json`
for all requests. Also caching of `GET` requests is disabled (option `cache`).

Use the second constructor parameter to pass your global configuration for the client.
The configuration is of type `AjaxRequestConfig` (from `@odata2ts/http-client-jquery` package)
and will be applied to all requests made with this client.

Here's the JQuery documentation on its [ajax method](https://api.jquery.com/Jquery.ajax/), the configuration
object limits the available options to:

- complete
- beforeSend
- headers
- statusCode
- timeout
