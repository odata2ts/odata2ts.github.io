---
id: axios-odata-client
sidebar_position: 10
---

# Axios OData Client

The **Axios OData Client** serves as HTTP client for `odata2ts` and uses - as its name suggests -
[axios](https://github.com/axios/axios) for realizing the HTTP communication.

It's the reference implementation of the `odata-client-api` and allows for all known features:

- request configuration
- automatic CSRF token handling

By default, the request headers `Accept` and `Content-Type` are set to `application/json`.

## Setup

Install package `@odata2ts/axios-odata-client` as runtime dependency:

```bash npm2yarn
npm install --save @odata2ts/axios-odata-client
```

Axios is automatically installed as dependency.

## Usage

The bare minimum is to create a new `AxiosODataClient` instance.
It's then usually passed to the generated main service:

```ts
import { AxiosODataClient } from "@odata2ts/axios-odata-client";

const odataClient = new AxiosODataClient();
const trippinService = new TrippinService(odataClient, BASE_URL);
```

The client can be further configured, of course.

## Configuration

By default, the request headers `Accept` and `Content-Type` are set to `application/json`
for all requests.

Use the first constructor parameter to pass your global configuration for the client.
The configuration is of type `AxiosRequestConfig` (from axios package)
and will be applied to all requests made with this client.

Here's the axios documentation on the [Request Config](https://axios-http.com/docs/req_config)

### Basic Auth

To use **Basic Auth** with axios, you configure the `auth` setting:

```ts
const config: AxiosRequestConfig = {
  auth: {
    username: "jamesdoe",
    password: "007"
  }
}
```

### Automatic CSRF Token Handling

Provide the second constructor parameter of type `ClientOptions`:

```ts
import { AxiosODataClient } from "@odata2ts/axios-odata-client";

const odataClient = new AxiosODataClient(
  // standard config => irrelevant right now
  undefined,
  // ClientOptions
  { useCsrfProtection: true, csrfTokenFetchUrl: "..."}
);
```

You set the option `csrfTokenFetchUrl` to a static path of your OData service. Ideally one, that
returns fast and with a minimum amount of data. With this setup you should be done, the rest is
handled automatically.

:::info

The root path of the OData service might be well suited for this purpose.
For the Trippin service this would be: `https://services.odata.org/TripPinRESTierService/`.

:::

How does it work?

If CSRF token handling is enabled and a manipulation request is triggered (POST, PUT, PATCH, DELETE),
the client first checks the current CSRF token and issues an own request to retrieve one, if need be.
Only then it makes the requested call and adds the CSRF token to the header of this request.

If the token is found to be invalid or expired and the server appropriately responds with `403`,
then the token is refreshed and the original request is executed again.
