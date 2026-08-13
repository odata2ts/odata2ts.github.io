---
id: configuration
sidebar_position: 2
---

# Configuration

## Basics

### Default Configuration

In the background `odata2ts` has a [defaultConfig](https://github.com/odata2ts/odata2ts/blob/main/packages/odata2ts/src/defaultConfig.ts),
so that you only need to provide those settings which diverge from that.

<details>
<summary>Default Configuration</summary>

```ts
import { ConfigFileOptions, EmitModes, ManagedPropertyDetection, Modes, NamingStrategies } from "@odata2ts/odata2ts";

const defaultConfig = {
  sourceUrlConfig: {},
  refreshFile: false,
  mode: Modes.all,
  emitMode: EmitModes.js_dts,
  debug: false,
  prettier: false,
  tsconfig: "tsconfig.json",
  converters: [],
  skipEditableModels: false,
  skipIdModels: false,
  skipOperations: false,
  skipComments: false,
  enablePrimitivePropertyServices: false,
  managedPropertyDetection: ManagedPropertyDetection.auto,
  allowRenaming: false,
  v2: {
    responseResultsWrapping: false,
    payloadResultsWrapping: false,
    responseAsV4: false,
  },
  v4: {
    bigNumberAsString: false,
    odataVersion: "4.0",
    enableNativeInOperator: false,
  },
  disableAutomaticNameClashResolution: false,
  bundledFileGeneration: false,
  unflattenComplexTypes: false,
  enumType: "string",
  enumByAllowedValues: false,
  disableBindingProps: false,
  disableDeepInsertProps: false,
  naming: {
    models: {
      namingStrategy: NamingStrategies.PASCAL_CASE,
      propNamingStrategy: NamingStrategies.CAMEL_CASE,
      editableModels: {
        prefix: "Editable",
        suffix: "",
        applyModelNaming: true,
      },
      idModels: {
        prefix: "",
        suffix: "Id",
        applyModelNaming: true,
      },
      operationParamModels: {
        prefix: "",
        suffix: "Params",
        applyModelNaming: true,
      },
      fileName: {
        namingStrategy: NamingStrategies.PASCAL_CASE,
        prefix: "",
        suffix: "Model",
      },
    },
    queryObjects: {
      namingStrategy: NamingStrategies.PASCAL_CASE,
      propNamingStrategy: NamingStrategies.CAMEL_CASE,
      prefix: "Q",
      suffix: "",
      idFunctions: {
        prefix: "",
        suffix: "Id",
      },
      fileName: {
        namingStrategy: NamingStrategies.PASCAL_CASE,
        prefix: "Q",
        suffix: "",
      },
      baseType: {
        applyQNaming: true,
        prefix: "",
        suffix: "BaseType",
      },
    },
    services: {
      prefix: "",
      suffix: "Service",
      namingStrategy: NamingStrategies.PASCAL_CASE,
      main: {
        applyServiceNaming: true,
      },
      collection: {
        prefix: "",
        suffix: "Collection",
        applyServiceNaming: true,
      },
      operations: {
        namingStrategy: NamingStrategies.CAMEL_CASE,
      },
      relatedServiceGetter: {
        namingStrategy: NamingStrategies.CAMEL_CASE,
        prefix: "",
        suffix: "",
      },
      privateProps: {
        namingStrategy: NamingStrategies.CAMEL_CASE,
        prefix: "_",
        suffix: "",
      },
    },
  },
  propertiesByName: [],
  byTypeAndName: [],
};
```

</details>

### Configuration Hierarchy

`odata2ts` exposes different configuration possibilities. Here are all of them and the order in which they are applied:

- **default config**: sensible defaults provided by `odata2ts`
- **base settings**: basic settings which apply to all configured services
- **service settings**: settings for one specific service, `source` and `output` must be specified
- **CLI options**: options provided from command line

The base settings are also some kind of default settings as they have an effect on the generation process
of all configured odata services. Base settings are applied on top of the default config.

All settings starting from the `services` attribute are only valid for a specific service and only applied
for its generation run. Service specific settings may override any default or base setting and allow
for reconfiguring entities and properties.

<details>
<summary>Some visual aid: A picture can say more than a thousand words...</summary>

![Base vs Service Settings](../../static/img/base-and-service-settings.png)

</details>

Options specified on the command line always win over other configuration possibilities.
Most base settings are available as CLI options.
Options `source` and `output` are required unless the config file is also used
containing appropriate service definitions.

:::tip

Consider using the config file for all your configurations.

:::

## Base Settings

Here is the list of all **base settings** of the config file. By and large this matches the [CLI options](#cli-options).

| Base Setting                        | Type                                      | Default Value     | Description                                                                                                                                                                                                      |
| ----------------------------------- | ----------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| sourceUrlConfig                     | `UrlSourceConfiguration`                  | `{}`              | Configuration of the request to download the metadata file. See [downloading-metadata](#downloading-metadata)                                                                                                    |
| refreshFile                         | `boolean`                                 | `false`           | Download metadata file even if it exists. See [downloading-metadata](#downloading-metadata)                                                                                                                      |
| mode                                | `Modes`                                   | `"all"`           | Allowed are: all, models, qobjects, service. See [generation modes](#generation-modes)                                                                                                                           |
| emitMode                            | `EmitModes`                               | `"js_dts"`        | Specify what to emit. ALlowed values: ts, js, dts, js_dts. See [emit modes](#emit-modes)                                                                                                                         |
| prettier                            | `boolean`                                 | `false`           | Use prettier to pretty print the TS result files; only applies when emitMode = ts. See [emitting TypeScript](#emitting-typescript)                                                                               |
| tsconfig                            | `string`                                  | `"tsconfig.json"` | When compiling TS to JS, the compilerOptions of the specified file are used; only takes effect, when emitMode != ts. See [emitting JS](#emitting-compiled-js--dts)                                               |
| allowRenaming                       | `boolean`                                 | `false`           | Allow renaming of model entities and their props by applying naming strategies like camelCase or PascalCase. See [renaming properties](#renaming-entities-and-properties)                                        |
| managedPropertyDetection            | `ManagedPropertyDetection`                | `"auto"`          | Which sources odata2ts derives from whether a prop is managed on the server side and therefore not editable. Allowed are: auto, annotation, simpleHeuristic, none. See [managed properties](#managed-properties) |
| debug                               | `boolean`                                 | `false`           | Turn off adding `ts-nocheck` to all generated artefacts; prints out debug information                                                                                                                            |
| serviceName                         | `string`                                  |                   | Overwrites the service name found in OData metadata. But only makes sense on this level when `source` & `output` are specified via CLI options.                                                                  |
| skipEditableModels                  | `boolean`                                 | `false`           | Don't generate separate models for manipulating actions (create, update, patch). See [fine-tuning artefact generation](#fine-tuning-artefact-generation)                                                         |
| skipIdModels                        | `boolean`                                 | `false`           | Don't generate separate models & q-objects for entity ids. See [fine-tuning artefact generation](#fine-tuning-artefact-generation)                                                                               |
| skipOperations                      | `boolean`                                 | `false`           | Don't generate separate models & q-objects for operations (function or action). See [fine-tuning artefact generation](#fine-tuning-artefact-generation)                                                          |
| skipComments                        | `boolean`                                 | `false`           | Don't generate comments for model properties. See [fine-tuning artefact generation](#fine-tuning-artefact-generation)                                                                                            |
| converters                          | `Array<TypeConverterConfig>`              | `[]`              | Provide list of installed converters to use. See [converters](#types-and-converters)                                                                                                                             |
| naming                              | `OverridableNamingOptions`                | see defaultConfig | Configure naming aspects of the generated artefacts. See [configuring naming schemes](#configuring-naming-schemes)                                                                                               |
| bundledFileGeneration               | `boolean`                                 | `false`           | Bundle the generation into one file per kind of artefact instead of a folder per model. See [file layout](#file-layout--cyclic-imports)                                                                          |
| enumType                            | `"string" \| "numeric" \| "string-union"` | `"string"`        | How to represent enums in TypeScript. See [enum representation](#enum-representation)                                                                                                                            |
| unflattenComplexTypes               | `boolean`                                 | `false`           | Group properties which the service states flat (`Address_City`) back into one complex property. See [flattened complex types](#flattened-complex-types)                                                          |
| enumByAllowedValues                 | `boolean`                                 | `false`           | Generate an enum from a `Validation.AllowedValues` annotation carrying symbolic names. See [enums a service only describes](#enums-a-service-only-describes)                                                     |
| disableBindingProps                 | `boolean`                                 | `false`           | Don't allow to bind an existing entity to a navigation property by its key. See [binding and deep insert](#binding-and-deep-insert)                                                                              |
| disableDeepInsertProps              | `boolean`                                 | `false`           | Don't allow to create or update related entities within the payload of their parent. See [binding and deep insert](#binding-and-deep-insert)                                                                     |
| disableAutomaticNameClashResolution | `boolean`                                 | `false`           | Turn off the counter odata2ts appends when one name results from several types; only relevant with `bundledFileGeneration`. See [name clashes](#name-clashes)                                                    |
| enablePrimitivePropertyServices     | `boolean`                                 | `false`           | Generate services for primitive properties, allowing to read, update and delete a single property (excluding stream properties). See [primitive property services](#primitive-property-services)                 |
| v4.bigNumberAsString                | `boolean`                                 | `false`           | Retrieve types of `Edm.Int64` and `Edm.Decimal` as `string` instead of `number`. See [handling big numbers](#big-number-handling)                                                                                |
| v4.enableNativeInOperator           | `boolean`                                 | `false`           | Render the `in` operator natively instead of rolling it out as equals-expressions.See [the in operator](#using-the-native-in-operator)                                                                           |
| v4.odataVersion                     | `"4.0" \| "4.01"`                         | `"4.0"`           | Which minor version of OData V4 to target; affects payloads and response types. See [OData 4.01](#odata-401)                                                                                                     |
| v2.responseResultsWrapping          | `boolean`                                 | `false`           | State that a V2 service answers with an extra wrapper object around an expanded entity collection. See [extra results wrapper](#extra-results-wrapper)                                                           |
| v2.payloadResultsWrapping           | `boolean`                                 | `false`           | The same for a request payload, i.e. the nested collection of a deep insert. See [extra results wrapper](#extra-results-wrapper)                                                                                 |
| v2.responseAsV4                     | `boolean`                                 | `false`           | Reshape every response of a V2 service as its V4 equivalent, so consumers only ever deal with the V4 shape. See [V2 responses as V4](#use-v4-response-shapes)                                                    |

## Service Settings

There's one more option on the root level of the config file called `services`.
It represents the entry point into the **service settings**, which are by nature specific for a single odata service.
The `services` option is an object, where each key is the internal name of the service
and the value is the configuration (class `ServiceGenerationOptions`).

These service settings contain **all base settings**, options `source` and `output` (cf. CLI options),
as well as options to reconfigure entities and properties:

| Service Setting  | Type                                | Default Value | Description                                                                                                                                      |
| ---------------- | ----------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| source           | `string`                            | ---           | Specifies the path to the metadata source file (EDMX). See [setup-and-usage](setup-and-usage#configuration)                                      |
| sourceUrl        | `string`                            | ---           | Full URL to the root of your OData service. See [downloading-metadata](#downloading-metadata)                                                    |
| output           | `string`                            | ---           | Specifies the output directory. This folder gets cleaned and overwritten on generation. See [setup-and-usage](setup-and-usage#configuration)     |
| serviceName      | `string`                            |               | Overwrites the service name found in OData metadata & controls the main service name. Same as the base setting but on this level it makes sense. |
| byTypeAndName    | `Array<TypeBasedGenerationOptions>` | `[]`          | Match types by their name and configure them. See [type options](#type-options)                                                                  |
| propertiesByName | `Array<PropertyGenerationOptions>`  | `[]`          | Match properties by their name and configure them. See [configuration by property](#configuration-by-property)                                   |

## CLI Options

Here is the list of all options available for the command line.
As you can see, this largely matches the **base settings**:

- additionally, `source` and `output` options are available (cf. [service settings](#service-settings))
- options `skipXXX`, `converters` and `naming` are not available though

| CLI Option                     | Default Value     | Description                                                                                                                                                                                                      |
| ------------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--source-url`<br/>`-u`        |                   | Specifies the full URL to the root of your OData service. See [downloading-metadata](#downloading-metadata)                                                                                                      |
| `--source`<br/>`-s`            |                   | Specifies the path to the metadata source file (EDMX). See [setup-and-usage](setup-and-usage#configuration)                                                                                                      |
| `--output`<br/>`-o`            |                   | Specifies the output directory. This folder gets cleaned and overwritten on generation. See [setup-and-usage](setup-and-usage#configuration)                                                                     |
| `--refresh-file`<br/>`-f`      |                   | Download metadata file again, even if it exists. See [downloading-metadata](#downloading-metadata)                                                                                                               |
| `--service-name`               |                   | Overwrites the service name found in OData metadata => controls name of main odata service                                                                                                                       |
| `--mode`<br/>`-m`              | `"all"`           | Allowed are: all, models, qobjects, service. See [generation modes](#generation-modes)                                                                                                                           |
| `--emit-mode`<br/>`-e`         | `"js_dts"`        | Specify what to emit. ALlowed values: ts, js, dts, js_dts. See [emit modes](#emit-modes)                                                                                                                         |
| `--prettier`<br/>`-p`          | `false`           | Use prettier to pretty print the TS result files; only applies when emitMode = ts. See [emitting TypeScript](#emitting-typescript)                                                                               |
| `--tsconfig`<br/>`-t`          | `"tsconfig.json"` | When compiling TS to JS, the compilerOptions of the specified file are used; only takes effect, when emitMode != ts. See [emitting JS](#emitting-compiled-js--dts)                                               |
| `--allow-renaming`<br/>`-r`    | `false`           | Allow renaming of model entities and their props by applying naming strategies like camelCase or PascalCase. See [renaming properties](#renaming-entities-and-properties)                                        |
| `--managed-property-detection` | `"auto"`          | Which sources odata2ts derives from whether a prop is managed on the server side and therefore not editable. Allowed are: auto, annotation, simpleHeuristic, none. See [managed properties](#managed-properties) |
| `--debug`<br/>`-d`             | `false`           | Add debug information; also removes the `@ts-nocheck` comment from each generated file                                                                                                                           |

Besides options, the CLI takes any number of **service names** as arguments. Each must exist in the config
file, and only those services are generated:

```shell
npx odata2ts trippin
npx odata2ts trippin northwind
```

Without arguments all configured services are generated. Note that specifying `--source` **and** `--output`
replaces the configured services altogether rather than overriding them: those two options describe exactly
one service, so nothing is left to merge.

## Downloading Metadata

You can let `odata2ts` download the metadata from your OData service.
You use the option `sourceUrl` and specify the full URL to the root of your OData service, e.g. `https://services.odata.org/TripPinRESTierService`.

- the URL is allowed to end with a forward slash
- the URL is allowed to end with `/$metadata`

If you require basic auth to access the OData server, then you need to use the `sourceUrlConfig` option to set
`username` and `password`. If you require a more advanced configuration, then you have a custom request configuration
object called `custom`: It's [the request config of Axios](https://axios-http.com/docs/req_config).

The `source` option becomes the storage path of the downloaded file.

- use `prettier: true` to pretty print the file (uses `prettier` and `@prettier/plugin-xml` under the hood)
- the `prettier` option will respect your own prettier setting file
- see [plugin-xml](https://github.com/prettier/plugin-xml) for further config options

### Caching

By default, `odata2ts` will only download the metadata file, if it does not exist locally.
Use the `refreshFile` option to force the download. As this option is also available via the CLI,
you can also append the `-f` option:

- npm: `npx odata2ts -f`
- package script `gen-odata`: `npm run gen-odata -- -f`
- yarn:`yarn odata2ts -f`

## Generation Modes

`odata2ts` is able to produce three different kinds of artefacts:

- `models`: tailor-made TypeScript types for entities, complex types, entity Ids and what not
- `qobjects`: powerful q-objects to leverage the type-safe and fluent query builder
- `service`: full-fledged, domain-savvy OData service capable of type-safe queries, CRUD operations and more

Each artefact type depends on the existence of the former artefact type.
So you can either generate 1) only models, 2) q-objects and models or 3) services, q-objects and models.

You control this aspect of the generation process with the `mode` setting,
which has an enum representation in the config file (`import { Modes } from "@odata2ts/odata2ts"`).

### Fine-Tuning Artefact Generation

If you're only interested in `models` or `qobjects`, you might want to skip the generation of
certain artefacts. The following options are available as base-settings:

- `skipComments`
  - dispense with comments for each model property
- `skipEditableModels`
  - don't create entity representations needed for create, update and patch operations
- `skipIdModels`
  - don't create types representing the ID of each entity type
  - don't create q-id functions, helpful for formatting and parsing entity paths
- `skipOperations`
  - don't create types representing function or action parameters
  - don't create q-functions or q-actions which help to handle those operation calls

## Emit Modes

`odata2ts` supports generating JS / dts or TypeScript files. You control this with the `emitMode` option,
which has an enum representation in the config file (`import { EmitModes } from "@odata2ts/odata2ts"`).

By default, JS & dts files are emitted.

### Emitting Compiled JS / dts

Since the generation process only needs to run when your OData service changes (and therewith
its metadata), it makes sense to compile the generated stuff to JS / dts at that moment.
This unburdens your TS compiler when developing your app, as it is not required to compile
the generated code.

By default, `odata2ts` tries to use the `tsconfig.json` at root level for compilation.
You can specify the path to your TS config file via the option `tsconfig`.

You can also configure to produce only JS or only DTS files, whatever that use case may be.

### Emitting TypeScript

When setting the emitMode to TypeScript, you will need to include the output folder for TypeScript.

The easiest route would be to point the output directory to something like `src/generated/trippin`,
assuming that `src` is included in your TS config.

However, a cleaner approach would be an own directory like `gen*src/trippin` and the inclusion
of the `gen-src` folder in your `tsconfig.json`.

`odata2ts` allows to prettify the generated TS files via [prettier](https://prettier.io/).
When installed and configured, you just set the option `prettier` to `true`.

## File Layout & Cyclic Imports

By default `odata2ts` generates a **folder per model**, each holding that model's artefacts, plus `index.ts`
barrel files: one per namespace and one at the root of the output directory. Importing from those barrels is
the most robust way to consume the generated code, since it does not depend on where an individual artefact
ends up.

That layout may entail cyclic imports which are perfectly valid within an OData model, just think of a bidirectional
link between two services. Modern module loader can resolve this anyway, well, as long as both imports don't reference
each other at the top level. However, some setups cannot: SAP UI5 in combination with the TS Babel plugin is the known
case right now. Set `bundledFileGeneration` to `true` in those situations, and the generation is bundled into one file
per kind of artefact (models, q-objects and services) which prevents any import cycles by design.

:::note

Up to version 0.41.0 `bundledFileGeneration` defaulted to `true`. If your imports broke when upgrading,
either switch the option back on or move your imports to the generated index files.

:::

### Name Clashes

OData scopes names by namespace, so the same name may legitimately occur multiple times in different namespaces.
`odata2ts` works with the fully qualified name internally but generates from the plain one, which can therefore collide.

How that is handled depends on the [file layout](#file-layout--cyclic-imports):

- **folder per model** (the default): each namespace has a folder of its own and the index files re-export
  each of them under its own name, so the same name in two namespaces needs no resolution at all. Within
  one namespace it is fatal and generation stops - and it cannot happen by accident, since OData already
  requires those names to be unique. It only arises from renaming.
- **bundled**: everything shares one file per artefact kind, so the plain names have to be unique. A
  counter is appended to resolve it: `Branch` and `Branch2`. Set `disableAutomaticNameClashResolution` to
  `true` to turn that off - the generation then fails on a clash instead, and you resolve it yourself via
  [`byTypeAndName`](#type-options) using the fully qualified name.

`disableAutomaticNameClashResolution` is therefore only relevant with `bundledFileGeneration`.

A clash that no automatism can resolve is a **renaming** clash: two distinct OData names collapsing onto one
TypeScript name, e.g. `Location_` and `Location` under camelCase. Only you can say which of the two keeps
the plain name, so generation stops with a message naming both and pointing at `propertiesByName` or
`byTypeAndName`.

## Enum Representation

The `enumType` option controls how enums surface in TypeScript:

- `"string"` (default): a string enum, i.e. `enum Feature { Feature1 = "Feature1" }`
- `"numeric"`: a numeric enum, i.e. `enum Feature { Feature1 = 1 }`, using the values from the metadata
- `"string-union"`: a plain union of string literals, i.e. `type Feature = "Feature1" | "Feature2"`

The wire format is unaffected: OData transports the member name in every case. With `"string-union"` the
generator additionally emits the member list as a constant of the same name, since the query objects need
something at runtime that a union type does not provide.

## Enums a Service Only Describes

Not every service which has enums declares them. In SAP CAP an enum is a constraint on a value rather than
a type of its own, so no `<EnumType>` is emitted at all: the property keeps its underlying primitive and
the members turn into a `Validation.AllowedValues` annotation, each allowed value carrying its name in a
nested `Core.SymbolicName`.

```xml
<Property Name="Status" Type="Edm.Byte"/>
...
<Annotations Target="Library.Service.Copies/Status">
  <Annotation Term="Validation.AllowedValues">
    <Collection>
      <Record Type="Validation.AllowedValue">
        <Annotation Term="Core.SymbolicName" String="Available"/>
        <PropertyValue Property="Value" Int="0"/>
      </Record>
      ...
    </Collection>
  </Annotation>
</Annotations>
```

By default such a property reaches you as the `number` it is. Setting `enumByAllowedValues` to `true`
generates an enum from the annotation, named after the property, and types the property with it:

```ts
const copy = (await service.Copies(key).query().execute()).data;

copy.Status; // 0          - off (default)
copy.Status; // "Available" - on, i.e. Status.Available
```

The service knows nothing of that enum, so the _value_ behind a member is what travels - in payloads as
well as in `$filter` and `$orderby`. The generated client converts between the two, which means the
`enumType` option applies here as it does to a declared enum.

A property is converted only if **every** allowed value carries a symbolic name. Where one does not, the
property is left as it was: an enum missing one of its values would reject a value the service accepts.

:::warning Bit masks are not supported

odata2ts does not support `IsFlags` enums, and one derived from an annotation cannot be a flags enum
either: `AllowedValues` lists the values a property allows and says nothing about **combining** them.
The generated enum therefore covers exactly the values listed, so a combination of two of them - `1 | 2`
where CAP's `Branches/Amenities` lists `1, 2, 4, 8, 16` - is a value the type does not know, and it
converts to `undefined` on the way in. That combination is legal as far as the service is concerned, which
is why this option is off by default: where a service packs a set into a number, leaving that number
alone remains the honest choice.

:::

## Binding and Deep Insert

The **editable models** - the models you pass to modification requests (POST, PUT, PATCH) - carry
the navigation properties in two shapes to support two ways of manipulating entity associations:

- `Binding`: link an already existing entity by its key, `{ Author: { "@id": 1 } }`. The query objects
  turn that key into the URL of the entity and into the notation of the targeted OData version -
  `Author@odata.bind` for 4.0, `{"@id": …}` for 4.01 and `__metadata.uri` for V2.
  - the id type is exactly the id type of the entity, so it supports the short form and complex keys
  - the heavy string lifting odata2ts performs here for you is the translation from the key to the entity URL
- `Deep Insert` / `Deep Update`: pass the related entity as part of the parent entity to realise
  a deep insert (POST) or deep update (PATCH / PUT)
  - all name mappings and conversions are applied to the nested entity or entities as well
  - probably the most intuitive way

In regard to server support, `Binding` comes out-of-the-box with all tested server frameworks (ASPNet, CAP and Olingo),
while `Deep Insert` and `Deep Update` have a mixed story. For ASPNet you need to implement manually on the DB layer,
while CAP supports this out-of-the-box again, but with the important limitation that this only works
for `Composition` not regular `Association` (CAP specific distinction).

CAP also supports an alternative as it additionally maps the key of the associated entity
as simple property, e.g. if the entity has a navigation property `BestFriend` then you automatically
get `BestFriend_ID`. Setting a new id on this property is effectively the same as `Binding`.

You can switch off both features individually with `disableBindingProps`
and `disableDeepInsertProps`.

## Flattened Complex Types

Not every service maps a structured element to a `<ComplexType>`. SAP CAP unfolds it into one property per
leaf, joined by an underscore, so a `PostalAddress` sitting on `Member.Address` reaches you as four
separate properties - `Address_Street`, `Address_City`, `Address_PostalCode`, `Address_Country`.
That is the shape CAP recommends.

When setting `unflattenComplexTypes` to `true` odata2ts helps out here by grouping them back into one complex
property:

```ts
const member = (await service.Members(1).query().execute()).data;

member.Address_City; // off (default)
member.addressCity; // off (default) with renaming
member.address.city; // on with renaming
```

Request and response payloads are converted in both directions and query paths are rewritten,
so that you have one consistent API surface which is the complex type. How CAP actually works becomes an
implementation detail again:

```ts
service
  .Members()
  .query((builder, qMember) =>
    builder.expanding("address", (address, qAddress) =>
      address.select("street", "city").filter(qAddress.city.eq("Hamburg")),
    ),
  );
// $filter=Address_City eq 'Hamburg'&$select=Address_Street,Address_City
```

### Grouping Heuristic

Grouping is done automatically using the following heuristic:

- find properties which contain an underscore
- if a name part references a navigation property, don't touch it
- if the last part ends with `_Id`, don't touch it
  - except there are more properties with the same prefix part, then they also get grouped
- if the last part is empty, e.g. `Location_`, don't touch it

Where the metadata declares a `<ComplexType>` whose properties match the group exactly, that type is used
with its own name. Only where no declared type matches is one
synthesized, named after the model and the group (`Member_Address`).

:::note

The separator is the underscore, which is what CAP uses, and it is not configurable.

:::

## Primitive Property Services

With OData you can address a single primitive property as a resource of its own, reading, updating and
deleting it. Usually you would not - a request for the whole entity fetches more relevant information in
one go - which is why `enablePrimitivePropertyServices` is off by default.

Services for `Edm.Stream` properties and media entities are generated regardless of this setting.

:::note

Not every server serves individual properties. Check yours before switching this on.

:::

## V4 Specific Options

### Big Number Handling

Numbers of type `Edm.Int64` and `Edm.Decimal` are represented as `number` in V4.
However, these numbers might not fit into JS' number type, which might result in precision loss.

OData offers a special IEEE754 format option to get those types as `string` instead to prevent any
precision loss. So if you're handling very large or very small numbers (JS roughly supports 15 digits),
then you should set the config option `v4.bigNumberAsString` to `true`.

Activating this option affects the type generation and will use `string` for `Edm.Int64` and `Edm.Decimal`.
All requests are executed with the **accept header** set to `application/json;IEEE754Compatible=true`.
Additionally, when sending data the very same value will be set for the **content-type header**.

Now you can use converters to get a better suited data type: See [Big Number Converters](../converters/big-number-converters).

:::note

The OData V4 specification allows to set this format option on a per-request basis.
`odata2ts` handles this format option globally, because the type generation process is affected.

:::

### Using the native `in` Operator

By default the query builder emulates `in` by rolling it out into a series of equals-expressions, which
works against any V4 service as well as V2. Set `v4.enableNativeInOperator` to `true` to use the native
operator instead, resulting in shorter queries: `$filter=Language in ('de','en')` rather than
`$filter=(Language eq 'de' or Language eq 'en')`. Of course, the server must support this.

### OData 4.01

`v4.odataVersion` selects which minor version of OData V4 to target. It defaults to `"4.0"`, the more widely
deployed and more compatible one. Setting `"4.01"` affects three things:

- the notation of bindings, see [binding and deep insert](#binding-and-deep-insert)
- the control information in requests & responses: 4.01 uses the short form (`@context`), 4.0 the prefixed one
  (`@odata.context`)
- the `OData-Version` header, which is declared on every request so that the service answers in the
  matching form

## V2 Specific Options

### Extra Results Wrapper

The OData V2 specification is sometimes quite ambiguous or not detailed enough. This is especially true when it
comes to the JSON representation of expanded collections. Because of that two variants exist in the wild:

```ts
export interface Category {
  // this is the default typing by odata2ts
  products: Array<Product> | DeferredContent;
}

export interface Category {
  // this is with the extra results wrapper
  products: { results: Array<Product> } | DeferredContent;
}
```

This does not only apply to responses but to requests as well. And to make things even more protracted you might
have a server which behaves differently regarding requests and responses.
Which of the two your service uses cannot be told from its metadata, so you need to state it yourself:

| Option                       | What it states                                                   |
| ---------------------------- | ---------------------------------------------------------------- |
| `v2.responseResultsWrapping` | responses carry the wrapper, so the generated models describe it |
| `v2.payloadResultsWrapping`  | a request payload has to carry it                                |

Both default to `false` and both take effect in **every generation mode**: `odata2ts` hands the structure
through exactly as it was received or given, so a service which wraps needs `v2.responseResultsWrapping`
whether you generate bare types or a complete client.

:::note

Earlier versions of `odata2ts` removed this wrapper from a response by themselves, and the options only
took effect with `mode=Models`. That runtime work-around is gone as it doesn't work for the request
side.

:::

### Use V4 Response Shapes

A V2 service answers in its own JSON verbose shape - collections wrapped as `{d: {results: [...]}}`,
entities as `{d: {...entity, __metadata: {uri, type, etag}}}`, an unexpanded navigation property carrying a
`{__deferred: {uri}}` placeholder instead of simply being absent. Setting `v2.responseAsV4` to `true`
reshapes every response of that service as its V4 equivalent instead:

```ts
export interface Category {
  // V2, the default
  products: Array<Product> | DeferredContent;
}

export interface Category {
  // v2ResponseAsV4
  products: Array<Product>;
}
```

- a collection becomes `{value: [...], "@odata.count"?, "@odata.nextLink"?}`
- an entity is returned bare, with `__metadata` turned into `@odata.id` / `@odata.type` / `@odata.etag`
- a navigation property that hasn't been expanded is simply left out, exactly as a real V4 service would
  send it - not stated as `DeferredContent` at all, since there is nothing to narrow against
- the reshaping applies recursively, so an expanded navigation property is reshaped the very same way,
  however deep

The generated response types change accordingly (`ODataCollectionResponseV4` / `ODataModelResponseV4` /
`ODataValueResponseV4` instead of their V2 counterparts), so a consumer of the generated client only ever
deals with the V4 shape - the same client code works against a V2 or a V4 service without knowing which.

Bindings and deep inserts already went by the version-neutral notation before this option existed
(`{"@id": key}`, turned into whatever the wire needs by [`QBinding`](#binding-and-deep-insert)), so
`v2.responseAsV4` only ever touches responses.

:::note

The options `v2.responseResultsWrapping` and `v2.payloadResultsWrapping` still apply in this scenario.

:::

## Types and Converters

OData defines its own primitive data types: `Edm.*` (e.g. `Edm.String` or `Edm.Boolean`).
The JSON representation for each type is defined by the V2 and V4 OData specifications.

Without any converters `odata2ts` adheres to the appropriate specification.

| OData Type           | V2 Type   | V4 Type   | Example                                                    | Description                                                      |
| -------------------- | --------- | --------- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| `Edm.String`         | `string`  | `string`  | `"Test"`                                                   |                                                                  |
| `Edm.Boolean`        | `boolean` | `boolean` | `true`                                                     |                                                                  |
| `Edm.Byte`           | `string`  | `number`  | V2: `"1"`<br/>V4: `1`                                      |                                                                  |
| `Edm.SByte`          | `string`  | `number`  |                                                            |                                                                  |
| `Edm.Int16`          | `number`  | `number`  | `3`                                                        |                                                                  |
| `Edm.Int32`          | `number`  | `number`  | `222`                                                      |                                                                  |
| `Edm.Int64`          | `string`  | `number`  |                                                            |                                                                  |
| `Edm.Single`         | `string`  | `number`  |                                                            |                                                                  |
| `Edm.Double`         | `string`  | `number`  |                                                            |                                                                  |
| `Edm.Decimal`        | `string`  | `number`  |                                                            |                                                                  |
| `Edm.Duration`       | -         | `string`  | `"P12DT12H15M"`                                            | ISO 8601 Duration                                                |
| `Edm.Time`           | `string`  | -         | `"PT12H15M"`                                               | ISO 8601 Duration, restricted to the time part                   |
| `Edm.TimeOfDay`      | -         | `string`  | `"12:15:00"`                                               | ISO 8601 Time                                                    |
| `Edm.Date`           | -         | `string`  | `"2022-12-31"`                                             | ISO 8601 Date                                                    |
| `Edm.DateTime`       | `string`  | -         | `"/Date(123...)/"`                                         | completely custom format: Unix time stamp with offset in minutes |
| `Edm.DateTimeOffset` | `string`  | `string`  | `"2022-12-31T12:15:00Z"`<br/>`"2022-12-31T12:15:00+01:00"` | ISO 8601 Date and Time                                           |
| `Edm.Binary`         | `string`  | `string`  |                                                            | base64 encoded string                                            |

### Type Converters

`odata2ts` acknowledges the fact that this kind of shallow data representation (string of some format)
is far from being optimal and offers [**converters**](../converters) to use different data types.

Available converter packages:

- v2-to-v4: dispense with weired `DateTime` formats and numeric `string`s
- common: facilitate JS `Date` or `bigint`
- luxon: use Luxon's `DateTime` and `Duration` types
- ui5-v2: use same types as UI5's V2 ODataModel

See [Provided Converters](../converters/#provided-converters)

### Roll Your Own Converter

Outline:

- individual converters reside in a **converter package** which is an own JS module with its own `package.json`
- each converter implements interface `ValueConverter<x, y>`
- follow conventions regarding package structure and exports

See [Creating You Own Converter Module](../converters/#creating-your-own-converter-module).

## Naming

Since `odata2ts` generates multiple artefacts out of a single entity or complex type,
**naming schemes** are required, to discern, for example, a `Person` (model)
from its magical counter-part `QPerson` (q-object). These "naming schemes" permeate all aspects of the
generated artefacts and are configurable.

However, first we need one simple concept: Naming strategies.

### Naming Strategies

We employ one general concept labelled "naming strategy" and mean by that a certain way to format
a given string regarding its individual parts. The following naming strategies are supported:

- pascal case: "foo bar" => "FooBar"
- camel case: "foo bar" => "fooBar"
- constant case: "foo bar" => "FOO_BAR"
- snake case: "foo BAR" => "foo_bar"

We rely on the [change-case library](https://www.npmjs.com/package/change-case) here (actually we only
use the mentioned packages not the whole library, but it's a nice overview).

Naming strategies guarantee consistency without sacrificing semantics, since the original term lives on.

### Configuring Naming Schemes

In general, most naming schemes consist of the following settings:

- prefix
- suffix
- namingStrategy

Here is an example showing the default naming options for models:

```ts
const namingConfig = {
  naming: {
    models: {
      namingStrategy: NamingStrategies.PASCAL_CASE,
      propNamingStrategy: NamingStrategies.CAMEL_CASE,
      editableModels: {
        prefix: "Editable",
        suffix: "",
        applyModelNaming: true,
      },
      idModels: {
        prefix: "",
        suffix: "Id",
        applyModelNaming: true,
      },
      operationParamModels: {
        prefix: "",
        suffix: "Params",
        applyModelNaming: true,
      },
      fileName: {
        namingStrategy: NamingStrategies.PASCAL_CASE,
        prefix: "",
        suffix: "Model",
      },
    },
  },
};
```

If the special property `applyModelNaming` is `true`, then prefix and suffix of the parent property
are added as well. For example, a common convention is to add "I" in front of interfaces,
which would be as easy as this:

```ts
const namingConfig = {
  naming: {
    models: {
      prefix: "I",
      suffix: "",
    },
  },
};
```

Because `applyModelNaming` is by default set to `true`, all related models would be prefixed in
this way: `IPerson`, `IEditablePerson`, `IPersonId`.

:::tip

As best practice, always override `prefix` **and** `suffix`, when you want to set one or the other.

:::

## Managed Properties

Some properties are **managed by the server**, most notably ID fields:
The server is responsible for generating a unique identifier for each new entity.
Other examples are fields like `createdAt` or `modifiedBy` which are
automatically handled by the server or database.

odata2ts has a simple heuristic to decide that single key properties are
read only. However, OData actually allows the server to provide such information
via annotations, which then take precedence over the simple heuristic and also
captures more properties. Last but not least you can control this explicitly via
property configuration.

The options are fine-grained thanks to OData, so you get the following options:

- readOnly: editable models don't get this property
- writeOnly: the regular read models don't get this property
- createOnly: optional or required on create, not allowed on updates
- optionalWithDefault: property is optional and a default is set by the server if not provided

:::note

CreateOnly is special: to be implemented.

:::

### Annotations

odata2ts respects the following annotations to decide on the managed state, which all belong
to the `Org.OData.Core.V1` vocabulary:

| Term                   | Meaning                                                                      | Effect on the generated models                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `Computed`             | The server generates the value, on insert as well as on update               | Left out of the editable model                                                                                         |
| `Permissions`          | Which access the client has; only `Read` resp. only `Write` are acted upon   | Read-only: left out of the editable model.<br/>Write-only: left out of the model, since it never arrives in a response |
| `ComputedDefaultValue` | The client may supply a value; without one the server generates a default    | Editable, but never required                                                                                           |
| `Immutable`            | The client may supply a value on create, and it stays unchanged from then on | Editable, but never required                                                                                           |

Alias resolution for the vocabulary as well as both ways of attaching an annotation are supported:
inline as a child of the property, and externally through an `<Annotations Target="...">` block.  
Annotations whose value is a **dynamic expression** (`Path`, `If`, `Apply`, …) are ignored.
The same goes for **qualified** annotations (`Qualifier="..."`), which apply to a context that only
the application knows.

### The Simple Heuristic

Many services state no annotations at all. For those `odata2ts` falls back on an automatism: single key
fields (the key of the entity is composed of one single field), like ID, are marked as `readOnly`, while
each field of a complex key (the key of the entity is composed of multiple fields) is left alone.

Note that this heuristic only ever concerns keys - it has nothing to say about any other property.

### Detection Sources

The option `managedPropertyDetection` controls which of the two sources `odata2ts` derives the managed
state from. It applies to **every property**, not just to keys.

| Value             | Annotations | Simple heuristic                               |
| ----------------- | ----------- | ---------------------------------------------- |
| `auto` (default)  | yes         | yes, but only where no annotation applies      |
| `annotation`      | yes         | no                                             |
| `simpleHeuristic` | no          | yes - the behaviour before annotations existed |
| `none`            | no          | no                                             |

With `none` no property is managed at all unless you say so yourself via configuration.

### Configuration by Property

You can configure properties manually to mark them as `managed`;
this always wins over the annotations of the service and over the simple heuristic,
whatever `managedPropertyDetection` is set to.
See [property options](#property-options).

## Reconfiguring Entities and Properties

`odata2ts` offers some options to reconfigure entities and properties of your OData service:

- apply naming strategies for their names: see [renaming entities and properties](#renaming-entities-and-properties)
- use different names by manually specifying them
- override faulty key definitions for entities
- mark properties as `managed` to prevent any client side manipulation of them

The last three options are realized via the settings `propertiesByName` or `byTypeAndName`
which work in the same way. Both expect an array of objects, whereby each object must have
a `name` property. This `name` property must match the entity or property name as it is stated
in the EDMX of the OData service.

The `name` property can also be a regular expression which matches the whole name
(internally we add "^" to the beginning and "$" to the end of the expression).

### Renaming Entities and Properties

By default, `odata2ts` uses the names as they are provided by the OData service.

Usually it's a good thing to have frontend and backend aligned on entity and property names.
There's some middle ground, however: Allow to apply [naming strategies](#naming-strategies).
So you use the same names, but allow for adjustable casing (e.g. camel-case or pascal-case).
This makes things more natural from a JS perspective.

Via the setting `allowRenaming` (false by default) you allow `odata2ts` to apply
the configured naming strategies for entity (default: pascal-case) and property names (default: camel-case).

### Type Options

The setting `byTypeAndName` matches any kind of type - entity type, complex type, enum type, operation,
entity set or singleton - and lets you:

- rename it (regular expressions are supported)
- fix a faulty key specification (entity types only)
- configure its properties (entity and complex types only)

Each entry needs a `type` attribute, which narrows what else the entry may contain. Use `TypeModel.Any`
to match regardless of kind:

```ts
import { TypeModel } from "@odata2ts/odata2ts";

const config = {
  services: {
    myService: {
      source: "...",
      output: "...",
      byTypeAndName: [
        {
          type: TypeModel.EntityType,
          name: "SOME_CrazY_NAME",
          mappedName: "saneName",
        },
        {
          type: TypeModel.Any,
          name: /SOME_PREFIX_(.*)/, // match by regular expression
          mappedName: "$1", // replace name by captured group => thereby remove the prefix
        },
        {
          type: TypeModel.EntityType,
          name: "FaultyEntity",
          // fix faulty key specification by manually naming all the key properties
          keys: ["Id", "Version"],
        },
        {
          type: TypeModel.ComplexType,
          name: "Address",
          // same options as propertiesByName, but scoped to this type
          properties: [{ name: "Street_", mappedName: "street" }],
        },
      ],
    },
  },
};
```

The `name` may be the simple name (`"Person"`) or the fully qualified one (`"Trippin.Person"`). The latter
is what you need when the same name exists in more than one namespace - see [name clashes](#name-clashes).

:::note

Renaming types this way is independent of the `allowRenaming` setting
(see [renaming entities and properties](#renaming-entities-and-properties)).

:::

### Property Options

You have two options here:

- rename properties (regular expressions are supported)
- mark properties as managed (cf. [managed properties](#managed-properties))

```ts
const config = {
  services: {
    myService: {
      propertiesByName: [
        // simple renaming
        {
          name: "someWeiredPropName",
          mappedName: "saneName",
        },
        {
          name: /id/i, // uses case: insensitive regular expression to find "ID", "id", "Id", ..
          mappedName: "id", // rename them consistently
          managed: true, // mark them as managed
        },
        // use a list of fields to mark them all as managed
        ...["createdAt", "createdBy", "modifiedAt", "modifiedBy"].map((prop) => ({ name: prop, managed: true })),
        // the finer states are available as well
        { name: "isbn", managed: ManagedState.createOnly },
      ],
    },
  },
};
```

`managed` takes a `ManagedState` or a boolean, where `true` stands for `ManagedState.readOnly` and
`false` for `ManagedState.off` - the latter being the way to insist that a property stays editable no
matter what the service annotated or the key detection would decide.

:::note

Renaming properties this way is independent of the `allowRenaming` setting
(see [renaming entities and properties](#renaming-entities-and-properties)).

:::
