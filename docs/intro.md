---
sidebar_position: 1
---

# Intro

At the heart of `odata2ts` lies the generator, which uses the metadata of any V2 or V4 compatible
OData service to build any of the following types of artefacts:
* TypeScript model interfaces representing entities, entity ids, and operation parameters
* so called "QueryObjects", which are functional units and allow for typesafe querying, data type conversion and more
* TypeScript based OData client services

The generated code artefacts can be used in Browser or Node.js environments.

##  Features
* OData V2 and V4 are supported
* generates compiled JS / DTS files or TypeScript files (prettified or not)
* can handle multiple odata services
* typescript based configuration file
* allows to add converters to interact with data types of your choice instead of OData's data formats
  * [v2-to-v4-converter](https://www.npmjs.com/package/@odata2ts/converter-v2-to-v4)
  * [luxon-converter](https://www.npmjs.com/package/@odata2ts/converter-luxon)
  * see [converter-api](https://www.npmjs.com/package/@odata2ts/converter-api) to roll your own converter
* extensive configuration options regarding the naming of the generated artefacts
* configure properties individually
  * name mapping
  * mark property as managed (not editable), e.g. id fields or fields like "lastModified"
