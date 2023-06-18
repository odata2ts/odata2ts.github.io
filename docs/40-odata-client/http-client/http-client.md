---
id: http-client
sidebar_position: 50
---

# HTTP Client

To perform actual HTTP requests `odata2ts` requires a third-party library. There are multiple popular choices
and each choice has their pros and cons.

To support different HTTP client implementations - using whatever library or native approach they choose -
`odata2ts` uses an abstraction. Package `@odata2ts/http-client-api` defines the contract between
`odata2ts` and any HTTP client implementation.
This API is largely based on how [axios](https://github.com/axios/axios) defines and handles things.

The responsibilities of the HTTP Client are:

- HTTP request execution
- mapping responses to conventionalized structures
- offer option to set custom error message retriever
- custom request configuration (optional)
- automatic CSRF token handling (optional)

Features like **optimistic locking** (via `ETag`) or **batch requests** are currently not in scope
of the HTTP client and may never be.

Provided implementations:

- [Fetch Client](./fetch): for any modern webapp (and Node.js v18.x apps)
- [Axios Client](./axios): for any modern webapp and Node.js apps
- [JQuery Client](./jquery): for UI5

## Execute HTTP Requests

An HTTP client is required to perform the actual HTTP requests:

- `GET`: Read data from an entity set or a function
- `POST`: Create an entity or perform an action
- `PUT`: Update a complete entity
- `PATCH`: Update an entity partially
- `MERGE`: Same as PATCH, only needed for OData V2 services
- `DELETE`: Delete an entity

Package `@odata2ts/http-client-api` defines the signatures and, especially, the response types of these methods.

`odata2ts` will provide URL and data (if any) for the request and call the appropriate method (get, post, ...),
the HTTP client will then perform the actual request and respond with a generic, but conventionalized data structure.

## Allow for Request Configuration

The HTTP client should provide a `request configuration` type to allow the user to override or add
things to the request.

## CSRF Token Handling

To protect against **Cross Site Request Forgery (CSRF)** servers require clients to send so-called "CSRF tokens"
with any manipulating request (POST, PUT, PATCH, DELETE). Such a token must be retrieved from the server
before the actual request.

HTTP Clients can automate the retrieval of CSRF tokens and their addition to the header of the request.

### How does it work?

If CSRF token handling is enabled and a manipulation request is triggered,
the client first checks the current CSRF token and issues an own request to retrieve one, if need be.
Only then the requested call is executed, for which the CSRF token is added to the header.

If the token is found to be invalid or expired, then the server responds with `403` and specific headers.
The client detects this kind of response and automatically retrieves a new token.
Provided with the new token the original request is executed again.
