---
id: subtypes
title: Subtypes and Type Casts
sidebar_position: 50
---

# Subtypes and Type Casts

OData models inheritance: `Book` extends `PrintMedium` extends `Medium`. A collection of `Medium` then
holds books, magazines and audiobooks alike, and reaching a property that only exists on the derived type
requires a **type cast**.

`odata2ts` generates two ways to do that, and which one you need depends on what you are addressing.

## Casting a resource

Every service of a type with subtypes carries an `asXxxService()` getter per subtype. It appends the type
cast segment to the URL and hands back the service of the derived type, with everything that type has:

```ts
// /Media(<id>)/Library.Catalog.Book
const book = libraryService.media(id).asBookService();

const result = await book.query((builder) => builder.select("pageCount")).execute();
```

Collections have the same, one level up:

```ts
// /Media/Library.Catalog.Book - only the books within the media collection
const books = libraryService.media().asBookCollectionService();
```

:::note

Not every server serves both. A type cast on a collection is the more widely implemented of the two; a
cast on a single entity is refused by some servers with a 404.

:::

## Casting a property

Sometimes you do not want to change the resource at all — you want to `select`, `filter` or `expand` a
property that only the derived type has, while still querying the base collection. For that the base
q-object carries a **cast property** per subtype property, named `Q<Subtype>_<Property>`:

```ts
const result = await libraryService
  .media()
  .query((builder, qMedium) =>
    builder.select("title", "QBook_pageCount").expand("QBook_publisher").filter(qMedium.QBook_pageCount.gt(300)),
  )
  .execute();
```

The rendered URL carries the cast inline — `$select=Library.Catalog.Book/PageCount` — so the request stays
on the base collection and entities of other subtypes simply have no value there.

Since the property is not on the base type, the response model does not know about it either. Cast the
result where you read it:

```ts
(result.data.value[0] as unknown as Book).pageCount;
```
