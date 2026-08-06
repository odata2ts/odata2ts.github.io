---
id: odata-v1-v3-feature-matrix
title: OData V1-V3 Feature Matrix
sidebar_position: 4
---

# OData V1–V3 Feature Matrix

This document lists the features of **OData 1.0, 2.0 and 3.0**, independent of any client library. It is the
counterpart to [odata-v4.md](./03-odata-v4.md) and follows the same structure.

**Why one document for three versions.** The normative specification, [\[MS-ODATA\]][ms-odata], describes 1.0, 2.0
and 3.0 in a single text and does not mention 4.0 at all. The three versions form one continuous lineage: 2.0 and
3.0 add to their predecessor rather than replacing it, and a 3.0 service is still a 2.0 service. The real break is
between 3.0 and 4.0 — new specification family (OASIS), `$links` becomes `$ref`, `DataServiceVersion` becomes
`OData-Version`, conformance levels appear. Splitting this document at that boundary follows the sources; splitting
it per version would cut one source into three overlapping pieces.

**Scope & assumptions**

- The `Versions` column carries the whole version story, so a feature's history is visible in place.
- Only the **JSON formats** are detailed. All three versions also define an Atom/XML format — in V1 and V2 it is
  the _default_ — but it is referenced here, not broken down.
- The full protocol is described, not just the client's share: schema constructs and server obligations included.
- Where the prose documentation and the ABNF grammar disagree, the **ABNF wins**. This matters: the V3 URL
  Conventions page never mentions lambda operators, while the V3 ABNF defines `anyExpr` and `allExpr`.

**Sources**

| Prefix       | Document                                                             |
| ------------ | -------------------------------------------------------------------- |
| **MS**       | [\[MS-ODATA\]: Open Data Protocol][ms-odata] — normative for 1.0–3.0 |
| **V2:Uri**   | [OData 2.0 URI Conventions][v2-uri]                                  |
| **V2:Ops**   | [OData 2.0 Operations][v2-ops]                                       |
| **V2:Json**  | [OData 2.0 JSON Format][v2-json]                                     |
| **V2:Batch** | [OData 2.0 Batch Processing][v2-batch]                               |
| **V3:Core**  | [OData 3.0 Core Protocol][v3-core]                                   |
| **V3:Uri**   | [OData 3.0 URL Conventions][v3-uri]                                  |
| **V3:Csdl**  | [OData 3.0 CSDL][v3-csdl]                                            |
| **V3:Abnf**  | [OData 3.0 ABNF][v3-abnf]                                            |
| **V3:Json**  | [OData 3.0 JSON Verbose Format][v3-json]                             |

The odata.org pages are single long documents without stable section anchors, so the **Spec** column links at page
level: the prefix names the document, the row names the feature.

**Legend**

| Value     | Meaning                                                                             |
| --------- | ----------------------------------------------------------------------------------- |
| `1.0+`    | Present since 1.0 and still current in 3.0                                          |
| `2.0+`    | Added in 2.0, still current in 3.0                                                  |
| `3.0`     | Added in 3.0                                                                        |
| `1.0–2.0` | Present in 1.0 and 2.0, but **superseded in 3.0** — the replacement has its own row |

**Required vs. optional — the `Role` and `Requirement` columns**

Unlike V4, **OData V1–V3 have no conformance levels** — no Minimal/Intermediate/Advanced grading, no _Updatable_
qualifier. The obligation is therefore expressed on two axes.

`Role` — **on whom** the obligation falls:

| Value    | Meaning                                                  |
| -------- | -------------------------------------------------------- |
| `Server` | The data service has to provide or honour it             |
| `Client` | The consumer has to send, follow or tolerate it          |
| `Both`   | Obligations on both sides                                |
| `–`      | Not an obligation: a modelling construct or a definition |

`Requirement` — **how hard** the obligation is, per [RFC 2119][rfc2119]:

| Value    | Meaning                                                           |
| -------- | ----------------------------------------------------------------- |
| `MUST`   | Mandatory                                                         |
| `SHOULD` | Recommended; may be omitted, so the other side cannot rely on it  |
| `MAY`    | Entirely optional                                                 |
| `–`      | Not applicable — the row describes a construct, not an obligation |

> **The single most important thing to know about this table.** Across all three versions, almost the entire query
> surface is graded `MAY`. [MS-ODATA] phrases it per capability — "_A data service MAY support the binary equality
> operator_", "_… MAY support the substringof method_", "_… MAY support the `$inlinecount` system query option_".
> There is no level at which `$filter`, `$top` or even `eq` becomes mandatory, and the prescribed answer to an
> unsupported option is `501 Not Implemented`. In V4 those same features are `MUST` from the Intermediate
> conformance level. **A V1–V3 client can assume nothing about a service's query capabilities** and must either
> discover them by trying or know its target service. This is the sharpest practical difference to V4.

**How to read this document**

The matrix is **multi-level**. The [Overview](#overview) summarizes the protocol into coarse areas; each area is a
section with its own table, split further where a topic has real depth. Read the overview for orientation, then
descend only where needed.

---

## Overview

| #                                    | Area                       | What it covers                                            | Spec                 |
| ------------------------------------ | -------------------------- | --------------------------------------------------------- | -------------------- |
| [1](#1-data-model--schema)           | Data model & schema        | Types, properties, associations, containers, vocabularies | [V3:Csdl][v3-csdl]   |
| [2](#2-service-model)                | Service model              | Service root, service document, metadata document         | [V3:Core][v3-core]   |
| [3](#3-versioning--extensibility)    | Versioning & extensibility | `DataServiceVersion` negotiation, custom options          | [V3:Core][v3-core]   |
| [4](#4-formats--payloads)            | Formats & payloads         | Format negotiation, JSON Verbose, JSON Light              | [V2:Json][v2-json]   |
| [5](#5-header-fields)                | Header fields              | Request and response headers                              | [V3:Core][v3-core]   |
| [6](#6-status-codes--error-handling) | Status codes & errors      | Status codes, error payloads                              | [V2:Ops][v2-ops]     |
| [7](#7-resource-addressing)          | Resource addressing        | URI construction, path segments                           | [V2:Uri][v2-uri]     |
| [8](#8-querying-data)                | Querying data              | System query options and the filter language              | [V3:Uri][v3-uri]     |
| [9](#9-data-modification)            | Data modification          | Insert, update, delete, links, media                      | [V2:Ops][v2-ops]     |
| [10](#10-operations)                 | Operations                 | Service operations, actions, functions                    | [V3:Csdl][v3-csdl]   |
| [11](#11-batch-requests)             | Batch requests             | Multipart batch, change sets                              | [V2:Batch][v2-batch] |
| [12](#12-security)                   | Security                   | Transport, the `d` wrapper rationale                      | [V2:Json][v2-json]   |
| [13](#13-not-in-odata-v1v3)          | Not in V1–V3               | What V4 adds on top                                       | –                    |

---

## 1. Data Model & Schema

The model grows noticeably across the three versions: 1.0 and 2.0 share a compact EDM, while 3.0 adds enumeration
types, collection-valued properties, geospatial types and vocabularies.

| Feature                        | Description                                                                                                                                | Versions |  Role  | Requirement | Spec               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | :------: | :----: | :---------: | ------------------ |
| Entity type                    | Structured type with a key                                                                                                                 |  `1.0+`  |   –    |      –      | [MS][ms-odata]     |
| Complex type                   | Structured type without identity; cannot hold navigation properties                                                                        |  `1.0+`  |   –    |      –      | [MS][ms-odata]     |
| Structural property            | Primitive- or complex-typed property                                                                                                       |  `1.0+`  |   –    |      –      | [MS][ms-odata]     |
| Navigation property            | Traversal of an association                                                                                                                |  `1.0+`  |   –    |      –      | [MS][ms-odata]     |
| Entity container               | Groups entity sets, association sets and function imports                                                                                  |  `1.0+`  |   –    |      –      | [MS][ms-odata]     |
| Entity set                     | Named collection of entities of one type                                                                                                   |  `1.0+`  |   –    |      –      | [MS][ms-odata]     |
| Primitive types                | `Binary`, `Boolean`, `Byte`, `DateTime`, `Decimal`, `Double`, `Single`, `Guid`, `Int16/32/64`, `SByte`, `String`, `Time`, `DateTimeOffset` |  `1.0+`  |   –    |      –      | [MS][ms-odata]     |
| Facets                         | `Nullable`, `MaxLength`, `Precision`, `Scale`, `FixedLength`, …                                                                            |  `1.0+`  |   –    |      –      | [MS][ms-odata]     |
| `ConcurrencyMode`              | Marks a property as a concurrency token                                                                                                    |  `1.0+`  |   –    |      –      | [V3:Csdl][v3-csdl] |
| **Enumeration type**           | `edm:EnumType` as a schema element                                                                                                         |  `3.0`   |   –    |      –      | [V3:Csdl][v3-csdl] |
| **Collection-valued property** | `Collection(Edm.String)`, collections of complex types                                                                                     |  `3.0`   |   –    |      –      | [V3:Csdl][v3-csdl] |
| **Geospatial types**           | `Edm.Geography*` and `Edm.Geometry*`                                                                                                       |  `3.0`   |   –    |      –      | [V3:Csdl][v3-csdl] |
| **Named resource stream**      | Additional binary stream on an entity, besides the media resource                                                                          |  `3.0`   |   –    |      –      | [V3:Core][v3-core] |
| **Container inheritance**      | `edm:Extends` on an entity container                                                                                                       |  `3.0`   |   –    |      –      | [V3:Csdl][v3-csdl] |
| CSDL representation            | Schema as XML; there is no JSON representation of the schema before V4                                                                     |  `1.0+`  | Server |    MUST     | [V3:Csdl][v3-csdl] |
| Custom annotations             | Foreign-namespace markup in the schema, ignorable by clients                                                                               |  `1.0+`  | Client |     MAY     | [MS][ms-odata]     |

### 1.1 Keys & Identity

| Feature           | Description                                           | Versions |  Role  | Requirement | Spec               |
| ----------------- | ----------------------------------------------------- | :------: | :----: | :---------: | ------------------ |
| Entity key        | One or more non-nullable properties declared as `Key` |  `1.0+`  |   –    |      –      | [MS][ms-odata]     |
| Composite key     | `Set(A=1,B='x')`                                      |  `1.0+`  |   –    |      –      | [V2:Uri][v2-uri]   |
| Canonical URI     | Every entity has one, surfaced as `__metadata.uri`    |  `1.0+`  | Server |    MUST     | [V2:Json][v2-json] |
| Concurrency token | Surfaced as an ETag                                   |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops]   |
| Alternate keys    | –                                                     |    –     |   –    |      –      | _not before V4_    |

### 1.2 Relationships

Relationships are modelled **explicitly**, through `Association` and `AssociationSet`. A navigation property points
at an association rather than at a target set. This indirection disappears in V4, and it is what lets a V1–V3 model
expose one entity type through several entity sets unambiguously.

| Feature                | Description                                                         | Versions |  Role  | Requirement | Spec               |
| ---------------------- | ------------------------------------------------------------------- | :------: | :----: | :---------: | ------------------ |
| Association            | Named relationship between two entity types                         |  `1.0+`  |   –    |      –      | [V3:Csdl][v3-csdl] |
| Association end        | One side, with role name and multiplicity (`1`, `0..1`, `*`)        |  `1.0+`  |   –    |      –      | [V3:Csdl][v3-csdl] |
| Association set        | Binds an association to concrete entity sets                        |  `1.0+`  |   –    |      –      | [V3:Csdl][v3-csdl] |
| Referential constraint | Principal/dependent ends and the participating properties           |  `1.0+`  |   –    |      –      | [V3:Csdl][v3-csdl] |
| Cascade delete         | `OnDelete` on an association end                                    |  `1.0+`  | Server |     MAY     | [V3:Csdl][v3-csdl] |
| **Containment**        | `edm:ContainsTarget` — the target is contained in the source entity |  `3.0`   |   –    |      –      | [V3:Csdl][v3-csdl] |

### 1.3 Inheritance

| Feature                  | Description                                                      | Versions |  Role  | Requirement | Spec               |
| ------------------------ | ---------------------------------------------------------------- | :------: | :----: | :---------: | ------------------ |
| Entity type inheritance  | `BaseType` on an entity type                                     |  `1.0+`  |   –    |      –      | [V3:Csdl][v3-csdl] |
| Complex type inheritance | `BaseType` on a complex type                                     |  `1.0+`  |   –    |      –      | [V3:Csdl][v3-csdl] |
| Abstract types           | `Abstract="true"`                                                |  `1.0+`  |   –    |      –      | [V3:Csdl][v3-csdl] |
| Type in the payload      | `__metadata.type`, mandatory once the entry is not the base type |  `1.0+`  | Server |    MUST     | [V2:Json][v2-json] |
| **Type cast in a path**  | `.../Namespace.SubType` as a path segment                        |  `3.0`   | Server |     MAY     | [V3:Uri][v3-uri]   |

### 1.4 Vocabularies & Annotations

Introduced in 3.0 and the direct ancestor of V4's vocabulary mechanism.

| Feature              | Description                                               | Versions |  Role  | Requirement | Spec               |
| -------------------- | --------------------------------------------------------- | :------: | :----: | :---------: | ------------------ |
| `edm:ValueTerm`      | Declares a term that can be annotated onto model elements |  `3.0`   |   –    |      –      | [V3:Csdl][v3-csdl] |
| `edm:Annotations`    | Applies terms to model elements                           |  `3.0`   |   –    |      –      | [V3:Csdl][v3-csdl] |
| Instance annotations | Annotations carried in the payload rather than the model  |  `3.0`   | Server |     MAY     | [V3:Core][v3-core] |

---

## 2. Service Model

| Feature           | Description                                 | Versions |  Role  | Requirement | Spec               |
| ----------------- | ------------------------------------------- | :------: | :----: | :---------: | ------------------ |
| Service root      | Base URI all resource paths are relative to |  `1.0+`  |   –    |      –      | [V2:Uri][v2-uri]   |
| Service document  | Lists the entity sets at the service root   |  `1.0+`  | Server |    MUST     | [V2:Uri][v2-uri]   |
| Metadata document | The CSDL schema at `$metadata`              |  `1.0+`  | Server |    MUST     | [V3:Csdl][v3-csdl] |
| Read URI          | Canonical URI used to read an entity        |  `1.0+`  | Server |    MUST     | [V2:Json][v2-json] |
| Edit URI          | URI used to modify an entity                |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops]   |
| Singleton         | –                                           |    –     |   –    |      –      | _not before V4_    |

---

## 3. Versioning & Extensibility

Version negotiation is a genuine handshake here, unlike V4 where the version is effectively fixed by the service.
3.0 completes it by adding a lower bound.

| Feature                         | Description                                                                                  | Versions |  Role  | Requirement | Spec               |
| ------------------------------- | -------------------------------------------------------------------------------------------- | :------: | :----: | :---------: | ------------------ |
| `DataServiceVersion` (request)  | Version of the payload the client sends                                                      |  `1.0+`  | Client |    MUST     | [V2:Ops][v2-ops]   |
| `DataServiceVersion` (response) | Version of the payload the server returns                                                    |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops]   |
| `MaxDataServiceVersion`         | Highest version the client can process                                                       |  `2.0+`  | Client |   SHOULD    | [V2:Ops][v2-ops]   |
| **`MinDataServiceVersion`**     | Lowest version the client will accept                                                        |  `3.0`   | Client |     MAY     | [V3:Core][v3-core] |
| Version-dependent payloads      | The same resource is serialized differently per version — most visibly the `results` wrapper |  `2.0+`  | Server |    MUST     | [V2:Json][v2-json] |
| Custom query options            | Options without a `$` prefix, defined by the service                                         |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri]   |
| Reserved names                  | Names starting with `$` are reserved for the protocol                                        |  `1.0+`  |  Both  |    MUST     | [V2:Uri][v2-uri]   |
| Custom headers                  | Headers outside the protocol, ignored by conforming implementations                          |  `1.0+`  |  Both  |     MAY     | [V2:Ops][v2-ops]   |

---

## 4. Formats & Payloads

The format story is where 3.0 breaks most visibly with its predecessors: it introduces a new, compact JSON
representation and demotes the old one to an opt-in.

| Feature                 | Description                                                                                               | Versions |  Role  | Requirement | Spec               |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | :------: | :----: | :---------: | ------------------ |
| Atom/XML format         | The default format in 1.0 and 2.0                                                                         |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops]   |
| JSON Verbose            | The JSON representation of 1.0/2.0; in 3.0 only on request via `odata=verbose`                            |  `1.0+`  | Server |    MUST     | [V3:Json][v3-json] |
| **JSON Light**          | Compact JSON with selectable metadata level; the default JSON of 3.0                                      |  `3.0`   | Server |    MUST     | [V3:Core][v3-core] |
| **Metadata level**      | `odata=nometadata` / `minimalmetadata` / `fullmetadata`                                                   |  `3.0`   | Client |     MAY     | [V3:Core][v3-core] |
| Format negotiation      | Via the `Accept` header                                                                                   |  `1.0+`  |  Both  |    MUST     | [V2:Ops][v2-ops]   |
| `$format`               | Overrides `Accept` from within the URI                                                                    |  `2.0+`  | Server |     MAY     | [V2:Uri][v2-uri]   |
| The `d` wrapper         | **Responses only**, JSON Verbose only — makes the payload valid JSON but not a valid JavaScript statement |  `1.0+`  | Server |    MUST     | [V2:Json][v2-json] |
| Request payloads        | Sent **without** the `d` wrapper                                                                          |  `1.0+`  | Client |    MUST     | [V2:Json][v2-json] |
| Primitive value mapping | EDM types onto JSON literals; `DateTime` as `/Date(ticks)/` in JSON Verbose                               |  `1.0+`  |  Both  |    MUST     | [V2:Json][v2-json] |

### 4.1 JSON Verbose: Reserved Names

There are no `@odata.*` annotations before V4. Metadata travels in reserved members prefixed with a double
underscore.

| Reserved name                                        | Meaning                                                                        | Versions |  Role  | Requirement | Spec               |
| ---------------------------------------------------- | ------------------------------------------------------------------------------ | :------: | :----: | :---------: | ------------------ |
| `__metadata`                                         | Object carrying the metadata of an entry                                       |  `1.0+`  | Server |   SHOULD    | [V2:Json][v2-json] |
| `__metadata.uri`                                     | Canonical URI — not optional within `__metadata`                               |  `1.0+`  | Server |    MUST     | [V2:Json][v2-json] |
| `__metadata.type`                                    | Entity type name; mandatory when the entry is not the base type of a hierarchy |  `1.0+`  | Server |    MUST     | [V2:Json][v2-json] |
| `__metadata.etag`                                    | Concurrency token                                                              |  `1.0+`  | Server |     MAY     | [V2:Json][v2-json] |
| `__metadata.edit_media`, `media_src`, `content_type` | Media resource links                                                           |  `1.0+`  | Server |    MUST     | [V2:Json][v2-json] |
| `__deferred`                                         | Placeholder for a navigation property that was not expanded                    |  `1.0+`  | Server |    MUST     | [V2:Json][v2-json] |
| `results`                                            | Wraps a collection array so the collection can carry metadata                  |  `2.0+`  | Server |    MUST     | [V2:Json][v2-json] |
| `__count`                                            | Total count of the collection, as a **string**                                 |  `2.0+`  | Server |    MUST     | [V2:Json][v2-json] |
| `__next`                                             | Link to the next partial listing under server-driven paging                    |  `2.0+`  | Server |    MUST     | [V2:Json][v2-json] |

### 4.2 Payload Shapes

| Payload                      | Shape                                                               | Versions  |  Role  | Requirement | Spec               |
| ---------------------------- | ------------------------------------------------------------------- | :-------: | :----: | :---------: | ------------------ |
| Single entry                 | `{"d": { …properties… }}`                                           |  `1.0+`   | Server |    MUST     | [V2:Json][v2-json] |
| Collection (1.0 shape)       | `{"d": [ … ]}`                                                      | `1.0–2.0` | Server |    MUST     | [V2:Json][v2-json] |
| Collection (2.0 shape)       | `{"d": {"results": [ … ], "__count": "…", "__next": "…"}}`          |  `2.0+`   | Server |    MUST     | [V2:Json][v2-json] |
| Expanded navigation property | The related entry or collection inline, in place of `__deferred`    |  `1.0+`   | Server |    MUST     | [V2:Json][v2-json] |
| Primitive / complex property | `{"d": {"PropertyName": …}}`                                        |  `1.0+`   | Server |    MUST     | [V2:Json][v2-json] |
| Raw value                    | Unwrapped media type of the value itself, via `$value`              |  `1.0+`   | Server |    MUST     | [V2:Uri][v2-uri]   |
| Links                        | `{"d": {"uri": "…"}}` or a collection thereof, via `$links`         |  `1.0+`   | Server |    MUST     | [V2:Ops][v2-ops]   |
| Error                        | `{"error": {"code": "…", "message": {…}}}` — **not** wrapped in `d` |  `1.0+`   | Server |    MUST     | [V2:Ops][v2-ops]   |

---

## 5. Header Fields

| Header                              | Direction | Meaning                                                                          | Versions |  Role  | Requirement | Spec               |
| ----------------------------------- | :-------: | -------------------------------------------------------------------------------- | :------: | :----: | :---------: | ------------------ |
| `DataServiceVersion`                |   both    | Version of this payload                                                          |  `1.0+`  |  Both  |    MUST     | [V2:Ops][v2-ops]   |
| `MaxDataServiceVersion`             |  request  | Highest version the client accepts                                               |  `2.0+`  | Client |   SHOULD    | [V2:Ops][v2-ops]   |
| `MinDataServiceVersion`             |  request  | Lowest version the client accepts                                                |  `3.0`   | Client |     MAY     | [V3:Core][v3-core] |
| `Content-Type`                      |   both    | Media type of the payload                                                        |  `1.0+`  |  Both  |    MUST     | [V2:Ops][v2-ops]   |
| `Accept`                            |  request  | Requested response format                                                        |  `1.0+`  | Client |   SHOULD    | [V2:Ops][v2-ops]   |
| `Accept-Charset`, `Accept-Language` |  request  | Character set and language negotiation                                           |  `1.0+`  | Client |     MAY     | [V2:Ops][v2-ops]   |
| `If-Match`                          |  request  | Concurrency check on update and delete                                           |  `1.0+`  | Client |    MUST     | [V2:Ops][v2-ops]   |
| `If-None-Match`                     |  request  | Conditional read                                                                 |  `1.0+`  | Client |     MAY     | [V2:Ops][v2-ops]   |
| `ETag`                              | response  | Concurrency token of the resource                                                |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops]   |
| `Location`                          | response  | URI of a newly created entity                                                    |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops]   |
| **`Prefer`**                        |  request  | `return-content` / `return-no-content` — whether the response carries the entity |  `3.0`   | Client |     MAY     | [V3:Core][v3-core] |
| **`Preference-Applied`**            | response  | Which preference the server honoured                                             |  `3.0`   | Server |   SHOULD    | [V3:Core][v3-core] |
| `X-HTTP-Method`                     |  request  | Tunnels `MERGE`/`DELETE`/`PUT` through `POST`                                    |  `1.0+`  | Client |     MAY     | [V2:Ops][v2-ops]   |
| `Slug`                              |  request  | Suggested name when creating a media resource                                    |  `1.0+`  | Client |     MAY     | [V2:Ops][v2-ops]   |

---

## 6. Status Codes & Error Handling

| Code                              | Used for                                                 | Versions |  Role  | Requirement | Spec             |
| --------------------------------- | -------------------------------------------------------- | :------: | :----: | :---------: | ---------------- |
| `200 OK`                          | Successful read, or update returning content             |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops] |
| `201 Created`                     | Entity created, with `Location`                          |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops] |
| `202 Accepted`                    | Accepted for processing                                  |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops] |
| `204 No Content`                  | Successful update or delete without a body               |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops] |
| `304 Not Modified`                | Conditional read matched                                 |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops] |
| `400`, `404`, `405`, `412`, `500` | Client and server errors                                 |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops] |
| `501 Not Implemented`             | The standard answer to an unsupported query option       |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops] |
| Error payload                     | Machine-readable `code` plus a language-tagged `message` |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops] |
| In-stream error                   | Error raised after the response has begun                |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops] |

---

## 7. Resource Addressing

| Feature               | Example                                                     | Versions |  Role  | Requirement | Spec                 |
| --------------------- | ----------------------------------------------------------- | :------: | :----: | :---------: | -------------------- |
| Service root          | `/OData.svc/`                                               |  `1.0+`  | Server |    MUST     | [V2:Uri][v2-uri]     |
| Metadata              | `/OData.svc/$metadata`                                      |  `1.0+`  | Server |    MUST     | [V2:Uri][v2-uri]     |
| Entity set            | `/Products`                                                 |  `1.0+`  | Server |    MUST     | [V2:Uri][v2-uri]     |
| Key predicate         | `/Products(1)`, `/Customers('ALFKI')`                       |  `1.0+`  | Server |    MUST     | [V2:Uri][v2-uri]     |
| Composite key         | `/OrderItems(OrderID=1,ItemNo=2)`                           |  `1.0+`  | Server |    MUST     | [V2:Uri][v2-uri]     |
| Navigation path       | `/Products(1)/Category`                                     |  `1.0+`  | Server |    MUST     | [V2:Uri][v2-uri]     |
| Property access       | `/Products(1)/Name`                                         |  `1.0+`  | Server |    MUST     | [V2:Uri][v2-uri]     |
| Raw value             | `/Products(1)/Name/$value`                                  |  `1.0+`  | Server |    MUST     | [V2:Uri][v2-uri]     |
| Count of a collection | `/Products/$count` — a bare integer                         |  `2.0+`  | Server |     MAY     | [V2:Uri][v2-uri]     |
| Links                 | `/Products(1)/$links/Category` — addresses the relationship |  `1.0+`  | Server |    MUST     | [V2:Uri][v2-uri]     |
| Media resource        | `/Products(1)/$value` on a media link entry                 |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri]     |
| **Named stream**      | `/Products(1)/Thumbnail` on a named resource stream         |  `3.0`   | Server |     MAY     | [V3:Core][v3-core]   |
| **Type cast segment** | `/Products/Namespace.DiscountedProduct`                     |  `3.0`   | Server |     MAY     | [V3:Uri][v3-uri]     |
| Service operation     | `/GetProductsByRating?rating=4`                             |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri]     |
| Batch endpoint        | `/$batch`                                                   |  `2.0+`  | Server |     MAY     | [V2:Batch][v2-batch] |

---

## 8. Querying Data

**Every system query option is `MAY`.** A service supporting none of them is still conforming; the prescribed
answer to an unsupported option is `501 Not Implemented`.

| Option               | Effect                                                              | Versions |  Role  | Requirement | Spec             |
| -------------------- | ------------------------------------------------------------------- | :------: | :----: | :---------: | ---------------- |
| `$filter`            | Restrict the result set by a boolean expression                     |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| `$expand`            | Inline related entities instead of `__deferred`                     |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| `$select`            | Restrict the returned properties                                    |  `2.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| `$orderby`           | Sort the result set                                                 |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| `$top` / `$skip`     | Client-driven paging                                                |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| `$skiptoken`         | Continuation token for server-driven paging; produced by the server |  `2.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| `$inlinecount`       | `allpages` or `none`; adds `__count` to the payload                 |  `2.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| `$format`            | Choose the response format from the URI                             |  `2.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| Custom query options | Service-defined, without a `$` prefix                               |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| `$search`            | –                                                                   |    –     |   –    |      –      | _not before V4_  |

### 8.1 `$select` & `$expand`

The decisive limitation, and it holds through **all three versions**: `$expand` carries no nested query options.
The V3 grammar is `expandItem = [qualifiedEntityTypeName "/"] navigationPropertyName *(…)` — paths and type casts
only, with no place to put options. An expanded collection therefore comes back whole, or not at all.

| Feature                           | Example                                              | Versions |  Role  | Requirement | Spec             |
| --------------------------------- | ---------------------------------------------------- | :------: | :----: | :---------: | ---------------- |
| Select properties                 | `$select=Name,Price`                                 |  `2.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| Select all                        | `$select=*`                                          |  `2.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| Expand a navigation property      | `$expand=Category`                                   |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| Expand several                    | `$expand=Category,Supplier`                          |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| Expand a path                     | `$expand=Products/Supplier` — more than one level    |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| Select through an expand          | `$select=Name,Category/Name` with `$expand=Category` |  `2.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| **Type cast inside expand**       | `$expand=Namespace.SubType/NavProp`                  |  `3.0`   | Server |     MAY     | [V3:Uri][v3-uri] |
| Nested query options in `$expand` | –                                                    |    –     |   –    |      –      | _not before V4_  |
| `$levels`                         | –                                                    |    –     |   –    |      –      | _not before V4_  |

### 8.2 `$filter` Expression Language

Everything here is graded `MAY` in [MS-ODATA], down to the individual operator and function — the wording is
uniform ("_A data service MAY support …_"), so it is stated once rather than repeated per row.

#### 8.2.1 Operators

| Group           | Operators                                                   | Versions |  Role  | Requirement | Spec             |
| --------------- | ----------------------------------------------------------- | :------: | :----: | :---------: | ---------------- |
| Comparison      | `eq`, `ne`, `gt`, `ge`, `lt`, `le`                          |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| Logical         | `and`, `or`, `not`                                          |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| Arithmetic      | `add`, `sub`, `mul`, `div`, `mod`                           |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| Unary           | Negation                                                    |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| Grouping        | `( )` for precedence                                        |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| Member access   | `Address/City`                                              |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |
| Null comparison | Against the `null` literal; there is no `isnull`/`coalesce` |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri] |

#### 8.2.2 Built-in Functions

| Group           | Functions                                                                                                                    | Versions |  Role  | Requirement | Spec               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- | :------: | :----: | :---------: | ------------------ |
| String          | `substringof`, `endswith`, `startswith`, `length`, `indexof`, `replace`, `substring`, `tolower`, `toupper`, `trim`, `concat` |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri]   |
| Date            | `day`, `hour`, `minute`, `month`, `second`, `year`                                                                           |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri]   |
| Math            | `round`, `floor`, `ceiling`                                                                                                  |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri]   |
| Type test       | `isof`                                                                                                                       |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri]   |
| **Type cast**   | `cast`                                                                                                                       |  `3.0`   | Server |     MAY     | [V3:Abnf][v3-abnf] |
| **Date offset** | `getTotalOffsetMinutes`                                                                                                      |  `3.0`   | Server |     MAY     | [MS][ms-odata]     |
| **Geospatial**  | `geo.distance`, `geo.length`, `geo.intersects`                                                                               |  `3.0`   | Server |     MAY     | [V3:Abnf][v3-abnf] |

#### 8.2.3 Lambda Operators

Added in 3.0. Worth noting how this was established: the V3 URL Conventions page never mentions them, but the V3
**ABNF** defines `anyExpr`, `allExpr` and `lambdaPredicateExpr`. The grammar is the normative source.

| Feature                   | Description                                                 | Versions |  Role  | Requirement | Spec               |
| ------------------------- | ----------------------------------------------------------- | :------: | :----: | :---------: | ------------------ |
| `any`                     | At least one member of a collection satisfies the predicate |  `3.0`   | Server |     MAY     | [V3:Abnf][v3-abnf] |
| `all`                     | Every member satisfies the predicate                        |  `3.0`   | Server |     MAY     | [V3:Abnf][v3-abnf] |
| `any` without a predicate | The collection is non-empty                                 |  `3.0`   | Server |     MAY     | [V3:Abnf][v3-abnf] |
| `$it`, `$root`            | –                                                           |    –     |   –    |      –      | _not before V4_    |

### 8.3 Ordering, Paging & Counting

| Feature                 | Description                                | Versions |  Role  | Requirement | Spec               |
| ----------------------- | ------------------------------------------ | :------: | :----: | :---------: | ------------------ |
| Sorting                 | `$orderby=Name desc,Price asc`             |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri]   |
| Client-driven paging    | `$top` with `$skip`                        |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri]   |
| Server-driven paging    | Partial listing plus `__next`              |  `2.0+`  | Server |     MAY     | [V2:Json][v2-json] |
| Following a next link   | Client requests the `__next` URI unchanged |  `2.0+`  | Client |    MUST     | [V2:Json][v2-json] |
| Inline count            | `$inlinecount=allpages` produces `__count` |  `2.0+`  | Server |     MAY     | [V2:Uri][v2-uri]   |
| Count as a path segment | `/Products/$count`, plain text             |  `2.0+`  | Server |     MAY     | [V2:Uri][v2-uri]   |

---

## 9. Data Modification

| Feature                      | Method                                                                                                                                                       | Versions |  Role  | Requirement | Spec               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------: | :----: | :---------: | ------------------ |
| Create an entity             | `POST` to an entity set                                                                                                                                      |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops]   |
| Replace an entity            | `PUT` — properties not supplied are reset to their defaults                                                                                                  |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops]   |
| Partial update               | `PATCH (MERGE)` — 1.0/2.0 define the custom method `MERGE`; **3.0 introduces `PATCH` and supersedes `MERGE`**, which remains only for backward compatibility |  `1.0+`  | Server |    MUST     | [V3:Core][v3-core] |
| Delete an entity             | `DELETE` on the edit URI                                                                                                                                     |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops]   |
| Optimistic concurrency       | `If-Match` carrying the ETag on update and delete                                                                                                            |  `1.0+`  |  Both  |    MUST     | [V2:Ops][v2-ops]   |
| Method tunneling             | `POST` plus `X-HTTP-Method` where intermediaries block verbs                                                                                                 |  `1.0+`  | Client |     MAY     | [V2:Ops][v2-ops]   |
| Links on `PUT`               | Links are not part of the structured data and are not reset by `PUT`; merge semantics apply to them either way                                               |  `1.0+`  | Server |   SHOULD    | [V2:Ops][v2-ops]   |
| **Controlling the response** | `Prefer: return-content` / `return-no-content`                                                                                                               |  `3.0`   | Client |     MAY     | [V3:Core][v3-core] |
| Upsert                       | –                                                                                                                                                            |    –     |   –    |      –      | _not before V4_    |

### 9.1 Relationships & Links

Relationship management runs through the `$links` segment — the direct ancestor of V4's `$ref`. A link is a JSON
object with a `uri` member.

| Feature        | Description                                                           | Versions |  Role  | Requirement | Spec             |
| -------------- | --------------------------------------------------------------------- | :------: | :----: | :---------: | ---------------- |
| Read links     | `GET /Products(1)/$links/Category`                                    |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops] |
| Add a link     | `POST` to the `$links` URI of a collection-valued navigation property |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops] |
| Change a link  | `PUT` to the `$links` URI of a single-valued navigation property      |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops] |
| Remove a link  | `DELETE` on the `$links` URI                                          |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops] |
| Deep insert    | Create an entity together with related ones in one `POST`             |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops] |
| Bind on create | Reference an existing entity in the insert payload, via a link        |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops] |

### 9.2 Properties & Values

| Feature                          | Description                                  | Versions |  Role  | Requirement | Spec               |
| -------------------------------- | -------------------------------------------- | :------: | :----: | :---------: | ------------------ |
| Update a primitive property      | `PUT` on the property URI                    |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops]   |
| Update a complex property        | `PUT` or `PATCH (MERGE)` on the property URI |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops]   |
| Update a raw value               | `PUT` on the `$value` URI                    |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops]   |
| Set a value to null              | `DELETE` on the property URI                 |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops]   |
| **Update a collection property** | Replace the whole collection value           |  `3.0`   | Server |     MAY     | [V3:Core][v3-core] |

### 9.3 Media & Streams

| Feature                        | Description                                                            | Versions |  Role  | Requirement | Spec               |
| ------------------------------ | ---------------------------------------------------------------------- | :------: | :----: | :---------: | ------------------ |
| Media link entry               | Entity whose content is a binary stream (`media_src`, `edit_media`)    |  `1.0+`  | Server |     MAY     | [V2:Json][v2-json] |
| Create a media resource        | `POST` of the binary content to the entity set, optionally with `Slug` |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops]   |
| Read / update a media resource | `GET` on `media_src`, `PUT` on `edit_media`                            |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops]   |
| **Named resource stream**      | Additional named streams besides the media resource                    |  `3.0`   | Server |     MAY     | [V3:Core][v3-core] |

---

## 10. Operations

1.0 and 2.0 know exactly one kind of server-defined operation. 3.0 splits it in two — but through an _attribute_,
not through separate schema elements: a `FunctionImport` with `IsSideEffecting="true"` is an **Action**, one
without is a **Function**. The dedicated `<Action>` and `<Function>` elements only arrive in V4.

| Feature                          | Description                                                                          | Versions |  Role  | Requirement | Spec               |
| -------------------------------- | ------------------------------------------------------------------------------------ | :------: | :----: | :---------: | ------------------ |
| Service operation                | Declared as `FunctionImport` in the metadata document                                |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops]   |
| HTTP method                      | `GET` or `POST`, fixed by the declaration                                            |  `1.0+`  | Server |    MUST     | [V2:Ops][v2-ops]   |
| Parameters                       | Query options; primitive types only before 3.0                                       |  `1.0+`  | Client |    MUST     | [V2:Ops][v2-ops]   |
| Return values                    | Primitive, complex, entity or a collection thereof; may return nothing               |  `1.0+`  | Server |     MAY     | [V2:Ops][v2-ops]   |
| Query options on the result      | `$filter` and friends applied to the returned collection                             |  `1.0+`  | Server |     MAY     | [V2:Uri][v2-uri]   |
| **Action**                       | `FunctionImport` with `edm:IsSideEffecting="true"`                                   |  `3.0`   | Server |     MAY     | [V3:Csdl][v3-csdl] |
| **Function**                     | `FunctionImport` without side effects                                                |  `3.0`   | Server |     MAY     | [V3:Csdl][v3-csdl] |
| **Binding**                      | `edm:IsBindable` / `edm:IsAlwaysBindable` — the operation is invocable on a resource |  `3.0`   | Server |     MAY     | [V3:Csdl][v3-csdl] |
| **Advertisement in the payload** | Available actions announced in the entry                                             |  `3.0`   | Server |     MAY     | [V3:Core][v3-core] |
| Composable functions             | –                                                                                    |    –     |   –    |      –      | _not before V4_    |

---

## 11. Batch Requests

| Feature                | Description                                                        | Versions |  Role  | Requirement | Spec                 |
| ---------------------- | ------------------------------------------------------------------ | :------: | :----: | :---------: | -------------------- |
| Batch endpoint         | `POST` to `/$batch`                                                |  `2.0+`  | Server |     MAY     | [V2:Batch][v2-batch] |
| Multipart format       | `multipart/mixed` with a boundary; the only batch format before V4 |  `2.0+`  |  Both  |    MUST     | [V2:Batch][v2-batch] |
| Query operations       | Retrievals as individual parts                                     |  `2.0+`  | Server |    MUST     | [V2:Batch][v2-batch] |
| Change set             | Group of modifications, executed atomically                        |  `2.0+`  | Server |    MUST     | [V2:Batch][v2-batch] |
| Ordering               | Parts are processed in the order given                             |  `2.0+`  | Server |    MUST     | [V2:Batch][v2-batch] |
| Content-ID referencing | Refer to an entity created earlier in the same change set          |  `2.0+`  | Client |     MAY     | [V2:Batch][v2-batch] |
| Error handling         | A failing change set is rolled back as a whole                     |  `2.0+`  | Server |    MUST     | [V2:Batch][v2-batch] |
| JSON batch             | –                                                                  |    –     |   –    |      –      | _not before V4_      |

---

## 12. Security

| Feature            | Description                                                                                                                             | Versions |  Role  | Requirement | Spec               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | :------: | :----: | :---------: | ------------------ |
| Transport security | HTTPS; the protocol defines no authentication scheme of its own                                                                         |  `1.0+`  |  Both  |   SHOULD    | [V2:Ops][v2-ops]   |
| Authentication     | Left to HTTP — Basic, OAuth, cookies are all outside the protocol                                                                       |  `1.0+`  |  Both  |     MAY     | [V2:Ops][v2-ops]   |
| The `d` wrapper    | Exists for security: the response is valid JSON but not a valid JavaScript statement, so it cannot be executed via cross-site scripting |  `1.0+`  | Server |    MUST     | [V2:Json][v2-json] |

---

## 13. Not in OData V1–V3

Everything below exists in V4 and has no equivalent in any of the three earlier versions. Read one way it is the
list of reasons to move to V4; read the other way, the list of things a V1–V3 client never has to implement.

**Data model**

- Type definitions, singletons, open types, untyped values
- Navigation property binding — V1–V3 use `Association` / `AssociationSet` instead
- Vocabularies with defined semantics (`Core.*`, `Capabilities.*`); V3 has the mechanism but not the standard terms
- CSDL as JSON
- Alternate keys, key-as-segment

**Querying**

- **Nested query options inside `$expand`** — the single most consequential gap, and it holds for all three versions
- `$search`, `$compute`, `$apply` (aggregation), `$index`, `$levels`
- `$it`, `$this`, `$root`; parameter aliases
- `$all`, `$crossjoin`, `$entity`, `$filter` as a path segment, `$each`
- A large part of the string and date function set (`has`, `matchesPattern`, `fractionalseconds`, date arithmetic, …)

**Payloads & protocol**

- `@odata.*` control information and its prefix-less 4.01 form — V1–V3 use `__`-prefixed reserved names
- Context URLs — no equivalent concept
- Delta payloads and change tracking
- Asynchronous requests (`respond-async`, status monitors); the `Prefer` header exists from 3.0, but not for async
- JSON batch
- `$ref` — V1–V3 have `$links`; `@odata.bind`
- Upsert, deep update, set-based updates, positional inserts
- Conformance levels — there is no graded notion of "a conforming service" before V4
- `OData-Version` / `OData-MaxVersion` — V1–V3 use `DataServiceVersion` / `MaxDataServiceVersion` / `MinDataServiceVersion`

<!-- Reference link definitions (not rendered as visible text) -->

[v2-uri]: https://www.odata.org/documentation/odata-version-2-0/uri-conventions/
[v2-ops]: https://www.odata.org/documentation/odata-version-2-0/operations/
[v2-json]: https://www.odata.org/documentation/odata-version-2-0/json-format/
[v2-batch]: https://www.odata.org/documentation/odata-version-2-0/batch-processing/
[v3-core]: https://www.odata.org/documentation/odata-version-3-0/odata-version-3-0-core-protocol/
[v3-uri]: https://www.odata.org/documentation/odata-version-3-0/url-conventions/
[v3-csdl]: https://www.odata.org/documentation/odata-version-3-0/common-schema-definition-language-csdl/
[v3-abnf]: https://www.odata.org/documentation/odata-version-3-0/abnf/
[v3-json]: https://www.odata.org/documentation/odata-version-3-0/json-verbose-format/
[ms-odata]: https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-odata/
[rfc2119]: https://tools.ietf.org/html/rfc2119
