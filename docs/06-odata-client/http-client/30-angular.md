---
id: angular
sidebar_position: 30
---

# Angular OData Client

`AngularODataClient` is an injectable service (`providedIn: "root"`) that wraps the `HttpClient` instance
provided through Angular's dependency injection - it does not create its own `HttpClient` or configure the
`HttpClientModule`/`provideHttpClient` setup, which remains the consuming application's responsibility. It
works the same either way regardless of which backend that setup chooses - `provideHttpClient()`
(`XhrBackend`) or `provideHttpClient(withFetch())` (`FetchBackend`).

It supports:

- request configuration (custom headers, query params)
- uploading and downloading binary data (`createBlob` / `updateBlob` / `getBlob`)
- customizing how the OData error message is extracted from a failed response's body
  (`setErrorMessageRetriever`)
- automatic CSRF token handling for the OData handshake (`useCsrfProtection` / `csrfTokenFetchUrl`,
  see below) - this is a **different** mechanism than Angular's own built-in XSRF protection
  (`withXsrfConfiguration`), which only echoes back a cookie the server already set and knows nothing about
  the `X-CSRF-Token: Fetch` / `Required` handshake OData services use

## Setup

Install package `@odata2ts/http-client-angular` as runtime dependency:

```bash npm2yarn
npm install --save @odata2ts/http-client-angular
```

`@angular/core`, `@angular/common` and `rxjs` are peer dependencies of this package, so they are not
contained in or installed through this package.

## Configuration

Use the second constructor parameter to pass your global configuration for the client.
The configuration is of type `AngularODataRequestConfig` (from `@odata2ts/http-client-angular` package)
and will be applied to all requests made with this client.
