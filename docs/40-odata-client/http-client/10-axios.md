---
id: axios
sidebar_position: 10
---

# Axios Client

The **Axios HTTP Client** serves uses - as its name suggests -
[axios](https://github.com/axios/axios) for realizing the HTTP communication.

It allows for:

- request configuration
- automatic CSRF token handling

By default, the request headers `Accept` and `Content-Type` are set to `application/json`.

## Setup

Install package `@odata2ts/http-client-axios` as runtime dependency:

```bash npm2yarn
npm install --save @odata2ts/http-client-axios
```

Axios is a peer-dependency of this package, so it's not contained in or installed through this package
and must be installed separately.

## Usage

The bare minimum is to create a new `AxiosODataClient` instance.
It's then usually passed to the generated main service:

```ts
import { AxiosClient } from "@odata2ts/http-client-axios";

const httpClient = new AxiosClient();
const trippinService = new TrippinService(httpClient, BASE_URL);
```

The client can be further configured, of course.

## Configuration

By default, the request headers `Accept` and `Content-Type` are set to `application/json`
for all requests.

Use the first constructor parameter to pass your global configuration for the client.
The configuration is of type `AxiosRequestConfig` (from this package)
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
import { AxiosClient } from "@odata2ts/http-client-axios";

const httpClient = new AxiosClient(
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
