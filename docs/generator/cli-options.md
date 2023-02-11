---
id: cli-options
title: Command Line Options
sidebar_position: 3
---

Options specified on the command line always win over other configuration possibilities.

Options `source` and `output` are required unless the config file is used
containing appropriate service definitions.

| Option                     | Shorthand | Required | Default         | Description                                                                                                                                      |
|----------------------------|-----------|:--------:|-----------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| --source                   | -s        |   (x)    |                 | Specifies the source file, i.e. metadata description                                                                                             |
| --output                   | -o        |   (x)    |                 | Specifies the output directory                                                                                                                   |
| --mode                     | -m        |          | "all"           | Allowed are: all, models, qobjects, service                                                                                                      |
| --emit-mode                | -e        |          | "js_dts"        | Specify what to emit. ALlowed values: ts, js, dts, js_dts                                                                                        |
| --prettier                 | -p        |          | false           | Use prettier to pretty print the TS result files; only applies when emitMode = ts                                                                |
| --tsconfig                 | -t        |          | "tsconfig.json" | When compiling TS to JS, the compilerOptions of the specified file are used; only takes effect, when emitMode != ts                              |
| --allow-renaming           | -r        |          | false           | Allow renaming of model entities and their props by applying naming strategies like camelCase or PascalCase                                      |
| --disable-auto-managed-key | -n        |          | false           | odata2ts will automatically decide if a key prop is managed on the server side and therefore not editable; here you can turn off this automatism |
| --debug                    | -d        |          | false           | Add debug information                                                                                                                            |
| --service-name             | -name     |          |                 | Overwrites the service name found in OData metadata => controls name of main odata service                                                       |
