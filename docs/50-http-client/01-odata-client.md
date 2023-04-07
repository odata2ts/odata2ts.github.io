---
id: http-client
sidebar_position: 1
---

# OData HTTP Client

To perform the actual HTTP request `odata2ts` requires a third-party library. There are multiple popular choices
and each choice has their pros and cons.

To support different odata client implementations - using whatever library or native approach they choose -
`odata2ts` uses an abstraction. Package `@odata2ts/odata-client-api` defines the contract between
[odata2ts](https://github.com/odata2ts/odata2ts) and any HTTP client implementation.
This API is largely based on how [axios](https://github.com/axios/axios) defines and handles things.

The responsibilities of the HTTP Client are:

- HTTP request execution
- Mapping responses to conventionalized structures
- Custom request configuration (optional)
- Automatic CSRF Token Handling (optional)

Features like **optimistic locking** (via `ETag`) or **batch requests** are currently not in scope
of the HTTP client and may never be.

Provided implementations:

- [Axios OData Client](./axios-odata-client): for any modern webapp
- [JQuery OData Client](./jquery-odata-client): for UI5

## Execute HTTP Requests

An HTTP client is required to perform the actual HTTP requests:

- `GET`: Read data from an entity set or a function
- `POST`: Create an entity or perform an action
- `PUT`: Update a complete entity
- `PATCH`: Update an entity partially
- `MERGE`: Same as PATCH, only needed for OData V2 services
- `DELETE`: Delete an entity

Package `@odata2ts/odata-client-api` defines the signatures and, especially, the response types of these methods.

`odata2ts` will provide URL and data (if any) for the request and call the appropriate method (get, post, ...),
the HTTP client will then perform the actual request and respond with a generic, but conventionalized data structure.

## Allow for Request Configuration

The HTTP client should provide a `request configuration` type to allow the user to override or add
things to the request.

## CSRF Token Handling

To protect against **Cross Site Request Forgery (CSRF)** servers require clients to send so-called "CSRF tokens"
with any manipulating request (POST, PUT, PATCH, DELETE). So such a token must be retrieved from the server
before the actual request.

HTTP Clients can automate the retrieval of CSRF tokens and their addition to the header of the request.
