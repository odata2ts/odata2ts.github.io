---
id: feature-support
title: Feature Support
sidebar_position: 2
---

# Feature Support

What `odata2ts` supports of the OData protocol, for **V4** (4.0 / 4.01) and **V2**.

| Symbol | Meaning                                                   |
| :----: | --------------------------------------------------------- |
|   ✅   | Supported as a typed, first-class feature                 |
|   🔶   | Partially supported, or reachable through an escape hatch |
|   ❌   | Not supported                                             |
|   ➖   | Not applicable — the protocol version has no such thing   |

The tables describe the **client's** perspective: what you can send and what you get back. Server-side
concerns are out of scope, as is the Atom/XML format — `odata2ts` speaks JSON only.

:::note

This page states what `odata2ts` does. What the **protocol** offers, independent of any implementation, is
inventoried in the [OData V4 feature matrix][spec-v4] and its [V1–V3 counterpart][spec-v2] under
OData Concepts.

:::

## System Query Options

| Option                        | V4  | V2  | Notes                                                                                                      |
| ----------------------------- | :-: | :-: | ---------------------------------------------------------------------------------------------------------- |
| `$select`                     | ✅  | ✅  | Top-level properties; `select("*")` produces the wildcard                                                  |
| `$expand`                     | ✅  | ✅  | [`expand()`](./odata-client/querying#expand) for plain expansion                                           |
| `$expand` with nested options | ✅  | ➖  | [`expanding()`](./odata-client/querying#complex-expanding); V2's syntax cannot carry nested options at all |
| `$filter`                     | ✅  | ✅  | See [Filtering](#filtering)                                                                                |
| `$orderby`                    | ✅  | ✅  | Property paths with `asc()` / `desc()`, multiple criteria                                                  |
| `$top` / `$skip`              | ✅  | ✅  |                                                                                                            |
| `$count`                      | ✅  | ✅  | V4: `@odata.count` on the response model; V2: `__count`                                                    |
| `$search`                     | ✅  | ➖  | Terms and phrases are distinguished automatically                                                          |
| `$apply` (aggregation)        | 🔶  | ➖  | `groupBy()` only — no `aggregate`, `topcount`, `compute`                                                   |
| `$compute`                    | ❌  | ➖  |                                                                                                            |
| `$skiptoken`                  | 🔶  | 🔶  | Never built by the client, which is correct; the next link is exposed and followed manually                |
| `$format`                     | ➖  | ➖  | JSON-only client — negotiated through the `Accept` header                                                  |
| Custom query options          | ✅  | ✅  | Not through the query builder but through the HTTP client's request configuration                          |

The builder only offers what the resource admits: `$filter`, `$orderby`, `$top`, `$skip` and `$count` exist
on a **collection** query, not on a single entity, and `$search` and `groupBy` are V4 collections only.

## Filtering

| Group                 | V4  | V2  | Notes                                                                                                                                                                                    |
| --------------------- | :-: | :-: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Comparison operators  | ✅  | ✅  | `eq`, `ne`, `lt`, `le`, `gt`, `ge`, plus `isNull` / `isNotNull`                                                                                                                          |
| Logical operators     | ✅  | ✅  | `and`, `or`, `not`                                                                                                                                                                       |
| `in`                  | ✅  | ✅  | Emulated as `or`-chained equals by default; V4 can render it natively with [`enableNativeInOperator`](./generator/configuration#using-the-native-in-operator)                            |
| String functions      | ✅  | 🔶  | `contains`, `startsWith`, `endsWith`, `indexOf`, `length`, `concat`, `substring`, `toLower`, `toUpper`, `trim`, `matchesPattern`; V2's `replace` is missing, `matchesPattern` is V4 only |
| `has` (flag enums)    | ✅  | ➖  | Offered on a property whose enum is declared `IsFlags="true"`, and on no other; V2 has no enum types                                                                                     |
| Arithmetic            | ✅  | ✅  | `add`, `sub`, `mul`, `div`, `mod`                                                                                                                                                        |
| Number functions      | ✅  | ✅  | `round`, `floor`, `ceiling`                                                                                                                                                              |
| Date & time functions | 🔶  | 🔶  | The component functions (`year`, `month`, `day`, `hour`, …); `now`, `totalseconds` and date arithmetic are missing                                                                       |
| Lambda operators      | ✅  | ➖  | `any()` / `all()` over collections                                                                                                                                                       |
| `cast` / `isof`       | ❌  | ➖  |                                                                                                                                                                                          |
| Geo functions         | ❌  | ➖  | Geo types are typed as `string`                                                                                                                                                          |
| Custom expressions    | ✅  | ✅  | An escape hatch for anything the builder does not model                                                                                                                                  |

## Reading and Writing

| Feature                            | V4  | V2  | Notes                                                                                                    |
| ---------------------------------- | :-: | :-: | -------------------------------------------------------------------------------------------------------- |
| Read entity / collection           | ✅  | ✅  | Typed response models per version                                                                        |
| Create, update, patch, delete      | ✅  | ✅  | V2 sends `MERGE` where the protocol demands it                                                           |
| `$select` / `$expand` on a write   | ✅  | ✅  | The same builder as on a read                                                                            |
| Editable models                    | ✅  | ✅  | Managed properties are excluded — see [managed properties](./generator/configuration#managed-properties) |
| Binding an existing entity         | ✅  | ✅  | By key; rendered as `@odata.bind` (4.0), `{"@id": …}` (4.01) or `__metadata.uri` (V2)                    |
| Deep insert / deep update          | ✅  | ✅  | Related entities inside the parent's payload                                                             |
| Return representation              | ✅  | ➖  | `patch<true>()` plus `Prefer: return=representation`                                                     |
| Individual property access         | ✅  | ✅  | Opt-in via [`enablePrimitivePropertyServices`](./generator/configuration#primitive-property-services)    |
| Optimistic concurrency (ETag)      | ❌  | ❌  | No `If-Match` workflow; possible through manual headers                                                  |
| Relationship management via `$ref` | ❌  | ➖  |                                                                                                          |
| Batch requests                     | ❌  | ❌  | Out of scope of the HTTP client design                                                                   |
| Delta / change tracking            | ❌  | ➖  |                                                                                                          |
| Asynchronous requests              | ❌  | ➖  |                                                                                                          |

## Operations

| Feature                     | V4  | V2  | Notes                                                                                                  |
| --------------------------- | :-: | :-: | ------------------------------------------------------------------------------------------------------ |
| Unbound functions / actions | ✅  | ✅  | V2 has `FunctionImport` only, distinguished by its HTTP method                                         |
| Bound operations            | ✅  | ➖  | Generated onto the service of the bound type                                                           |
| Typed parameters            | ✅  | ✅  | One parameter model and one q-function / q-action per operation                                        |
| Function overloads          | ✅  | ➖  |                                                                                                        |
| Composable functions        | ✅  | ➖  | `compose()` applies query options to a function's result                                               |
| Query options in the body   | ✅  | ➖  | `asPostRequest()` moves the query string into `POST …/$query`, for URLs beyond a server's length limit |

## Binary Content

| Feature                          | V4  | V2  | Notes                                                       |
| -------------------------------- | :-: | :-: | ----------------------------------------------------------- |
| Media entities (`$value`)        | ✅  | ✅  | Own service per media entity                                |
| Stream properties (`Edm.Stream`) | ✅  | ➖  | Own service per stream property                             |
| Streaming transfer               | ✅  | ✅  | Content can be transferred as a stream rather than buffered |
| `Edm.Binary`                     | ✅  | ✅  | base64 in the payload                                       |

## Types and Payload Format

| Feature                      | V4  | V2  | Notes                                                                                                                                                                                           |
| ---------------------------- | :-: | :-: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primitive types              | ✅  | ✅  | See [OData Data Types](pathname:///odata-concepts/odata-types)                                                                                                                                  |
| Converters                   | ✅  | ✅  | See [Converters](./converters)                                                                                                                                                                  |
| Enum types                   | ✅  | ➖  | V2 knows no enums; as string enum, numeric enum or string union                                                                                                                                 |
| Complex types                | ✅  | ✅  |                                                                                                                                                                                                 |
| Inheritance and type casts   | ✅  | 🔶  | V4 addresses derived types by cast segment; V2 renders the hierarchy but cannot serialise it                                                                                                    |
| Open types                   | ✅  | ➖  | The declared properties are typed; the dynamic ones cannot be, since nothing announces them                                                                                                     |
| `IEEE754Compatible`          | ✅  | ➖  | [`v4.bigNumberAsString`](./generator/configuration#big-number-handling)                                                                                                                         |
| 4.01 short-form control info | ✅  | ➖  | [`odataVersionV4`](./generator/configuration#odata-401) selects one spelling, requests and responses alike                                                                                      |
| `metadata=full` / `none`     | 🔶  | ➖  | Through a manual `Accept` header; the extra control information stays untyped                                                                                                                   |
| Instance annotations         | 🔶  | 🔶  | Passed through untyped                                                                                                                                                                          |
| Vocabulary annotations       | 🔶  | 🔶  | `Core.*` terms for [managed properties](./generator/configuration#managed-properties), `Validation.AllowedValues` for [derived enums](./generator/configuration#enums-a-service-only-describes) |
| `results` wrapping           | ➖  | ✅  | See [extra results wrapper](./generator/configuration#extra-results-wrapper)                                                                                                                    |

## Deliberately Out of Scope

Not gaps but decisions:

- **Runtime metadata access.** `odata2ts` reads the metadata at build time and generates from it, so there
  is nothing to fetch and interpret at runtime — no `$metadata` or service document handling.
- **Atom / XML payloads.** JSON only.
- **`$format`.** Format negotiation belongs in the `Accept` header.

[spec-v4]: pathname:///odata-concepts/odata-v4-feature-matrix
[spec-v2]: pathname:///odata-concepts/odata-v1-v3-feature-matrix
