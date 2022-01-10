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

### Block Number

Returns the block number of the latest block

```typescript
const blockNumber = await nearRpcProvider.getBlockNumber()
```

### Call a Contract Function

Allows you to call a contract method as a view function.

```typescript
const contractResponse = await nearRpcProvider.contractCall(
  'example.testnet', 'latest', 'getMessages', 'e30='
)
```

### Get an Account Balance

Returns a BigNumber representing the balance on the provided account

```typescript
const balance = await nearRpcProvider.getBalance('example.testnet')
```

### Get an Access Key

Returns information about a single access key for given account.

```typescript
const accessKey = await nearRpcProvider.getAccessKey(
  'example.testnet',
  'ed25519:H9k5eiU4xXS3M4z8HzKJSLaZdqGdGwBG49o7orNC4eZW',
  75866664,
)
```

### Get an Access Key List

Returns all access keys for a given account. You can querying it by `finality`:

```typescript
const accessKeyList = await nearRpcProvider.getAccessKeyList('example.testnet', 'latest')
```

By `block_height`:

```typescript
const accessKeyList = await nearRpcProvider.getAccessKeyList('example.testnet', 27912554)
```

Or by `block_hash`:

```typescript
const accessKeyList = await nearRpcProvider.getAccessKeyList(
  'example.testnet', '3Xz2wM9rigMXzA2c5vgCP8wTgFBaePucgUmVYPkMqhRL'
)
```

### Get Block

[DEPRECATED] Throws the following erorr:

```typescript
Error: getBlock function is not supported in Near nearRpcProvider. Please use getBlockWithChunk function
```

### Get Block With Chunk

Returns block for given `finality`:

```typescript
const block = await nearRpcProvider.getBlockWithChunk({
  finality: 'final' })
```

Or `block_id`:

```typescript
const block = await nearRpcProvider.getBlockWithChunk({ 
  block_id: '81k9ked5s34zh13EjJt26mxw5npa485SY4UNoPi6yYLo',
})
```

### Get Chunk Details

Returns details of a specific chunk. You can get the chunk details by `chunk_id`:

```typescript
const chunk = await nearRpcProvider.getChunkDetails({
  chunk_id: 'EBM2qg5cGr47EjMPtH88uvmXHDHqmWPzKaQadbWhdw22',
})
```

Or by `block_id` and `shard_id`:

```typescript
const chunk = await nearRpcProvider.getChunkDetails({
  block_id: 58934027, 
  shard_id: 0,
})
```

### Get Contract Code

Return the code encoded in base64. You can get the contract code by `block_hash`:

```typescript
const code = await nearRpcProvider.getCode(
  'example.testnet', '4fzLVR8cfyRDi5hDstYQy73eoxMJdWsH72KM6N9TmYmq'
)
```

Or by `block_tag`:

```typescript
const code = await nearRpcProvider.getCode('example.testnet', 'latest')
```

### Get Contract State

Returns the state of a contract based on the key prefix (base64 encoded). You can get it by `block_tag`:

```typescript
const state = await nearRpcProvider.getContractState('example.testnet', 'latest')
```

By `block_height`:

```typescript
const state = await nearRpcProvider.getContractState('example.testnet', 58934027)
```

Or `block_hash`: 

```typescript
const state = await nearRpcProvider.getContractState(
  'example.testnet', '3Xz2wM9rigMXzA2c5vgCP8wTgFBaePucgUmVYPkMqhRL'
)
```

### Get Default Provider

Returns the default provider.

```typescript
const defaultProvider = getDefaultProvider({
  name: 'neartestnet',
  chainId: parseInt(Buffer.from('testnet').toString('hex'), 16),
})
```

### Get Gas Price

Returns a BigNumber representing the current `gasPrice`

```typescript
const gasPrice = await nearRpcProvider.getGasPrice()
```

### Get Network Info

Returns the current state of node network connections.

```typescript
const network = await nearRpcProvider.getNetworkInfo()
```

### Get Validator Status

Returns details and the state of validation on the blockchain. It must be used with an array of `block_hash`:

```typescript
const validator = await nearRpcProvider.getValidatorStatus(
  ['FiG2nMjjue3YdgYAyM3ZqWXSaG6RJj5Gk7hvY8vrEoGw']
)
```

`block_height`:

```typescript
const validator = await nearRpcProvider.getValidatorStatus([17791098])
```

Or `null`:

```typescript
const validator = await nearRpcProvider.getValidatorStatus([null])
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

### Sign a transaction

Return a transaction signed.

```typescript
const [hash, signedTransaction] = await getSignedTransaction(nearRpcProvider)
```

After to get the signed transaction, you'll be able to execute that signed transaction:

```typescript
const txString = Buffer.from(signedTransaction.encode()).toString('base64')
const response = await nearRpcProvider.sendTransaction(txString)
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
