---
id: big-number-converters
sidebar_position: 12
---

# Big Number Converters

Big Number converters are about converting OData's `Edm.Int64` and `Edm.Decimal` types or any string represented number
which might exceed JavaScript's build-in `number` type.

For the special case of `Edm.Int64` which might exceed `Number.MAX_SAFE_INTEGER` you could use JavaScript's "new"
`BigInt` type (provided by the common converter package). For all possible decimal values you will need a special,
custom data type, provided by a cool third-party library.

Currently, we offer two different converter packages using libraries of the very same author:

- [bignumber.js](https://github.com/MikeMcl/bignumber.js)
- [decimal.js](https://github.com/MikeMcl/decimal.js)

:::caution

When using OData V4, then you need to use a special format option so that the numeric values of `Edm.Int64` and
`Edm.Decimal` get transferred as `string` rather than `number`. This is necessary to prevent any precision loss
in the first place.

Activate via the base setting `v4BigNumberAsString`.

:::

## Comparison between BigNumber and Decimal

From [the comparison](https://github.com/MikeMcl/big.js/wiki):

> decimal.js was orginally developed through adding support for non-integer powers to bignumber.js,
> but I decided to release it as a separate library. The main difference between them is that precision
> is specified in terms of significant digits in decimal.js instead of decimal places, and all calculations
> are rounded to that precision (similar to Python's decimal module) rather than just those involving division.

> bignumber.js is perhaps more suitable for financial applications because the user doesn't need to worry
> about losing precision unless an operation involving division is used.

> decimal.js may be better for more scientific applications as it can handle very small or large values more
> efficiently. For example, it does not have the limitation of bignumber.js that when adding a value with
> a small exponent to one with a large exponent, bignumber.js will attempt to perform the operation to full precision,
> which may make the time taken for the operation unviable.

> As mentioned above, decimal.js also supports non-integer powers and adds the trigonometric functions
> and exp, ln, and log methods. These additions make decimal.js significantly larger than bignumber.js.

## Conversions

| OData Type    | Result Type  | Converter Id           | Description                                                                                                                                      |
| ------------- | ------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Edm.Int64`   | `BigInt`     | int64ToBigIntConverter | JS native type; "newly" introduced. see [MDN on BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) |
| `Edm.Int64`   | `BigNumber`  | bigNumberConverter     | see [BigNumber documentation](https://mikemcl.github.io/bignumber.js/)                                                                           |
| `Edm.Decimal` | `BigNumber ` | bigNumberConverter     | see [BigNumber documentation](https://mikemcl.github.io/bignumber.js/)                                                                           |
| `Edm.Int64`   | `Decimal`    | decimalConverter       | see [Decimal documentation](https://mikemcl.github.io/decimal.js/)                                                                               |
| `Edm.Decimal` | `Decimal`    | decimalConverter       | see [Decimal documentation](https://mikemcl.github.io/decimal.js/)                                                                               |

## Installation

### BigNumber

You also need to install `bignumber.js`, so in one go:

```shell npm2yarn
npm install --save @odata2ts/converter-big-number bignumber.js
```

### Decimal

You also need to install `decimal.js`, so in one go:

```shell npm2yarn
npm install --save @odata2ts/converter-decimal decimal.js
```

## Configuration

To integrate any converter into any `odata2ts` project, add it to the list of converters
within the project configuration file `odata2ts.config.ts`.

Converters are referenced by their package name, so in this example `@odata2ts/converter-big-number`.

And to make this more complex, let's say we want `BigNumber` for decimals and the native `BigInt` for Int64.
The order of the converters is relevant then: The last one wins. Hence, we put the bigIntConverter last as
it only handles `Edm.Int64`.

```typescript
import { ConfigOptions } from "@odata2ts/odata2ts";

const config: ConfigOptions = {
  converters: [
    "@odata2ts/converter-big-number",
    {
      module: "@odata2ts/converter-common",
      use: ["int64ToBigIntConverter"],
    }],
};

export default config;
```
