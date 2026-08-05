---
id: binary-content
title: Binary Content
sidebar_position: 20
---

# Binary Content

OData carries binary data in two shapes, and `odata2ts` generates a service of its own for each:

- a **media entity** — an entity whose _own_ content is binary, declared with `HasStream="true"`. Its
  content lives at `…/$value`.
- a **stream property** (`Edm.Stream`) — one property of an otherwise ordinary entity. V4 only; V2 has no
  such type.

Both are reached through the same small API, so which of the two you are holding rarely matters.

## Reading

```ts
const cover = trippinService.photos(1);

// as a Blob - the whole content in memory
const blob = await cover.getBlob().execute();

// as a ReadableStream - for large content you would rather not buffer
const stream = await cover.getStream().execute();
```

A media entity's content is addressed through the entity service itself. A stream property gets its own
getter, named after the property:

```ts
// stream property "sample" on an audiobook
const sample = await libraryService.audiobooks(id).sample().getBlob().execute();
```

## Writing

```ts
await cover.updateBlob(newBlob, "image/png").execute();
await cover.updateStream(readableStream, "image/png").execute();
await cover.deleteBlob().execute();
```

The MIME type is optional; when omitted the client sends what the `Blob` carries.

:::note

Servers differ here more than elsewhere. Some answer with the MIME type declared in their model rather
than the one you uploaded, and not every server implements `DELETE` on a media resource. The behaviour is
the server's, not the client's.

:::

## Not every HTTP client can do both

Reading binary data is one thing for the generated service and quite another for the transport underneath
it. What actually works depends on the [HTTP client](./http-client/) you plugged in:

| Client                         | `getBlob` / `updateBlob` | `getStream` / `updateStream` |
| ------------------------------ | ------------------------ | ---------------------------- |
| [Fetch](./http-client/fetch)   | ✅                       | ✅                           |
| [Axios](./http-client/axios)   | ✅ in the browser only   | ❌                           |
| [jQuery](./http-client/jquery) | ✅                       | ❌                           |

The reasons are in the transports, not in `odata2ts`:

- **Axios streams nothing.** Its XHR adapter has no streaming API, and its http adapter neither takes a
  `ReadableStream` as request body nor hands one back.
- **Axios reads binary only in the browser.** Without `XMLHttpRequest` it falls back to the http adapter,
  which decodes the response as text — a `Blob` can never come out of that. Note the asymmetry: _sending_
  binary works on either adapter, only a response expecting binary back is refused.
- **jQuery streams nothing either.** `XMLHttpRequest`, which its `ajax` method builds on, has no
  streaming API at all, in either direction.

Where a client cannot do it, the request is refused up front with an error saying so, rather than
returning something unusable. **Use the Fetch client if you deal with binary content**, and especially if
you deal with it outside the browser.

## What the metadata has to say

A media entity needs `HasStream="true"` on the entity type, and a stream property needs the type
`Edm.Stream`. Neither is inferred: if the server does not declare it, no blob service is generated.

That is worth knowing when the same model is served by different implementations. A server may express as
a media entity what another expresses as a stream property — the generated API then differs accordingly,
even though the content is the same.
