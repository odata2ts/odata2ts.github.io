---
id: binary-content
title: Binary Content
sidebar_position: 20
---

# Binary Content

OData carries binary data in two shapes, and `odata2ts` generates a service of its own for each:

- a **media entity** — an entity whose *own* content is binary, declared with `HasStream="true"`. Its
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

## What the metadata has to say

A media entity needs `HasStream="true"` on the entity type, and a stream property needs the type
`Edm.Stream`. Neither is inferred: if the server does not declare it, no blob service is generated.

That is worth knowing when the same model is served by different implementations. A server may express as
a media entity what another expresses as a stream property — the generated API then differs accordingly,
even though the content is the same.
