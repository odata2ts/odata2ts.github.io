---
id: naming
sidebar_position: 20
---

# Naming

The topic of naming has multiple dimensions:

On the one hand there are naming schemes. Since `odata2ts` generates multiple artefacts out of a
single entity or complex type, naming schemes are required, to discern, for example, a `Person` (model)
from its magical counter-part `QPerson` (q-object). These naming schemes permeate all aspects of the
generated artefacts and are configurable.

On the other hand exists the topic of renaming entities and props. The first question should be: Is this a good
idea? Usually it's a good thing to have frontend and backend aligned on entity and property names (there's some
middle ground however, see "Naming Strategies").
It's also important to realize that when you rename properties, you typically need to have a way to make this renaming
work for both situations: retrieving data and submitting data. By default, `odata2ts` doesn't tamper with the data
at all.

## Naming Strategies

We employ one general concept labelled "naming strategy" and mean by that a certain way to format
a given string regarding its individual parts. The following naming strategies are supported:

- pascal case: "foo bar" => "FooBar"
- camel case: "foo bar" => "fooBar"
- capital case: "foo bar" => "FOO_BAR"
- snake case: "foo BAR" => "foo_bar"

We rely on the [change-case library](https://www.npmjs.com/package/change-case) here.

Naming strategies guarantee consistency without sacrificing semantics, since the original term lives on.
See the [default config](./03-configuration.md#default-config) for example usage.

## Renaming Properties

When you generate the full-fledged client and rely on its services for retrieving and submitting
data, then you're good to go.

When generating q-objects, you are able to perform name mappings with the help of them.
See the chapter about conversion or take a look into the service implementations.

Otherwise, you should know what you're doing when renaming properties.

### Enable Renaming

You allow `odata2ts` renaming properties via the base setting `allowRenaming` (false by default).

This will then apply the configured naming strategies for entity and property names.

### Manual Property Renaming

You can configure properties manually and thereby rename them. Renaming properties this way is
independent of the `allowRenaming` setting.

You do so by using the setting `propertiesByName` which expects an array of objects.
Each object must have a `name` property which matches the attribute name as it is stated
in the EDMX of the OData service. You specify the new name via the `mappedName` property.

```ts
const config = {
  services: {
    myService: {
      propertiesByName: [
        {
          name: "UserName",
          mappedName: "user",
        }
      ]
    }
  }
}
```

## Configuring Naming Schemes

In general, most naming schemes consist of the following settings:
* prefix
* suffix
* namingStrategy

As best practice, always override `prefix` **and** `suffix`, when you want to set one or the other.

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
    }
  }
}
```
If the special property `applyModelNaming` is `true`, then prefix and suffix of the parent property
are added as well. 

A common convention is to add "I" in front of interfaces, which would be as easy as this:
```ts
const namingConfig = {
  naming: {
    models: {
      prefix: "I",
      suffix: ""
    }
  }
}
```
Now all models would be prefixed in this way, e.g. "IPerson", "IEditablePerson", "IPersonId".


