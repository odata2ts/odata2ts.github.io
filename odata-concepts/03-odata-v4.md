---
id: odata-v4-feature-matrix
title: OData V4 Feature Matrix
sidebar_position: 3
---

# OData V4 Feature Matrix

A structured inventory of **everything the OData V4 (4.0 / 4.01) protocol defines** — independent of any
implementation. This document describes the specification only; it makes no statement about any client or server
library.

The companion document [odata-v1-v3.md](./04-odata-v1-v3.md) does the same for OData
1.0, 2.0 and 3.0 — those three share one normative specification and one continuous lineage, so they are covered
together, with the break placed where it actually is: between 3.0 and 4.0. Coverage of a concrete implementation is
tracked separately — for `odata2ts` itself see [feature support](pathname:///docs/feature-support).

**Scope**

- Covers the **complete protocol**: not only what a client sends and receives, but also the data model (CSDL),
  service obligations, conformance levels and security considerations.
- **JSON** is the payload format described here. Atom/XML is a defined but rarely used alternative format and is
  not broken down; CSDL is covered in both its XML and JSON representation.
- The [OData Protocol specification (Part 1)][p1-root] provides the backbone of this document; URL syntax, payload
  shapes and schema details are pulled in from Parts 2, the JSON Format and the CSDL specification.

**Sources**

| Prefix       | Document                                          |
| ------------ | ------------------------------------------------- |
| **Protocol** | [OData V4.01 Part 1: Protocol][p1-root]           |
| **Url**      | [OData V4.01 Part 2: URL Conventions][p2-root]    |
| **Json**     | [OData JSON Format V4.01][json-root]              |
| **Csdl**     | [OData CSDL XML Representation V4.01][csdl-root]  |
| **Agg**      | [OData Data Aggregation Extension V4.0][agg-root] |

**Legend**

| Symbol | Meaning                 |
| ------ | ----------------------- |
| `4.0`  | Present since OData 4.0 |
| `4.01` | Added in OData 4.01     |

**Required vs. optional — the `Role`, `Conformance` and `Requirement` columns**

OData has no flat required/optional split. It defines [three conformance levels][p1-conformance] plus an orthogonal
_Updatable_ qualifier, and grades each rule as `MUST` / `SHOULD` / `MAY`. Those are independent axes, so the matrix
carries them in three columns.

`Role` — **on whom** the obligation falls:

| Value    | Meaning                                                  |
| -------- | -------------------------------------------------------- |
| `Server` | The service has to provide or honour it                  |
| `Client` | The consumer has to send, follow or tolerate it          |
| `Both`   | Obligations on both sides                                |
| `–`      | Not an obligation: a modelling construct or a definition |

The conformance levels are defined for **services**, so most rows are `Server`. `Client` marks the places where the
protocol puts the duty on the consumer — following a `nextLink` or a delta link, polling an async status monitor,
composing batch dependencies. For header rows the value follows the `Direction` column.

`Conformance` — **at which level** the feature is demanded, i.e. the weakest level that requires it:

| Value  | Meaning                                                                          |
| ------ | -------------------------------------------------------------------------------- |
| `Core` | Part of the core protocol or data model, not gated by a conformance level at all |
| `Min`  | Minimal conformance level — every conformant service                             |
| `Int`  | Intermediate conformance level and upwards                                       |
| `Adv`  | Advanced conformance level and upwards                                           |
| `Upd`  | A service that supports modification (_Updatable OData Service_)                 |
| `–`    | No level demands it; support is entirely at the service's discretion             |

`Requirement` — **how hard** the demand is, in the sense of [RFC 2119][rfc2119]:

| Value    | Meaning                                                                                             |
| -------- | --------------------------------------------------------------------------------------------------- |
| `MUST`   | Mandatory at the stated conformance level                                                           |
| `SHOULD` | Recommended; a service may omit it, so a client cannot rely on it                                   |
| `MAY`    | Entirely optional                                                                                   |
| `–`      | Not applicable — the row describes a `Core` construct, which is not phrased as a service obligation |

The two columns combine: `Min` + `MUST` is the hard floor every service meets, while `–` + `MAY` is never
guaranteed. Two combinations never occur, by construction: `SHOULD` alongside a conformance level, since a
recommendation is not a level requirement; and a graded requirement on a `Core` row, since those describe what the
protocol _is_ rather than what a service has to _do_. A client that must work against arbitrary services can rely
on `Core` and `Min` alone.

Values are derived from [Protocol §13.1][p1-conformance40] (4.0) and [§13.2][p1-conformance401] (4.01); where the
two versions differ, the stricter one is shown.

**How to read this document**

The matrix is **multi-level**. The [Overview](#overview) summarizes the protocol into coarse areas. Each area then
has its own section listing its features, and the genuinely complex ones — nested `$expand`, the `$filter`
expression language, `$apply` transformations, the schema elements — are broken down one level further into their
own subsections.

---

## Overview

| #                                       | Area                        | What it covers                                              | Spec                                                  |
| --------------------------------------- | --------------------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| [1](#1-data-model--schema)              | Data model & schema         | Types, properties, relationships, containers, annotations   | [Protocol - Data Model][p1-datamodel]                 |
| [2](#2-service-model)                   | Service model               | Entity-ids, read/edit URLs, transient entities, namespaces  | [Protocol - Service Model][p1-servicemodel]           |
| [3](#3-versioning--extensibility)       | Versioning & extensibility  | Protocol/model versioning, extension points                 | [Protocol - Versioning][p1-versioning]                |
| [4](#4-formats--json-payloads)          | Formats & JSON payloads     | Format negotiation, control information, payload shapes     | [Json - Format Design][json-design]                   |
| [5](#5-header-fields--preferences)      | Header fields & preferences | Request/response headers, `Prefer` and `Preference-Applied` | [Protocol - Header Fields][p1-headers]                |
| [6](#6-status-codes--error-handling)    | Status codes & errors       | Success/error codes, error body, in-stream errors           | [Protocol - Status Codes][p1-statuscodes]             |
| [7](#7-context-url)                     | Context URL                 | `@odata.context` per payload kind                           | [Protocol - Context URL][p1-contexturl]               |
| [8](#8-resource-addressing)             | Resource addressing         | Service root, key predicates, path segments, casts          | [Url - Resource Path][p2-resourcepath]                |
| [9](#9-querying-data)                   | Querying data               | `$select`/`$expand`, `$filter`, ordering, paging, counting  | [Protocol - Requesting Data][p1-requestingdata]       |
| [10](#10-change-tracking-delta)         | Change tracking (delta)     | `track-changes`, delta links, delta payloads                | [Protocol - Requesting Changes][p1-requestingchanges] |
| [11](#11-data-modification)             | Data modification           | Create/update/delete, relationships, streams, collections   | [Protocol - Data Modification][p1-datamodification]   |
| [12](#12-operations-functions--actions) | Operations                  | Functions and actions, binding, overload resolution         | [Protocol - Operations][p1-operations]                |
| [13](#13-asynchronous-requests)         | Asynchronous requests       | `respond-async`, status monitor, result retrieval           | [Protocol - Asynchronous Requests][p1-async]          |
| [14](#14-batch-requests)                | Batch requests              | Multipart and JSON batch, change sets, dependencies         | [Protocol - Batch Requests][p1-batch]                 |
| [15](#15-aggregation-apply)             | Aggregation (`$apply`)      | Transformation pipeline, aggregate methods, grouping        | [Agg][agg-root]                                       |
| [16](#16-security--conformance)         | Security & conformance      | Authentication, conformance levels, interoperable clients   | [Protocol - Conformance][p1-conformance]              |

---

## 1. Data Model & Schema

The model is described in CSDL and consumed by clients through `$metadata`. Everything a service exposes is
declared here.

| Feature                       | Description                                                | Since  |  Role  | Conformance | Requirement | Spec                                                |
| ----------------------------- | ---------------------------------------------------------- | :----: | :----: | :---------: | :---------: | --------------------------------------------------- |
| Entity type                   | Structured type with an identity (key)                     | `4.0`  |   –    |    Core     |      –      | [Csdl - Entity Type][csdl-entitytype]               |
| Complex type                  | Structured type without identity, used as a property value | `4.0`  |   –    |    Core     |      –      | [Csdl - Complex Type][csdl-complextype]             |
| Enumeration type              | Named primitive constants, optionally flags                | `4.0`  |   –    |    Core     |      –      | [Csdl - Enumeration Type][csdl-enumtype]            |
| Type definition               | Named alias/specialization of a primitive type             | `4.0`  |   –    |    Core     |      –      | [Csdl - Type Definition][csdl-typedef]              |
| Structural property           | Primitive, complex, enum or collection-valued property     | `4.0`  |   –    |    Core     |      –      | [Csdl - Structural Property][csdl-property]         |
| Navigation property           | Typed relationship to another entity type                  | `4.0`  |   –    |    Core     |      –      | [Csdl - Navigation Property][csdl-navprop]          |
| Entity container              | Declares the exposed entity sets, singletons and imports   | `4.0`  |   –    |    Core     |      –      | [Csdl - Entity Container][csdl-container]           |
| Action & function declaration | Signature, binding, return type, overloads                 | `4.0`  |   –    |    Core     |      –      | [Csdl - Action and Function][csdl-actionfunction]   |
| Annotations & vocabularies    | Terms applied to model elements                            | `4.0`  |   –    |    Core     |      –      | [Csdl - Vocabulary and Annotation][csdl-annotation] |
| CSDL XML representation       | `$metadata` as XML                                         | `4.0`  | Server |     Adv     |    MUST     | [Csdl - XML Representation][csdl-xml]               |
| CSDL JSON representation      | `$metadata` as JSON                                        | `4.01` | Server |      –      |   SHOULD    | [Csdl - CSDL Document][csdl-document]               |
| Schema versioning             | Model evolution, `$schemaversion`                          | `4.01` | Server |      –      |     MAY     | [Protocol - Model Versioning][p1-modelversioning]   |

### 1.1 Keys & Identity

| Feature        | Description                                             | Since |  Role  | Conformance | Requirement | Spec                                                        |
| -------------- | ------------------------------------------------------- | :---: | :----: | :---------: | :---------: | ----------------------------------------------------------- |
| Simple key     | Single key property                                     | `4.0` |   –    |    Core     |      –      | [Csdl - Entity Type][csdl-entitytype]                       |
| Composite key  | Several properties forming the key                      | `4.0` |   –    |    Core     |      –      | [Csdl - Entity Type][csdl-entitytype]                       |
| Alternate keys | Additional unique identifiers besides the canonical key | `4.0` | Server |      –      |     MAY     | [Url - Addressing Entities][p2-addressingentities]          |
| Entity-id      | Durable, globally unique identity of an entity          | `4.0` |   –    |    Core     |      –      | [Protocol - Entity-Ids and Entity References][p1-entityids] |

### 1.2 Relationships

| Feature                               | Description                                      | Since | Role | Conformance | Requirement | Spec                                                         |
| ------------------------------------- | ------------------------------------------------ | :---: | :--: | :---------: | :---------: | ------------------------------------------------------------ |
| Single-valued navigation              | To-one relationship                              | `4.0` |  –   |    Core     |      –      | [Csdl - Navigation Property][csdl-navprop]                   |
| Collection-valued navigation          | To-many relationship                             | `4.0` |  –   |    Core     |      –      | [Csdl - Navigation Property][csdl-navprop]                   |
| Partner navigation                    | Bidirectional relationship declaration           | `4.0` |  –   |    Core     |      –      | [Csdl - Navigation Property][csdl-navprop]                   |
| Referential constraint                | Dependent/principal property pairs               | `4.0` |  –   |    Core     |      –      | [Csdl - Navigation Property][csdl-navprop]                   |
| Containment navigation                | Child entities addressed only through the parent | `4.0` |  –   |    Core     |      –      | [Csdl - Navigation Property][csdl-navprop]                   |
| Navigation property binding           | Maps a navigation to a concrete target set       | `4.0` |  –   |    Core     |      –      | [Csdl - Entity Container][csdl-container]                    |
| Integrity constraints on modification | Behavior when a constraint would be violated     | `4.0` |  –   |    Core     |      –      | [Protocol - Handling of Integrity Constraints][p1-integrity] |

### 1.3 Inheritance & Open Types

| Feature          | Description                                         | Since  | Role | Conformance | Requirement | Spec                                                                 |
| ---------------- | --------------------------------------------------- | :----: | :--: | :---------: | :---------: | -------------------------------------------------------------------- |
| Type inheritance | Derived entity and complex types                    | `4.0`  |  –   |    Core     |      –      | [Csdl - Entity Type][csdl-entitytype]                                |
| Abstract types   | Types that cannot be instantiated                   | `4.0`  |  –   |    Core     |      –      | [Csdl - Entity Type][csdl-entitytype]                                |
| Open types       | Instances may carry undeclared (dynamic) properties | `4.0`  |  –   |    Core     |      –      | [Protocol - Properties Not Advertised in Metadata][p1-notadvertised] |
| Untyped values   | Values without a declared EDM type                  | `4.01` |  –   |    Core     |      –      | [Json - Untyped Value][json-untyped]                                 |

---

## 2. Service Model

| Feature                         | Description                                            | Since  |  Role  | Conformance | Requirement | Spec                                                        |
| ------------------------------- | ------------------------------------------------------ | :----: | :----: | :---------: | :---------: | ----------------------------------------------------------- |
| Service root & service document | Entry point listing entity sets, singletons, imports   | `4.0`  | Server |     Min     |    MUST     | [Protocol - Service Document Request][p1-servicedocrequest] |
| Metadata document               | `$metadata`, the CSDL of the service                   | `4.0`  | Server |     Adv     |    MUST     | [Protocol - Metadata Document Request][p1-metadatarequest]  |
| Entity references               | Referring to an entity by its id instead of its value  | `4.0`  |   –    |    Core     |      –      | [Protocol - Entity-Ids and Entity References][p1-entityids] |
| Read URLs & edit URLs           | Distinct URLs for reading and modifying an entity      | `4.0`  | Server |     Upd     |    MUST     | [Protocol - Read URLs and Edit URLs][p1-readediturls]       |
| Transient entities              | Entities without a durable id (e.g. operation results) | `4.01` |   –    |    Core     |      –      | [Protocol - Transient Entities][p1-transient]               |
| Default namespaces              | Omitting the namespace when unambiguous                | `4.01` | Server |     Min     |    MUST     | [Protocol - Default Namespaces][p1-defaultns]               |

---

## 3. Versioning & Extensibility

| Feature                       | Description                                      | Since |  Role  | Conformance | Requirement | Spec                                                     |
| ----------------------------- | ------------------------------------------------ | :---: | :----: | :---------: | :---------: | -------------------------------------------------------- |
| Protocol versioning           | `OData-Version` / `OData-MaxVersion` negotiation | `4.0` |  Both  |     Min     |    MUST     | [Protocol - Protocol Versioning][p1-protocolversioning]  |
| Model versioning              | Evolving the schema without breaking clients     | `4.0` | Server |      –      |     MAY     | [Protocol - Model Versioning][p1-modelversioning]        |
| Custom query options          | Service-specific options without `$` prefix      | `4.0` | Server |      –      |     MAY     | [Url - Custom Query Options][p2-customquery]             |
| Query option extensibility    | Rules for extending the option space             | `4.0` |  Both  |     Min     |    MUST     | [Protocol - Query Option Extensibility][p1-queryoptext]  |
| Payload extensibility         | Additional content in payloads                   | `4.0` |  Both  |     Min     |    MUST     | [Protocol - Payload Extensibility][p1-payloadext]        |
| Action/function extensibility | Adding operations without breaking clients       | `4.0` |  Both  |     Min     |    MUST     | [Protocol - Action/Function Extensibility][p1-actionext] |
| Vocabulary extensibility      | Defining and applying custom terms               | `4.0` |  Both  |     Min     |    MUST     | [Protocol - Vocabulary Extensibility][p1-vocabext]       |
| Header field extensibility    | Custom headers                                   | `4.0` |  Both  |     Min     |    MUST     | [Protocol - Header Field Extensibility][p1-headerext]    |
| Format extensibility          | Additional payload formats                       | `4.0` |  Both  |     Min     |    MUST     | [Protocol - Format Extensibility][p1-formatext]          |

---

## 4. Formats & JSON Payloads

| Feature                      | Description                                         | Since |  Role  | Conformance | Requirement | Spec                                                       |
| ---------------------------- | --------------------------------------------------- | :---: | :----: | :---------: | :---------: | ---------------------------------------------------------- |
| Format negotiation           | `Accept` header and `$format` query option          | `4.0` |  Both  |     Min     |    MUST     | [Protocol - Formats][p1-formats]                           |
| `$format`                    | Format as a query option instead of a header        | `4.0` | Server |      –      |     MAY     | [Protocol - $format][p1-format]                            |
| Metadata level               | `odata.metadata=full` / `minimal` / `none`          | `4.0` |  Both  |      –      |     MAY     | [Json - Amount of Control Information][json-metadatalevel] |
| Number representation        | `IEEE754Compatible` for `Edm.Int64` / `Edm.Decimal` | `4.0` | Server |      –      |     MAY     | [Json - Representation of Numbers][json-numbers]           |
| Relative URLs                | Shortened URLs resolved against the context         | `4.0` |   –    |    Core     |      –      | [Json - Relative URLs][json-relativeurls]                  |
| Payload ordering constraints | Required ordering of control information            | `4.0` | Server |     Min     |    MUST     | [Json - Payload Ordering Constraints][json-ordering]       |
| Instance annotations         | `@ns.term` on objects, arrays and primitives        | `4.0` | Server |      –      |     MAY     | [Json - Instance Annotations][json-instanceannotations]    |

### 4.1 Control Information

Metadata carried inside the payload. In **4.0** every name is prefixed (`@odata.context`); **4.01** allows the
short form (`@context`), and consumers must accept both.

| Control information                                                                           | Meaning                                           | Since  |  Role  | Conformance | Requirement | Spec                                           |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------- | :----: | :----: | :---------: | :---------: | ---------------------------------------------- |
| `@odata.context`                                                                              | Describes the shape of the payload                | `4.0`  | Server |     Min     |    MUST     | [Protocol - Context URL][p1-contexturl]        |
| `@odata.metadataEtag`                                                                         | ETag of the metadata document                     | `4.0`  | Server |      –      |     MAY     | [Json - Control Information][json-controlinfo] |
| `@odata.type`                                                                                 | Type of the instance, for derived/ambiguous types | `4.0`  | Server |     Min     |    MUST     | [Json - Control Information][json-controlinfo] |
| `@odata.count`                                                                                | Total count of a collection                       | `4.0`  | Server |     Min     |    MUST     | [Json - Control Information][json-controlinfo] |
| `@odata.nextLink`                                                                             | Link to the next page (server-driven paging)      | `4.0`  | Server |     Min     |    MUST     | [Json - Control Information][json-controlinfo] |
| `@odata.deltaLink`                                                                            | Link for subsequent change tracking               | `4.0`  | Server |      –      |     MAY     | [Json - Delta Payload][json-delta]             |
| `@odata.id`                                                                                   | Entity-id of the instance                         | `4.0`  | Server |      –      |     MAY     | [Json - Control Information][json-controlinfo] |
| `@odata.editLink` / `@odata.readLink`                                                         | Edit and read URL of the instance                 | `4.0`  | Server |     Upd     |    MUST     | [Json - Control Information][json-controlinfo] |
| `@odata.etag`                                                                                 | Concurrency token of the instance                 | `4.0`  | Server |      –      |     MAY     | [Json - Control Information][json-controlinfo] |
| `@odata.navigationLink` / `@odata.associationLink`                                            | Links to a related entity and its reference       | `4.0`  | Server |      –      |     MAY     | [Json - Navigation Link][json-navlink]         |
| `@odata.mediaEditLink`, `@odata.mediaReadLink`, `@odata.mediaContentType`, `@odata.mediaEtag` | Media stream links and metadata                   | `4.0`  | Server |      –      |     MAY     | [Json - Media Entity][json-mediaentity]        |
| `@odata.bind`                                                                                 | Binds a navigation property to an existing entity | `4.0`  | Server |      –      |     MAY     | [Json - Bind Operation][json-bind]             |
| `@odata.removed`                                                                              | Marks a deleted entity in a delta payload         | `4.0`  | Server |      –      |     MAY     | [Json - Delta Payload][json-delta]             |
| Prefix-less form (`@context`, `@count`, …)                                                    | Short spelling of all control information         | `4.01` | Server |     Min     |    MUST     | [Json - Control Information][json-controlinfo] |

### 4.2 Payload Shapes

| Payload                           | Description                                 | Since  |  Role  | Conformance | Requirement | Spec                                                                       |
| --------------------------------- | ------------------------------------------- | :----: | :----: | :---------: | :---------: | -------------------------------------------------------------------------- |
| Service document                  | List of exposed resources                   | `4.0`  | Server |     Min     |    MUST     | [Json - Service Document][json-servicedoc]                                 |
| Entity                            | Single entity                               | `4.0`  | Server |     Min     |    MUST     | [Json - Entity][json-entity]                                               |
| Collection of entities            | Entity set or navigation collection         | `4.0`  | Server |     Min     |    MUST     | [Json - Collection of Entities][json-entitycollection]                     |
| Structural property               | Primitive, complex, and collections thereof | `4.0`  | Server |     Min     |    MUST     | [Json - Structural Property][json-structuralproperty]                      |
| Entity reference                  | `$ref` payload carrying only the entity-id  | `4.0`  | Server |      –      |     MAY     | [Json - Entity Reference][json-entityreference]                            |
| Expanded navigation property      | Related entities inlined                    | `4.0`  | Server |     Adv     |    MUST     | [Json - Expanded Navigation Property][json-expandednav]                    |
| Stream property & media entity    | Binary content and its links                | `4.0`  | Server |      –      |     MAY     | [Json - Stream Property][json-streamproperty]                              |
| Operation response                | Result of a function or action              | `4.0`  | Server |      –      |     MAY     | [Json - Individual Property or Operation Response][json-operationresponse] |
| Collection of operation responses | Results of several operations               | `4.01` | Server |      –      |     MAY     | [Json - Collection of Operation Responses][json-operationresponses]        |
| Delta payload                     | Changes since a delta link                  | `4.0`  | Server |      –      |     MAY     | [Json - Delta Payload][json-delta]                                         |
| Collection ETag                   | ETag covering a whole collection            | `4.01` | Server |      –      |     MAY     | [Json - Collection ETag][json-collectionetag]                              |

---

## 5. Header Fields & Preferences

| Header               | Direction | Description                                  | Since  |  Role  | Conformance | Requirement | Spec                                              |
| -------------------- | --------- | -------------------------------------------- | :----: | :----: | :---------: | :---------: | ------------------------------------------------- |
| `Content-Type`       | both      | Payload format incl. parameters              | `4.0`  |  Both  |     Min     |    MUST     | [Protocol - Content-Type][p1-contenttype]         |
| `Content-Encoding`   | both      | Compression                                  | `4.0`  |  Both  |      –      |     MAY     | [Protocol - Content-Encoding][p1-contentencoding] |
| `Content-Language`   | both      | Natural language of the payload              | `4.0`  |  Both  |      –      |     MAY     | [Protocol - Content-Language][p1-contentlanguage] |
| `Content-Length`     | both      | Payload size                                 | `4.0`  |  Both  |      –      |     MAY     | [Protocol - Content-Length][p1-contentlength]     |
| `OData-Version`      | both      | Version of the payload                       | `4.0`  |  Both  |     Min     |    MUST     | [Protocol - OData-Version][p1-version]            |
| `Accept`             | request   | Requested format                             | `4.0`  | Client |     Min     |    MUST     | [Protocol - Accept][p1-accept]                    |
| `Accept-Charset`     | request   | Requested charset                            | `4.0`  | Client |      –      |     MAY     | [Protocol - Accept-Charset][p1-acceptcharset]     |
| `Accept-Language`    | request   | Requested language                           | `4.0`  | Client |      –      |     MAY     | [Protocol - Accept-Language][p1-acceptlanguage]   |
| `If-Match`           | request   | Optimistic concurrency for update/delete     | `4.0`  | Client |     Upd     |    MUST     | [Protocol - If-Match][p1-ifmatch]                 |
| `If-None-Match`      | request   | Conditional read, upsert protection          | `4.0`  | Client |      –      |     MAY     | [Protocol - If-None-Match][p1-ifnonematch]        |
| `OData-Isolation`    | request   | `snapshot` isolation across requests         | `4.0`  | Client |      –      |     MAY     | [Protocol - Isolation][p1-isolation]              |
| `OData-MaxVersion`   | request   | Highest version the client understands       | `4.0`  | Client |     Min     |    MUST     | [Protocol - OData-MaxVersion][p1-maxversion]      |
| `Prefer`             | request   | Behavioral hints, see [5.1](#51-preferences) | `4.0`  | Client |      –      |     MAY     | [Protocol - Prefer][p1-prefer]                    |
| `ETag`               | response  | Concurrency token                            | `4.0`  | Server |      –      |     MAY     | [Protocol - ETag][p1-etag]                        |
| `Location`           | response  | URL of a created or async resource           | `4.0`  | Server |     Upd     |    MUST     | [Protocol - Location][p1-location]                |
| `OData-EntityId`     | response  | Entity-id when no body is returned           | `4.0`  | Server |     Upd     |    MUST     | [Protocol - OData-EntityId][p1-entityid]          |
| `OData-Error`        | response  | Signals an in-stream error                   | `4.01` | Server |      –      |     MAY     | [Protocol - OData-Error][p1-odataerror]           |
| `Preference-Applied` | response  | Which preferences were honored               | `4.0`  | Server |      –      |     MAY     | [Protocol - Preference-Applied][p1-prefapplied]   |
| `Retry-After`        | response  | Delay before polling again                   | `4.0`  | Server |      –      |     MAY     | [Protocol - Retry-After][p1-retryafter]           |
| `AsyncResult`        | response  | Status of an asynchronous request            | `4.0`  | Server |      –      |     MAY     | [Protocol - AsyncResult][p1-asyncresult]          |
| `Vary`               | response  | Cache-relevant request headers               | `4.0`  | Server |      –      |     MAY     | [Protocol - Vary][p1-vary]                        |

### 5.1 Preferences

All preferences are hints: a service may ignore them, and reports what it applied via `Preference-Applied`.

| Preference                       | Effect                                                   | Since  | Role | Conformance | Requirement | Spec                                                    |
| -------------------------------- | -------------------------------------------------------- | :----: | :--: | :---------: | :---------: | ------------------------------------------------------- |
| `allow-entityreferences`         | Service may return entity references instead of entities | `4.0`  | Both |      –      |     MAY     | [Protocol - allow-entityreferences][p1-allowentityrefs] |
| `callback`                       | Asynchronous notification via a callback URL             | `4.0`  | Both |      –      |     MAY     | [Protocol - callback][p1-callback]                      |
| `continue-on-error`              | Batch continues after a failing request                  | `4.0`  | Both |      –      |     MAY     | [Protocol - continue-on-error][p1-continueonerror]      |
| `include-annotations`            | Which instance annotations to include                    | `4.0`  | Both |      –      |     MAY     | [Protocol - include-annotations][p1-includeannotations] |
| `maxpagesize`                    | Hint for the server-driven page size                     | `4.0`  | Both |      –      |     MAY     | [Protocol - maxpagesize][p1-maxpagesize]                |
| `omit-values=nulls\|defaults`    | Omit null/default values from the payload                | `4.01` | Both |      –      |     MAY     | [Protocol - omit-values][p1-omitvalues]                 |
| `return=representation\|minimal` | Whether modifications return the full entity             | `4.0`  | Both |      –      |     MAY     | [Protocol - return][p1-returnpref]                      |
| `respond-async`                  | Process the request asynchronously                       | `4.0`  | Both |      –      |     MAY     | [Protocol - respond-async][p1-respondasync]             |
| `track-changes`                  | Request a delta link for change tracking                 | `4.0`  | Both |      –      |     MAY     | [Protocol - track-changes][p1-trackchanges]             |
| `wait`                           | How long the client will wait for a response             | `4.0`  | Both |      –      |     MAY     | [Protocol - wait][p1-wait]                              |

---

## 6. Status Codes & Error Handling

| Feature                                  | Description                                          | Since  |  Role  | Conformance | Requirement | Spec                                                                 |
| ---------------------------------------- | ---------------------------------------------------- | :----: | :----: | :---------: | :---------: | -------------------------------------------------------------------- |
| `200 OK`                                 | Request succeeded with a body                        | `4.0`  | Server |     Min     |    MUST     | [Protocol - 200 OK][p1-200]                                          |
| `201 Created`                            | Entity created                                       | `4.0`  | Server |     Upd     |    MUST     | [Protocol - 201 Created][p1-201]                                     |
| `202 Accepted`                           | Asynchronous processing started                      | `4.0`  | Server |      –      |     MAY     | [Protocol - 202 Accepted][p1-202]                                    |
| `204 No Content`                         | Success without a body                               | `4.0`  | Server |     Min     |    MUST     | [Protocol - 204 No Content][p1-204]                                  |
| `3xx` / `304 Not Modified`               | Redirection and conditional-read result              | `4.0`  | Server |      –      |     MAY     | [Protocol - 3xx Redirection][p1-3xx]                                 |
| `404`, `405`, `406`, `410`, `412`, `424` | Client error responses                               | `4.0`  | Server |     Min     |    MUST     | [Protocol - Client Error Responses][p1-clienterrors]                 |
| `501 Not Implemented`                    | Unsupported feature                                  | `4.0`  | Server |     Min     |    MUST     | [Protocol - 501 Not Implemented][p1-501]                             |
| Error response body                      | `code`, `message`, `target`, `details`, `innererror` | `4.0`  | Server |     Min     |    MUST     | [Protocol - Error Response Body][p1-errorbody]                       |
| In-stream errors                         | Failure after the response body has started          | `4.0`  | Server |      –      |     MAY     | [Protocol - In-Stream Errors][p1-instreamerrors]                     |
| Error in a success payload               | Error information alongside partial results          | `4.01` | Server |      –      |     MAY     | [Json - Error Information in a Success Payload][json-errorinsuccess] |

---

## 7. Context URL

`@odata.context` tells the consumer how to interpret the payload. The specification defines a distinct form per
payload kind.

| Context for                                 | Since |  Role  | Conformance | Requirement | Spec                                                                      |
| ------------------------------------------- | :---: | :----: | :---------: | :---------: | ------------------------------------------------------------------------- |
| Service document                            | `4.0` | Server |     Min     |    MUST     | [Protocol - Service Document][p1-ctx-servicedoc]                          |
| Collection of entities / single entity      | `4.0` | Server |     Min     |    MUST     | [Protocol - Collection of Entities][p1-ctx-entitycollection]              |
| Singleton                                   | `4.0` | Server |     Min     |    MUST     | [Protocol - Singleton][p1-ctx-singleton]                                  |
| Derived entities (collection and single)    | `4.0` | Server |      –      |     MAY     | [Protocol - Collection of Derived Entities][p1-ctx-derivedcollection]     |
| Projected entities (`$select`)              | `4.0` | Server |     Int     |    MUST     | [Protocol - Collection of Projected Entities][p1-ctx-projectedcollection] |
| Expanded entities (`$expand`)               | `4.0` | Server |     Adv     |    MUST     | [Protocol - Collection of Expanded Entities][p1-ctx-expandedcollection]   |
| Entity references (`$ref`)                  | `4.0` | Server |      –      |     MAY     | [Protocol - Collection of Entity References][p1-ctx-entityrefs]           |
| Property value                              | `4.0` | Server |     Int     |    MUST     | [Protocol - Property Value][p1-ctx-propertyvalue]                         |
| Complex or primitive type (and collections) | `4.0` | Server |     Min     |    MUST     | [Protocol - Complex or Primitive Type][p1-ctx-complexorprimitive]         |
| Operation result                            | `4.0` | Server |      –      |     MAY     | [Protocol - Operation Result][p1-ctx-operationresult]                     |
| Delta payload and its items                 | `4.0` | Server |      –      |     MAY     | [Protocol - Delta Payload Response][p1-ctx-delta]                         |
| `$all` / `$crossjoin` responses             | `4.0` | Server |      –      |     MAY     | [Protocol - $all Response][p1-ctx-all]                                    |

---

## 8. Resource Addressing

How a URL identifies a resource. Query options are covered in [section 9](#9-querying-data).

| Feature                         | Syntax                                         | Since  |  Role  | Conformance | Requirement | Spec                                                                   |
| ------------------------------- | ---------------------------------------------- | :----: | :----: | :---------: | :---------: | ---------------------------------------------------------------------- |
| Service root                    | `https://host/service/`                        | `4.0`  | Server |     Min     |    MUST     | [Url - Service Root URL][p2-serviceroot]                               |
| Metadata endpoint               | `/$metadata`                                   | `4.0`  | Server |     Adv     |    MUST     | [Url - Addressing the Model][p2-model]                                 |
| Batch endpoint                  | `/$batch`                                      | `4.0`  | Server |     Adv     |    MUST     | [Url - Addressing the Batch Endpoint][p2-batchendpoint]                |
| Entity set & singleton          | `/Products`, `/Me`                             | `4.0`  | Server |     Min     |    MUST     | [Url - Addressing Entities][p2-addressingentities]                     |
| Canonical key predicate         | `/Products(1)`, `/Products('abc')`             | `4.0`  | Server |     Min     |    MUST     | [Url - Addressing Entities][p2-addressingentities]                     |
| Composite key                   | `/OrderItems(OrderID=1,ItemNo=2)`              | `4.0`  | Server |     Min     |    MUST     | [Url - Addressing Entities][p2-addressingentities]                     |
| Key-as-segment                  | `/Products/1`                                  | `4.0`  | Server |      –      |     MAY     | [Url - Addressing Entities][p2-addressingentities]                     |
| Navigation path                 | `/Orders(1)/Items`                             | `4.0`  | Server |     Min     |    MUST     | [Url - Addressing Entities][p2-addressingentities]                     |
| Property access                 | `/Products(1)/Name`                            | `4.0`  | Server |     Int     |    MUST     | [Url - Addressing a Property][p2-property]                             |
| Raw value                       | `/Products(1)/Name/$value`                     | `4.0`  | Server |     Int     |    MUST     | [Url - Addressing a Property Value][p2-propertyvalue]                  |
| Media stream                    | `/Products(1)/$value`                          | `4.0`  | Server |     Int     |    MUST     | [Url - Addressing the Media Stream][p2-mediastream]                    |
| Entity references               | `/Orders(1)/Items/$ref`                        | `4.0`  | Server |     Upd     |    MUST     | [Url - Addressing References][p2-ref]                                  |
| Count of a collection           | `/Products/$count`                             | `4.0`  | Server |     Adv     |    MUST     | [Url - Addressing the Count][p2-countpath]                             |
| Type cast segment               | `/Products/Namespace.DiscountedProduct`        | `4.0`  | Server |     Int     |    MUST     | [Url - Addressing Derived Types][p2-derivedtypes]                      |
| Member of a collection          | `/Products(1)/Tags` addressed by value         | `4.01` | Server |      –      |     MAY     | [Url - Addressing a Member][p2-member]                                 |
| Member of an ordered collection | `/Tags/$index(2)`                              | `4.01` | Server |      –      |     MAY     | [Url - Addressing a Member of an Ordered Collection][p2-orderedmember] |
| Subset of a collection          | `/Items/$filter(@expr)`                        | `4.01` | Server |      –      |     MAY     | [Url - Addressing a Subset][p2-subset]                                 |
| Each member                     | `/Products/$each`                              | `4.01` | Server |      –      |     MAY     | [Url - Addressing Each Member][p2-each]                                |
| Cross join                      | `/$crossjoin(Products,Categories)`             | `4.0`  | Server |      –      |     MAY     | [Url - Cross Join][p2-crossjoin]                                       |
| All entities                    | `/$all`                                        | `4.0`  | Server |      –      |     MAY     | [Url - Addressing All Entities][p2-all]                                |
| Resolve an entity-id            | `/$entity?$id=…`                               | `4.0`  | Server |      –      |     MAY     | [Protocol - Resolving an Entity-Id][p1-resolveentityid]                |
| Operation invocation            | `/Products(1)/Namespace.Rate`                  | `4.0`  | Server |      –      |     MAY     | [Url - Addressing Operations][p2-operations]                           |
| Query options in the body       | `POST /Products/$query` with `text/plain` body | `4.01` | Server |      –      |     MAY     | [Url - Passing Query Options in the Request Body][p2-querybody]        |

---

## 9. Querying Data

| Feature                          | Description                                                                     | Since  |  Role  | Conformance | Requirement | Spec                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------- | :----: | :----: | :---------: | :---------: | --------------------------------------------------------------------- |
| Shaping the result               | `$select` and `$expand`, see [9.1](#91-select--expand)                          | `4.0`  | Server |     Int     |    MUST     | [Protocol - Specifying Properties to Return][p1-specifyingproperties] |
| Filtering                        | `$filter`, see [9.2](#92-filter-expression-language)                            | `4.0`  | Server |     Int     |    MUST     | [Protocol - $filter][p1-filter]                                       |
| Sorting, paging, counting        | `$orderby`, `$top`, `$skip`, `$count`, see [9.3](#93-ordering-paging--counting) | `4.0`  | Server |     Adv     |    MUST     | [Protocol - Querying Collections][p1-queryingcollections]             |
| Free-text search                 | `$search` with its own expression grammar                                       | `4.0`  | Server |     Adv     |    MUST     | [Protocol - $search][p1-search]                                       |
| Computed properties              | `$compute` adds derived properties to the result                                | `4.01` | Server |      –      |   SHOULD    | [Protocol - $compute][p1-compute]                                     |
| Aggregation                      | `$apply`, see [section 15](#15-aggregation-apply)                               | `4.0`  | Server |      –      |     MAY     | [Agg][agg-root]                                                       |
| Parameter aliases                | `@name` placeholders reused across options                                      | `4.0`  | Server |     Int     |    MUST     | [Url - Parameter Aliases][p2-paramaliases]                            |
| Custom query options             | Service-defined, without `$` prefix                                             | `4.0`  | Server |      –      |     MAY     | [Url - Custom Query Options][p2-customquery]                          |
| Individual entities & properties | Reading a single entity, property or raw value                                  | `4.0`  | Server |     Min     |    MUST     | [Protocol - Requesting Individual Entities][p1-individualentities]    |
| Related entities                 | Reading across a navigation property                                            | `4.0`  | Server |     Min     |    MUST     | [Protocol - Requesting Related Entities][p1-relatedentities]          |
| Entity references                | Reading `$ref` instead of entities                                              | `4.0`  | Server |      –      |     MAY     | [Protocol - Requesting Entity References][p1-entityreferences]        |
| Schema version selection         | `$schemaversion`                                                                | `4.01` | Server |      –      |     MAY     | [Protocol - $schemaversion][p1-schemaversion]                         |

### 9.1 `$select` & `$expand`

`$select` narrows the properties returned; `$expand` inlines related entities. Both accept paths, and `$expand`
additionally carries **nested query options**, which is what makes it the most complex option in the protocol.

| Feature                      | Syntax                                   | Since |  Role  | Conformance | Requirement | Spec                            |
| ---------------------------- | ---------------------------------------- | :---: | :----: | :---------: | :---------: | ------------------------------- |
| Select properties            | `$select=Name,Price`                     | `4.0` | Server |     Int     |    MUST     | [Protocol - $select][p1-select] |
| Select all                   | `$select=*`                              | `4.0` | Server |     Int     |    MUST     | [Protocol - $select][p1-select] |
| Select with type cast        | `$select=Namespace.SubType/Prop`         | `4.0` | Server |     Int     |    MUST     | [Protocol - $select][p1-select] |
| Select an operation          | `$select=Namespace.Action` advertises it | `4.0` | Server |      –      |     MAY     | [Protocol - $select][p1-select] |
| Expand a navigation property | `$expand=Category`                       | `4.0` | Server |     Adv     |    MUST     | [Protocol - $expand][p1-expand] |
| Expand all                   | `$expand=*`                              | `4.0` | Server |      –      |     MAY     | [Protocol - $expand][p1-expand] |
| Expand references            | `$expand=Items/$ref`                     | `4.0` | Server |     Adv     |    MUST     | [Protocol - $expand][p1-expand] |
| Expand a count               | `$expand=Items/$count`                   | `4.0` | Server |      –      |     MAY     | [Protocol - $expand][p1-expand] |
| Expand with type cast        | `$expand=Namespace.SubType/Nav`          | `4.0` | Server |     Adv     |    MUST     | [Protocol - $expand][p1-expand] |

#### 9.1.1 Nested Expand Options

Options applied **inside** an `$expand`, in parentheses and separated by `;` — e.g.
`$expand=Items($select=Name;$filter=Price gt 10;$top=5)`. They apply to the related collection, not the parent.

| Nested option    | Applies to                                             | Since  |  Role  | Conformance | Requirement | Spec                                          |
| ---------------- | ------------------------------------------------------ | :----: | :----: | :---------: | :---------: | --------------------------------------------- |
| `$select`        | Related entities                                       | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Expand Options][p1-expandoptions] |
| `$expand`        | Further nesting, recursively                           | `4.0`  | Server |      –      |     MAY     | [Protocol - Expand Options][p1-expandoptions] |
| `$filter`        | Collection-valued navigation only                      | `4.0`  | Server |     Adv     |    MUST     | [Protocol - Expand Options][p1-expandoptions] |
| `$orderby`       | Collection-valued navigation only                      | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Expand Options][p1-expandoptions] |
| `$top` / `$skip` | Collection-valued navigation only                      | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Expand Options][p1-expandoptions] |
| `$count`         | Collection-valued navigation only                      | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Expand Options][p1-expandoptions] |
| `$search`        | Collection-valued navigation only                      | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Expand Options][p1-expandoptions] |
| `$compute`       | Related entities                                       | `4.01` | Server |      –      |     MAY     | [Protocol - Expand Options][p1-expandoptions] |
| `$apply`         | Collection-valued navigation only                      | `4.0`  | Server |      –      |     MAY     | [Agg][agg-root]                               |
| `$levels`        | Recursive expansion depth (`$levels=3`, `$levels=max`) | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Expand Option $levels][p1-levels] |

### 9.2 `$filter` Expression Language

A boolean expression evaluated per item. Operands are property paths, literals, parameter aliases and function
calls; `$it`, `$this` and lambda range variables provide access to the current instance.

#### 9.2.1 Operators

| Group            | Operators                          | Since  |  Role  | Conformance | Requirement | Spec                                                  |
| ---------------- | ---------------------------------- | :----: | :----: | :---------: | :---------: | ----------------------------------------------------- |
| Comparison       | `eq`, `ne`, `gt`, `ge`, `lt`, `le` | `4.0`  | Server |     Int     |    MUST     | [Protocol - Built-in Filter Operations][p1-filterops] |
| Logical          | `and`, `or`, `not`                 | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Built-in Filter Operations][p1-filterops] |
| Arithmetic       | `add`, `sub`, `mul`, `div`, `mod`  | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Built-in Filter Operations][p1-filterops] |
| Integer division | `divby`                            | `4.01` | Server |      –      |   SHOULD    | [Protocol - Built-in Filter Operations][p1-filterops] |
| Grouping         | `( … )`                            | `4.0`  | Server |     Int     |    MUST     | [Protocol - Built-in Filter Operations][p1-filterops] |
| Membership       | `in` — value against a list        | `4.01` | Server |     Int     |    MUST     | [Protocol - Built-in Filter Operations][p1-filterops] |
| Enum/flag test   | `has`                              | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Built-in Filter Operations][p1-filterops] |

#### 9.2.2 Built-in Functions

| Group         | Functions                                                                                                                                                          | Since  |  Role  | Conformance | Requirement | Spec                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----: | :----: | :---------: | :---------: | ----------------------------------------------------- |
| String        | `concat`, `contains`, `endswith`, `startswith`, `indexof`, `length`, `substring`, `tolower`, `toupper`, `trim`                                                     | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Built-in Query Functions][p1-filterfuncs] |
| String (4.01) | `matchesPattern`, `substring` with two arguments                                                                                                                   | `4.01` | Server |      –      |   SHOULD    | [Protocol - Built-in Query Functions][p1-filterfuncs] |
| Collection    | `hassubset`, `hassubsequence`                                                                                                                                      | `4.01` | Server |      –      |   SHOULD    | [Protocol - Built-in Query Functions][p1-filterfuncs] |
| Date & time   | `year`, `month`, `day`, `hour`, `minute`, `second`, `fractionalseconds`, `date`, `time`, `totaloffsetminutes`, `totalseconds`, `now`, `mindatetime`, `maxdatetime` | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Built-in Query Functions][p1-filterfuncs] |
| Arithmetic    | `round`, `floor`, `ceiling`                                                                                                                                        | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Built-in Query Functions][p1-filterfuncs] |
| Type          | `cast`, `isof`                                                                                                                                                     | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Built-in Query Functions][p1-filterfuncs] |
| Conditional   | `case`                                                                                                                                                             | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Built-in Query Functions][p1-filterfuncs] |
| Geo           | `geo.distance`, `geo.intersects`, `geo.length`                                                                                                                     | `4.0`  | Server |      –      |     MAY     | [Protocol - Built-in Query Functions][p1-filterfuncs] |

#### 9.2.3 Lambda Operators & Path Expressions

| Feature                   | Syntax                                  | Since  |  Role  | Conformance | Requirement | Spec                                                  |
| ------------------------- | --------------------------------------- | :----: | :----: | :---------: | :---------: | ----------------------------------------------------- |
| `any`                     | `Items/any(i: i/Price gt 10)`           | `4.0`  | Server |     Adv     |    MUST     | [Protocol - Built-in Filter Operations][p1-filterops] |
| `all`                     | `Items/all(i: i/InStock)`               | `4.0`  | Server |     Adv     |    MUST     | [Protocol - Built-in Filter Operations][p1-filterops] |
| `any` without a predicate | `Items/any()` — collection is non-empty | `4.0`  | Server |     Adv     |    MUST     | [Protocol - Built-in Filter Operations][p1-filterops] |
| `$it`                     | The current instance                    | `4.0`  | Server |      –      |     MAY     | [Protocol - Built-in Filter Operations][p1-filterops] |
| `$this`                   | The current instance inside a lambda    | `4.01` | Server |      –      |     MAY     | [Protocol - Built-in Filter Operations][p1-filterops] |
| `$root`                   | Absolute reference to the service root  | `4.0`  | Server |      –      |     MAY     | [Protocol - Built-in Filter Operations][p1-filterops] |
| Parameter alias           | `$filter=Name eq @n&@n='X'`             | `4.0`  | Server |     Int     |    MUST     | [Protocol - Parameter Aliases][p1-paramaliases]       |

### 9.3 Ordering, Paging & Counting

| Feature                         | Syntax                                      | Since  |  Role  | Conformance | Requirement | Spec                                                           |
| ------------------------------- | ------------------------------------------- | :----: | :----: | :---------: | :---------: | -------------------------------------------------------------- |
| Sorting                         | `$orderby=Name desc,Price asc`              | `4.0`  | Server |     Adv     |    MUST     | [Protocol - $orderby][p1-orderby]                              |
| Client-driven paging            | `$top=10&$skip=20`                          | `4.0`  | Server |     Int     |    MUST     | [Protocol - $top][p1-top]                                      |
| Inline count                    | `$count=true`                               | `4.0`  | Server |     Adv     |    MUST     | [Protocol - $count][p1-count]                                  |
| Count of a collection           | `/Products/$count` as a raw value           | `4.0`  | Server |     Adv     |    MUST     | [Protocol - Requesting the Number of Items][p1-countrequest]   |
| Server-driven paging            | `@odata.nextLink`, `maxpagesize` preference | `4.0`  | Server |     Min     |    MUST     | [Protocol - Server-Driven Paging][p1-serverpaging]             |
| Skip token                      | Opaque continuation inside `nextLink`       | `4.0`  | Server |     Min     |    MUST     | [Protocol - Server-Driven Paging][p1-serverpaging]             |
| Member of an ordered collection | `$index`                                    | `4.01` | Server |      –      |     MAY     | [Protocol - Requesting an Individual Member][p1-orderedmember] |

---

## 10. Change Tracking (Delta)

| Feature                             | Description                                     | Since  |  Role  | Conformance | Requirement | Spec                                               |
| ----------------------------------- | ----------------------------------------------- | :----: | :----: | :---------: | :---------: | -------------------------------------------------- |
| Request change tracking             | `Prefer: track-changes`                         | `4.0`  |  Both  |      –      |     MAY     | [Protocol - track-changes][p1-trackchanges]        |
| Delta link                          | `@odata.deltaLink` returned with the result     | `4.0`  | Server |      –      |     MAY     | [Protocol - Delta Links][p1-deltalinks]            |
| Using a delta link                  | Fetching changes since the previous response    | `4.0`  | Client |      –      |     MAY     | [Protocol - Using Delta Links][p1-usingdeltalinks] |
| Delta payload                       | Added/changed entities, deletions, link changes | `4.0`  | Server |      –      |     MAY     | [Protocol - Delta Payloads][p1-deltapayloads]      |
| Deleted entity                      | `@removed` with a reason                        | `4.0`  | Server |      –      |     MAY     | [Json - Delta Payload][json-delta]                 |
| Added / deleted link                | Relationship changes as their own entries       | `4.0`  | Server |      –      |     MAY     | [Json - Added Link][json-addedlink]                |
| Nested delta in expanded properties | Delta inside `$expand`                          | `4.01` | Server |      –      |     MAY     | [Json - Delta Responses][json-deltaresponses]      |

---

## 11. Data Modification

| Feature                   | Method                                   | Since |  Role  | Conformance | Requirement | Spec                                                       |
| ------------------------- | ---------------------------------------- | :---: | :----: | :---------: | :---------: | ---------------------------------------------------------- |
| Create an entity          | `POST` to an entity set                  | `4.0` | Server |     Upd     |    MUST     | [Protocol - Create an Entity][p1-createentity]             |
| Update an entity          | `PATCH` (merge)                          | `4.0` | Server |     Upd     |    MUST     | [Protocol - Update an Entity][p1-updateentity]             |
| Replace an entity         | `PUT` (full replace)                     | `4.0` | Server |      –      |   SHOULD    | [Protocol - Update an Entity][p1-updateentity]             |
| Upsert                    | `PATCH`/`PUT` on a non-existing key      | `4.0` | Server |     Upd     |    MUST     | [Protocol - Upsert an Entity][p1-upsert]                   |
| Delete an entity          | `DELETE`                                 | `4.0` | Server |     Upd     |    MUST     | [Protocol - Delete an Entity][p1-deleteentity]             |
| Optimistic concurrency    | `If-Match` / `If-None-Match` with ETags  | `4.0` | Server |     Upd     |    MUST     | [Protocol - Use of ETags][p1-etags]                        |
| Returning results         | `Prefer: return=representation\|minimal` | `4.0` | Server |      –      |     MAY     | [Protocol - Returning Results][p1-returningresults]        |
| `DateTimeOffset` handling | Normalization rules on modification      | `4.0` | Server |     Min     |    MUST     | [Protocol - Handling of DateTimeOffset][p1-datetimeoffset] |
| Undeclared properties     | Behavior for open/dynamic properties     | `4.0` | Server |      –      |     MAY     | [Protocol - Properties Not Advertised][p1-notadvertised]   |

### 11.1 Related Entities & Relationships

| Feature                          | Description                                     | Since  |  Role  | Conformance | Requirement | Spec                                                   |
| -------------------------------- | ----------------------------------------------- | :----: | :----: | :---------: | :---------: | ------------------------------------------------------ |
| Deep insert                      | Create an entity together with related ones     | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Create Related Entities][p1-createrelated] |
| Bind on create                   | `@odata.bind` / `@id` to link existing entities | `4.0`  | Server |      –      |     MAY     | [Protocol - Link to Related Entities][p1-linkrelated]  |
| Deep update                      | Nested changes inside `PATCH`                   | `4.01` | Server |      –      |   SHOULD    | [Protocol - Update Related Entities][p1-updaterelated] |
| Add a reference                  | `POST` to `…/Nav/$ref`                          | `4.0`  | Server |     Upd     |    MUST     | [Protocol - Add a Reference][p1-addref]                |
| Remove a reference               | `DELETE` on `…/Nav/$ref`                        | `4.0`  | Server |     Upd     |    MUST     | [Protocol - Remove a Reference][p1-removeref]          |
| Change a single-valued reference | `PUT` on `…/Nav/$ref`                           | `4.0`  | Server |     Upd     |    MUST     | [Protocol - Change the Reference][p1-changeref]        |
| Replace all references           | `PUT` on a collection-valued `…/Nav/$ref`       | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Replace all References][p1-replacerefs]    |

### 11.2 Properties, Values & Collections

| Feature                         | Description                       | Since  |  Role  | Conformance | Requirement | Spec                                                                         |
| ------------------------------- | --------------------------------- | :----: | :----: | :---------: | :---------: | ---------------------------------------------------------------------------- |
| Update a primitive property     | `PUT` on the property URL         | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Update a Primitive Property][p1-updateprimitive]                 |
| Set a value to null             | `DELETE` on the property URL      | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Set a Value to Null][p1-setnull]                                 |
| Update a complex property       | `PATCH`/`PUT` on the property URL | `4.0`  | Server |      –      |   SHOULD    | [Protocol - Update a Complex Property][p1-updatecomplex]                     |
| Update a collection property    | Replace the whole collection      | `4.0`  | Server |      –      |     MAY     | [Protocol - Update a Collection Property][p1-updatecollectionprop]           |
| Update a collection of entities | Delta-style collection update     | `4.01` | Server |      –      |     MAY     | [Protocol - Update a Collection of Entities][p1-updateentitycollection]      |
| Update members of a collection  | `PATCH` via `$each`               | `4.01` | Server |      –      |     MAY     | [Protocol - Update Members of a Collection][p1-updatemembers]                |
| Delete members of a collection  | `DELETE` via `$each`              | `4.01` | Server |      –      |     MAY     | [Protocol - Delete Members of a Collection][p1-deletemembers]                |
| Ordered collections             | Managing members by position      | `4.01` | Server |      –      |     MAY     | [Protocol - Managing Members of an Ordered Collection][p1-orderedcollection] |
| Positional insert               | `$index` on insert                | `4.01` | Server |      –      |     MAY     | [Protocol - Positional Inserts][p1-positionalinserts]                        |

### 11.3 Media Entities & Streams

| Feature                  | Description                                  | Since |  Role  | Conformance | Requirement | Spec                                                      |
| ------------------------ | -------------------------------------------- | :---: | :----: | :---------: | :---------: | --------------------------------------------------------- |
| Create a media entity    | `POST` the stream, then patch the properties | `4.0` | Server |      –      |     MAY     | [Protocol - Create a Media Entity][p1-createmedia]        |
| Update a media stream    | `PUT` on `/$value`                           | `4.0` | Server |      –      |     MAY     | [Protocol - Update a Media Entity Stream][p1-updatemedia] |
| Delete a media entity    | `DELETE` on the entity                       | `4.0` | Server |      –      |     MAY     | [Protocol - Delete a Media Entity][p1-deletemedia]        |
| Update a stream property | `PUT` on the stream property                 | `4.0` | Server |      –      |     MAY     | [Protocol - Update Stream Values][p1-updatestream]        |
| Delete a stream property | `DELETE` on the stream property              | `4.0` | Server |      –      |     MAY     | [Protocol - Delete Stream Values][p1-deletestream]        |

---

## 12. Operations (Functions & Actions)

| Feature                        | Description                                     | Since  |  Role  | Conformance | Requirement | Spec                                                           |
| ------------------------------ | ----------------------------------------------- | :----: | :----: | :---------: | :---------: | -------------------------------------------------------------- |
| Function                       | Side-effect free, `GET`, composable             | `4.0`  | Server |      –      |     MAY     | [Protocol - Functions][p1-functions]                           |
| Action                         | May have side effects, `POST`, not composable   | `4.0`  | Server |      –      |     MAY     | [Protocol - Actions][p1-actions]                               |
| Unbound operation              | Invoked via an import at the service root       | `4.0`  | Server |      –      |     MAY     | [Protocol - Operations][p1-operations]                         |
| Bound operation                | Bound to an entity, collection or complex type  | `4.0`  | Server |      –      |     MAY     | [Protocol - Binding an Operation][p1-bindingoperation]         |
| Function parameters in the URL | `/Rate(value=4)`                                | `4.0`  | Server |      –      |     MAY     | [Protocol - Invoking a Function][p1-invokefunction]            |
| Inline parameter syntax        | Parameters as query options                     | `4.01` | Server |      –      |     MAY     | [Protocol - Inline Parameter Syntax][p1-inlineparams]          |
| Action parameters in the body  | JSON object with named parameters               | `4.0`  | Server |      –      |     MAY     | [Protocol - Invoking an Action][p1-invokeaction]               |
| Overload resolution            | Selecting among overloads by parameter names    | `4.0`  | Server |      –      |     MAY     | [Protocol - Function overload resolution][p1-functionoverload] |
| Composable functions           | Further path segments and options on the result | `4.0`  | Server |      –      |     MAY     | [Protocol - Functions][p1-functions]                           |
| Operation advertisement        | Available operations announced in the payload   | `4.0`  | Server |      –      |     MAY     | [Protocol - Advertising Available Operations][p1-advertising]  |

---

## 13. Asynchronous Requests

| Feature                  | Description                                | Since |  Role  | Conformance | Requirement | Spec                                                    |
| ------------------------ | ------------------------------------------ | :---: | :----: | :---------: | :---------: | ------------------------------------------------------- |
| Request async processing | `Prefer: respond-async`                    | `4.0` |  Both  |      –      |   SHOULD    | [Protocol - respond-async][p1-respondasync]             |
| Status monitor           | `202 Accepted` plus `Location` for polling | `4.0` | Server |      –      |     MAY     | [Protocol - Asynchronous Requests][p1-async]            |
| Polling interval         | `Retry-After`                              | `4.0` | Client |      –      |     MAY     | [Protocol - Retry-After][p1-retryafter]                 |
| Fetching the result      | Final response once processing finished    | `4.0` | Client |      –      |     MAY     | [Protocol - Asynchronous Requests][p1-async]            |
| Cancellation             | `DELETE` on the status monitor             | `4.0` | Client |      –      |     MAY     | [Protocol - Asynchronous Requests][p1-async]            |
| Callback                 | `Prefer: callback` instead of polling      | `4.0` |  Both  |      –      |     MAY     | [Protocol - callback][p1-callback]                      |
| Asynchronous batch       | Async processing of a batch request        | `4.0` | Server |      –      |     MAY     | [Protocol - Asynchronous Batch Requests][p1-asyncbatch] |

---

## 14. Batch Requests

| Feature                     | Description                               | Since  |  Role  | Conformance | Requirement | Spec                                                                 |
| --------------------------- | ----------------------------------------- | :----: | :----: | :---------: | :---------: | -------------------------------------------------------------------- |
| Multipart batch             | `multipart/mixed` body                    | `4.0`  |  Both  |     Adv     |    MUST     | [Protocol - Multipart Batch Format][p1-multipartbatch]               |
| JSON batch                  | Batch as a JSON document                  | `4.01` |  Both  |      –      |     MAY     | [Json - Batch Requests and Responses][json-batch]                    |
| Change sets                 | Group of modifications treated atomically | `4.0`  | Server |     Adv     |    MUST     | [Protocol - Multipart Batch Request Body][p1-batchbody]              |
| Request identification      | `id` per request                          | `4.01` | Client |      –      |     MAY     | [Protocol - Identifying Individual Requests][p1-batchids]            |
| Request dependencies        | `dependsOn` between requests              | `4.01` | Client |      –      |     MAY     | [Protocol - Request Dependencies][p1-batchdeps]                      |
| Referencing new entities    | `$<id>` referring to a previous result    | `4.0`  | Client |     Adv     |    MUST     | [Protocol - Referencing New Entities][p1-batchnewentities]           |
| Referencing an ETag         | Using an ETag from an earlier response    | `4.0`  | Client |      –      |     MAY     | [Protocol - Referencing an ETag][p1-batchetag]                       |
| Referencing response values | Using values from earlier response bodies | `4.01` | Client |      –      |     MAY     | [Protocol - Referencing Values from Response Bodies][p1-batchvalues] |
| Continue on error           | `Prefer: continue-on-error`               | `4.0`  | Client |      –      |     MAY     | [Protocol - continue-on-error][p1-continueonerror]                   |
| Batch headers               | Headers applying to the batch as a whole  | `4.0`  |  Both  |     Adv     |    MUST     | [Protocol - Batch Request Headers][p1-batchheaders]                  |

---

## 15. Aggregation (`$apply`)

Defined by the **Data Aggregation Extension**, not by the core protocol. `$apply` is a pipeline: each
transformation consumes the previous result set.

| Transformation                 | Description                                                                     |  Role  | Conformance | Requirement | Spec                                             |
| ------------------------------ | ------------------------------------------------------------------------------- | :----: | :---------: | :---------: | ------------------------------------------------ |
| `aggregate`                    | Aggregate values with `sum`, `min`, `max`, `average`, `countdistinct`, `$count` | Server |      –      |     MAY     | [Agg - aggregate][agg-aggregate]                 |
| `groupby`                      | Group by properties, optionally with a nested transformation                    | Server |      –      |     MAY     | [Agg - groupby][agg-groupby]                     |
| `filter`                       | Filter within the pipeline                                                      | Server |      –      |     MAY     | [Agg - filter][agg-filter]                       |
| `compute`                      | Add computed properties                                                         | Server |      –      |     MAY     | [Agg - compute][agg-compute]                     |
| `expand`                       | Expand within the pipeline                                                      | Server |      –      |     MAY     | [Agg - groupby with navigation][agg-groupbynav]  |
| `concat`                       | Concatenate several result sets                                                 | Server |      –      |     MAY     | [Agg - concat][agg-concat]                       |
| `identity`                     | Neutral transformation                                                          | Server |      –      |     MAY     | [Agg - identity][agg-identity]                   |
| `orderby`                      | Order within the pipeline                                                       | Server |      –      |     MAY     | [Agg - orderby][agg-orderby]                     |
| `skip` / `top`                 | Paging within the pipeline                                                      | Server |      –      |     MAY     | [Agg - top][agg-top]                             |
| `topcount` / `bottomcount`     | Top or bottom N by an expression                                                | Server |      –      |     MAY     | [Agg - topcount/bottomcount][agg-topcount]       |
| `toppercent` / `bottompercent` | Top or bottom N percent                                                         | Server |      –      |     MAY     | [Agg - toppercent/bottompercent][agg-toppercent] |
| `topsum` / `bottomsum`         | Members contributing to a share of a sum                                        | Server |      –      |     MAY     | [Agg - topsum/bottomsum][agg-topsum]             |
| `search`                       | Free-text search within the pipeline                                            | Server |      –      |     MAY     | [Agg - search][agg-search]                       |
| `join` / `outerjoin`           | Join across navigation properties                                               | Server |      –      |     MAY     | [Agg - join/outerjoin][agg-join]                 |
| `traverse`                     | Traverse a recursive hierarchy                                                  | Server |      –      |     MAY     | [Agg - traverse][agg-traverse]                   |
| `ancestors` / `descendants`    | Hierarchy navigation                                                            | Server |      –      |     MAY     | [Agg - ancestors/descendants][agg-ancestors]     |
| Custom aggregates              | Service-defined aggregation methods                                             | Server |      –      |     MAY     | [Agg - Custom Aggregates][agg-customaggregates]  |

---

## 16. Security & Conformance

| Feature                 | Description                                            | Since  | Role | Conformance | Requirement | Spec                                                              |
| ----------------------- | ------------------------------------------------------ | :----: | :--: | :---------: | :---------: | ----------------------------------------------------------------- |
| Authentication          | Not prescribed; delegated to HTTP mechanisms           | `4.0`  |  –   |    Core     |      –      | [Protocol - Authentication][p1-authentication]                    |
| Security considerations | Injection, information disclosure, resource exhaustion | `4.0`  |  –   |    Core     |      –      | [Protocol - Security Considerations][p1-security]                 |
| 4.0 conformance levels  | Minimal, Intermediate, Advanced                        | `4.0`  |  –   |    Core     |      –      | [Protocol - OData 4.0 Conformance Levels][p1-conformance40]       |
| 4.01 conformance levels | Revised level definitions                              | `4.01` |  –   |    Core     |      –      | [Protocol - OData 4.01 Conformance Levels][p1-conformance401]     |
| Interoperable clients   | What a client must tolerate to be interoperable        | `4.0`  |  –   |    Core     |      –      | [Protocol - Interoperable OData Clients][p1-interoperableclients] |

<!-- Spec reference link definitions (reference-style, not rendered as visible text) -->

[p1-root]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html
[p2-root]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html
[json-root]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html
[csdl-root]: https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html
[agg-root]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html
[p1-datamodel]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_DataModel
[p1-servicemodel]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ServiceModel
[p1-versioning]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Versioning
[p1-protocolversioning]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ProtocolVersioning
[p1-modelversioning]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ModelVersioning
[p1-queryoptext]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_QueryOptionExtensibility
[p1-payloadext]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_PayloadExtensibility
[p1-actionext]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ActionFunctionExtensibility
[p1-vocabext]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_VocabularyExtensibility
[p1-headerext]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderFieldExtensibility
[p1-formatext]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_FormatExtensibility
[p1-formats]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Formats
[p1-headers]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderFields
[p1-statuscodes]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_CommonResponseStatusCodes
[p1-contexturl]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ContextURL
[p1-requestingdata]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_RequestingData
[p1-requestingchanges]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_RequestingChanges
[p1-datamodification]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_DataModification
[p1-operations]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Operations
[p1-async]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_AsynchronousRequests
[p1-batch]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_BatchRequests
[p1-conformance]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Conformance
[rfc2119]: https://tools.ietf.org/html/rfc2119
[p1-entityids]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_EntityIdsandEntityReferences
[p1-readediturls]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ReadURLsandEditURLs
[p1-transient]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_TransientEntities
[p1-defaultns]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_DefaultNamespaces
[p1-servicedocrequest]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ServiceDocumentRequest
[p1-metadatarequest]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_MetadataDocumentRequest
[p1-integrity]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HandlingofIntegrityConstraints
[p1-notadvertised]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HandlingofPropertiesNotAdvertisedinM
[p1-contenttype]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderContentType
[p1-contentencoding]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderContentEncoding
[p1-contentlanguage]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderContentLanguage
[p1-contentlength]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderContentLength
[p1-version]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderODataVersion
[p1-accept]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderAccept
[p1-acceptcharset]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderAcceptCharset
[p1-acceptlanguage]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderAcceptLanguage
[p1-ifmatch]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderIfMatch
[p1-ifnonematch]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderIfNoneMatch
[p1-isolation]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderIsolationODataIsolation
[p1-maxversion]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderODataMaxVersion
[p1-prefer]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderPrefer
[p1-etag]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderETag
[p1-location]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderLocation
[p1-entityid]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderODataEntityId
[p1-odataerror]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderODataError
[p1-prefapplied]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderPreferenceApplied
[p1-retryafter]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderRetryAfter
[p1-asyncresult]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderAsyncResult
[p1-vary]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HeaderVary
[p1-allowentityrefs]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Preferenceallowentityreferencesodata
[p1-callback]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Preferencecallbackodatacallback
[p1-continueonerror]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Preferencecontinueonerrorodatacontin
[p1-includeannotations]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Preferenceincludeannotationsodatainc
[p1-maxpagesize]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Preferencemaxpagesizeodatamaxpagesiz
[p1-omitvalues]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Preferenceomitvalues
[p1-returnpref]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Preferencereturnrepresentationandret
[p1-respondasync]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Preferencerespondasync
[p1-trackchanges]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Preferencetrackchangesodatatrackchan
[p1-wait]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Preferencewait
[p1-200]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ResponseCode200OK
[p1-201]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ResponseCode201Created
[p1-202]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ResponseCode202Accepted
[p1-204]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ResponseCode204NoContent
[p1-3xx]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ResponseCode3xxRedirection
[p1-clienterrors]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ClientErrorResponses
[p1-501]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ResponseCode501NotImplemented
[p1-errorbody]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ErrorResponseBody
[p1-instreamerrors]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_InStreamErrors
[p1-ctx-servicedoc]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ServiceDocument
[p1-ctx-entitycollection]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_CollectionofEntities
[p1-ctx-singleton]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Singleton
[p1-ctx-derivedcollection]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_CollectionofDerivedEntities
[p1-ctx-projectedcollection]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_CollectionofProjectedEntities
[p1-ctx-expandedcollection]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_CollectionofExpandedEntities
[p1-ctx-entityrefs]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_CollectionofEntityReferences
[p1-ctx-propertyvalue]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_PropertyValue
[p1-ctx-complexorprimitive]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ComplexorPrimitiveType
[p1-ctx-operationresult]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_OperationResult
[p1-ctx-delta]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_DeltaPayloadResponse
[p1-ctx-all]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_allResponse
[p1-specifyingproperties]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SpecifyingPropertiestoReturn
[p1-select]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionselect
[p1-expand]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionexpand
[p1-expandoptions]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ExpandOptions
[p1-levels]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ExpandOptionlevels
[p1-compute]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptioncompute
[p1-queryingcollections]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_QueryingCollections
[p1-filter]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionfilter
[p1-filterops]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_BuiltinFilterOperations
[p1-filterfuncs]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_BuiltinQueryFunctions
[p1-paramaliases]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ParameterAliases
[p1-orderby]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionorderby
[p1-top]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptiontop
[p1-count]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptioncount
[p1-search]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionsearch
[p1-format]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionformat
[p1-schemaversion]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SystemQueryOptionschemaversion
[p1-serverpaging]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ServerDrivenPaging
[p1-orderedmember]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_RequestinganIndividualMemberofanOrde
[p1-countrequest]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_RequestingtheNumberofItemsinaCollect
[p1-individualentities]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_RequestingIndividualEntities
[p1-relatedentities]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_RequestingRelatedEntities
[p1-entityreferences]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_RequestingEntityReferences
[p1-resolveentityid]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ResolvinganEntityId
[p1-deltalinks]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_DeltaLinks
[p1-usingdeltalinks]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UsingDeltaLinks
[p1-deltapayloads]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_DeltaPayloads
[p1-createentity]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_CreateanEntity
[p1-updateentity]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UpdateanEntity
[p1-upsert]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UpsertanEntity
[p1-deleteentity]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_DeleteanEntity
[p1-etags]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UseofETagsforAvoidingUpdateConflicts
[p1-returningresults]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ReturningResultsfromDataModification
[p1-datetimeoffset]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_HandlingofDateTimeOffsetValues
[p1-createrelated]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_CreateRelatedEntitiesWhenCreatinganE
[p1-linkrelated]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_LinktoRelatedEntitiesWhenCreatinganE
[p1-updaterelated]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UpdateRelatedEntitiesWhenUpdatinganE
[p1-addref]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_AddaReferencetoaCollectionValuedNavi
[p1-removeref]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_RemoveaReferencetoanEntity
[p1-changeref]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ChangetheReferenceinaSingleValuedNav
[p1-replacerefs]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ReplaceallReferencesinaCollectionval
[p1-updateprimitive]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UpdateaPrimitiveProperty
[p1-setnull]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SetaValuetoNull
[p1-updatecomplex]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UpdateaComplexProperty
[p1-updatecollectionprop]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UpdateaCollectionProperty
[p1-updateentitycollection]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UpdateaCollectionofEntities
[p1-updatemembers]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UpdateMembersofaCollection
[p1-deletemembers]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_DeleteMembersofaCollection
[p1-orderedcollection]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ManagingMembersofanOrderedCollection
[p1-positionalinserts]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_PositionalInserts
[p1-createmedia]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_CreateaMediaEntity
[p1-updatemedia]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UpdateaMediaEntityStream
[p1-deletemedia]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_DeleteaMediaEntity
[p1-updatestream]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_UpdateStreamValues
[p1-deletestream]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_DeleteStreamValues
[p1-functions]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Functions
[p1-actions]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Actions
[p1-bindingoperation]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_BindinganOperationtoaResource
[p1-invokefunction]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_InvokingaFunction
[p1-inlineparams]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_InlineParameterSyntax
[p1-invokeaction]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_InvokinganAction
[p1-functionoverload]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Functionoverloadresolution
[p1-advertising]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_AdvertisingAvailableOperationswithin
[p1-multipartbatch]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_MultipartBatchFormat
[p1-batchbody]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_MultipartBatchRequestBody
[p1-batchids]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_IdentifyingIndividualRequests
[p1-batchdeps]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_RequestDependencies
[p1-batchnewentities]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ReferencingNewEntities
[p1-batchetag]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ReferencinganETag
[p1-batchvalues]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ReferencingValuesfromResponseBodies
[p1-batchheaders]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_BatchRequestHeaders
[p1-asyncbatch]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_AsynchronousBatchRequests
[p1-authentication]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_Authentication
[p1-security]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_SecurityConsiderations
[p1-conformance40]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_OData40ServiceConformanceLevels
[p1-conformance401]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_OData401ServiceConformanceLevels
[p1-interoperableclients]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_InteroperableODataClients
[p2-serviceroot]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_ServiceRootURL
[p2-resourcepath]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_ResourcePath
[p2-model]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingtheModelforaService
[p2-batchendpoint]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingtheBatchEndpointforaServic
[p2-addressingentities]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingEntities
[p2-ref]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingReferencesbetweenEntities
[p2-operations]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingOperations
[p2-property]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingaProperty
[p2-propertyvalue]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingaPropertyValue
[p2-countpath]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingtheCountofaCollection
[p2-member]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingaMemberwithinanEntityColle
[p2-orderedmember]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingaMemberofanOrderedCollecti
[p2-derivedtypes]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingDerivedTypes
[p2-subset]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingaSubsetofaCollection
[p2-each]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingEachMemberofaCollection
[p2-mediastream]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingtheMediaStreamofaMediaEnti
[p2-crossjoin]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingtheCrossJoinofEntitySets
[p2-all]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_AddressingAllEntitiesinaService
[p2-querybody]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_PassingQueryOptionsintheRequestBody
[p2-customquery]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_CustomQueryOptions
[p2-paramaliases]: https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#sec_ParameterAliases
[json-design]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_JSONFormatDesign
[json-metadatalevel]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_ControllingtheAmountofControlInforma
[json-numbers]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_ControllingtheRepresentationofNumber
[json-relativeurls]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_RelativeURLs
[json-ordering]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_PayloadOrderingConstraints
[json-controlinfo]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_ControlInformation
[json-servicedoc]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_ServiceDocument
[json-entity]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_Entity
[json-entitycollection]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_CollectionofEntities
[json-structuralproperty]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_StructuralProperty
[json-untyped]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_UntypedValue
[json-navlink]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_NavigationLink
[json-expandednav]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_ExpandedNavigationProperty
[json-bind]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_BindOperation
[json-collectionetag]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_CollectionETag
[json-streamproperty]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_StreamProperty
[json-mediaentity]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_MediaEntity
[json-operationresponse]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_IndividualPropertyorOperationRespons
[json-operationresponses]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_CollectionofOperationResponses
[json-entityreference]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_EntityReference
[json-delta]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_DeltaPayload
[json-deltaresponses]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_DeltaResponses
[json-addedlink]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_AddedLink
[json-batch]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_BatchRequestsandResponses
[json-instanceannotations]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_InstanceAnnotations
[json-errorinsuccess]: https://docs.oasis-open.org/odata/odata-json-format/v4.01/odata-json-format-v4.01.html#sec_ErrorInformationinaSuccessPayload
[csdl-xml]: https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_XMLRepresentation
[csdl-document]: https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_CSDLXMLDocument
[csdl-entitytype]: https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_EntityType
[csdl-complextype]: https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_ComplexType
[csdl-enumtype]: https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_EnumerationType
[csdl-typedef]: https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_TypeDefinition
[csdl-property]: https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_StructuralProperty
[csdl-navprop]: https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_NavigationProperty
[csdl-container]: https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_EntityContainer
[csdl-actionfunction]: https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_ActionandFunction
[csdl-annotation]: https://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#sec_VocabularyandAnnotation
[agg-aggregate]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationaggregate
[agg-groupby]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationgroupby
[agg-groupbynav]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#groupbynav
[agg-filter]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationfilter
[agg-compute]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationcompute
[agg-concat]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationconcat
[agg-identity]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationidentity
[agg-orderby]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationorderby
[agg-top]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationtop
[agg-topcount]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationsbottomcountandtopcount
[agg-toppercent]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationsbottompercentandtoppercent
[agg-topsum]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationsbottomsumandtopsum
[agg-search]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationsearch
[agg-join]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationsjoinandouterjoin
[agg-traverse]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationtraverse
[agg-ancestors]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#Transformationsancestorsanddescendants
[agg-customaggregates]: https://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/odata-data-aggregation-ext-v4.0.html#CustomAggregates
