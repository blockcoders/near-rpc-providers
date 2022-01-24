# Changelog

## 1.0.0
Published by **[jarcodallo](https://github.com/jarcodallo)** on **2022/01/24**
## Milestone 1 - NearProvider
- A NearProvider interface to connect to the official RPCs. 
- The ability to create a default Provider connected to networkish which may be a chain name (i.e. “near-mainnet” or “near-testnet”) or chain ID.
- Unit tests that guarantee the compatibility of this package with ethers.js and near blockchain.
- Integration tests with near testnet to verify the correct functionality of this provider.
- Based on Near official RPCs.

## Milestone 2 - FallbackProvider
- A FallbackProvider for NearProvider.
- Unit tests that guarantee the compatibility of this package with ethers.js and near blockchain.
- Integration tests with near testnet to verify the correct functionality of this provider.

## Milestone 3 - Pipeline with CircleCi and Coverage
- Pipeline for running the unit and integration tests with multiple versions of Node.js and Javascript
- Generate the coverage report with https://coveralls.io/ 

## Milestone 4 - Release
- Inline documentation
- Examples of usage
- Allow querying archival node in some methods
- Sign message