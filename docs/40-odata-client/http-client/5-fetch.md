---
id: fetch
sidebar_position: 5
---

# Fetch Client

The **Fetch HTTP Client** uses - as its name suggests - the native
[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for realizing the HTTP communication.
It is readily available in all modern browsers.

Regarding Node.js, [fetch](https://nodejs.org/dist/latest-v18.x/docs/api/globals.html#fetch)
has finally been implemented in v18, but is still marked as **experimental**.

This client supports:

- custom request configuration
- automatic CSRF token handling

By default, the request headers `Accept` and `Content-Type` are set to `application/json` and
`cache` is set to `no-cache`.

## Setup

Install package `@odata2ts/http-client-fetch` as runtime dependency:

```bash npm2yarn
npm install --save @odata2ts/http-client-fetch
```

## Usage

The bare minimum is to create a new `FetchClient` instance.
It's then usually passed to the generated main service:

```ts
import { FetchClient } from "@odata2ts/http-client-fetch";

const httpClient = new FetchClient();
const trippinService = new TrippinService(httpClient, BASE_URL);
```

The client can be further configured, of course.

## Configuration

By default, the request headers `Accept` and `Content-Type` are set to `application/json`
for all requests to ensure proper JSON communication.

Use the first constructor parameter to pass your global configuration for the client.
It will be applied to all requests made with this client.

Each request operation (GET, POST, ...) also allows to pass a configuration.

### Automatic CSRF Token Handling

Provide the second constructor parameter of type `ClientOptions`:

```ts
import { FetchClient } from "@odata2ts/http-client-fetch";

const client = new FetchClient(
  // standard config => irrelevant right now
  undefined,
  // ClientOptions
  { useCsrfProtection: true, csrfTokenFetchUrl: "/Trippin"}
);
```

You set the option `csrfTokenFetchUrl` to a static path of your OData service. Ideally one, that
returns fast and with a minimum amount of data.

With this setup you should be done, the rest is handled automatically.

:::info

The root path of the OData service might be well suited for this purpose.
For the Trippin service this would be: `https://services.odata.org/TripPinRESTierService/`.

:::
