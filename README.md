# Near RPC Providers

[![npm](https://img.shields.io/npm/v/near-rpc-providers)](https://www.npmjs.com/package/near-rpc-providers)
[![CircleCI](https://circleci.com/gh/blockcoders/near-rpc-providers/tree/main.svg?style=svg)](https://circleci.com/gh/blockcoders/near-rpc-providers/tree/main)
[![Coverage Status](https://coveralls.io/repos/github/blockcoders/near-rpc-providers/badge.svg?branch=main)](https://coveralls.io/github/blockcoders/near-rpc-providers?branch=main)
[![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/near-rpc-providers)](https://snyk.io/test/github/blockcoders/near-rpc-providers)

Near JSON RPC Provider compatible with [ethers.js](https://github.com/ethers-io/ethers.js/)

Currently under developement 🤓

## Install

```sh
npm i near-rpc-providers
```

## Usage

### Node

```typescript
// JavaScript
const { NearRpcProvider } = require('near-rpc-providers')

// TypeScript
import { NearRpcProvider } from 'near-rpc-providers'
```

### Browser

Include the ESM module (near-rpc-providers.esm.js) and import using:

```html
<script type="module">
  import { NearRpcProvider } from './near-rpc-providers.esm.js'
</script>
```

## API

The `NearRpcProvider` is an extension over a regular [JsonRpcProvider](https://docs.ethers.io/v5/api/providers/jsonrpc-provider/#JsonRpcProvider) which is a popular method for interacting with the blockchain.

### Initializing

```typescript
// Use a network name of chainId to initialize, see src/networks.ts
const nearRpcProvider = new NearRpcProvider('near')
```

## Methods

### Block number

Returns the block number of the latest block

```typescript
const blockNumber = await nearRpcProvider.getBlockNumber()
```

### Get an account balance

Returns a BigNumber representing the balance on the provided account

```typescript
const balance = await nearRpcProvider.getBalance('blockcoders.testnet')
```

### Get block

Returns a [block](https://docs.ethers.io/v5/api/providers/types/#providers-Block) by `block_id` or `block_hash`

```typescript
const block = await nearRpcProvider.getBlock('7nsuuitwS7xcdGnD9JgrE22cRB2vf2VS4yh1N9S71F4d')
```

### Get Gas Price

Returns a BigNumber representing the current `gasPrice`

```typescript
const gasPrice = await nearRpcProvider.getGasPrice()
```

### Send Transaction

Sends a transaction to be executed asynchronously. Returns a transaction that can be waited for using `transaction.wait()`

```typescript
const transaction = await nearRpcProvider.sendTransaction(
  'DgAAAHNlbmRlci50ZXN0bmV0AOrmAai64SZOv9e/naX4W15pJx0GAap35wTT1T/DwcbbDwAAAAAAAAAQAAAAcmVjZWl2ZXIudGVzdG5ldNMnL7URB1cxPOu3G8jTqlEwlcasagIbKlAJlF5ywVFLAQAAAAMAAACh7czOG8LTAAAAAAAAAGQcOG03xVSFQFjoagOb4NBBqWhERnnz45LY4+52JgZhm1iQKz7qAdPByrGFDQhQ2Mfga8RlbysuQ8D8LlA6bQE=',
)

const receipt = await tx.wait()
```

### Send

Allows sending a request directly to the NEAR RPC, using the given `method` and `params`.

See https://docs.near.org/docs/api/rpc for all available options

```typescript
const blockResponse = await this.send<BlockRpcResponse>('block', { block_id: params.block_id })
```

## Running a NEAR network locally

Follow the documentation [here](https://github.com/kurtosis-tech/near-kurtosis-module#near-kurtosis-module) to set up a NEAR network locally on your machine using [Kurtosis](https://docs.kurtosistech.com/).

## Change Log

See [Changelog](CHANGELOG.md) for more information.

## Contributing

Contributions welcome! See [Contributing](CONTRIBUTING.md).

## Collaborators

- [**Jose Ramirez**](https://github.com/jarcodallo), [Twitter](https://twitter.com/jarcodallo), [NPM](https://www.npmjs.com/~jarcodallo)
- [**Brian Zuker**](https://github.com/bzuker)
- [**Ana Riera**](https://github.com/AnnRiera)

## Acknowledgements

This project was kindly sponsored by [Near](https://near.org/).

## License

Licensed under the MIT - see the [LICENSE](LICENSE) file for details.
