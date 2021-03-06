import { BigNumber } from '@ethersproject/bignumber'
import { FallbackProvider } from '@ethersproject/providers'
import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { Signature, SignedTransaction } from 'near-api-js/lib/transaction'
import sinon from 'sinon'
import { getDefaultProvider } from './default-provider'
import { NearRpcProvider, RpcError } from './near-rpc-provider'
import { NEAR_TESTNET_NETWORK, NEAR_BETANET_NETWORK, NEAR_NETWORK } from './networks'
import { GetTransactionStatusRpcResponse } from './responses'
import { getPublicKey, getSignedTransaction, TEST_ENCODED_KEY } from './tests/utils'

describe('NearRpcProvider', () => {
  let provider: NearRpcProvider
  use(chaiAsPromised)

  beforeEach(async () => {
    provider = new NearRpcProvider(NEAR_TESTNET_NETWORK)

    await provider.ready
  })

  afterEach(async () => {
    sinon.restore()
  })

  it('should be defined', () => {
    expect(provider).to.not.be.undefined
  })

  describe('blockNumber', () => {
    it('should get latest block number', async () => {
      const block = await provider.getBlockNumber()
      expect(block).to.be.finite
    })
  })

  describe('getBalance', () => {
    it('should get the balance for the account', async () => {
      const balance = await provider.getBalance('blockcoders.testnet')
      expect(balance).to.be.instanceOf(BigNumber)
    })

    it('should throw an error if params are not provided', async () => {
      expect(provider.getBalance('')).to.be.rejectedWith(Error)
    })
  })

  describe('getBlock', () => {
    it('should throw an error when get a block by number', async () => {
      expect(provider.getBlock(75370071)).to.be.rejectedWith(Error)
    })

    it('should throw an error when get a block by hash', async () => {
      expect(provider.getBlock('4QVtKkFWhpEHjaf3w1QovdZCKX5bF5wE7KZY3sJHscbe')).to.be.rejectedWith(Error)
    })
  })

  describe('getGasPrice', () => {
    it('should get the most recent gas price', async () => {
      const gasPrice = await provider.getGasPrice()
      expect(gasPrice).to.be.instanceOf(BigNumber)
      expect(gasPrice.gt(BigNumber.from(0))).to.be.true
    })

    it('should throw an error if there is something wrong', async () => {
      expect(provider.getGasPrice()).to.be.rejectedWith(Error)
    })
  })

  describe('sendTransaction', () => {
    it('should send a transaction', async () => {
      const tx = await provider.sendTransaction(
        'DgAAAHNlbmRlci50ZXN0bmV0AOrmAai64SZOv9e/naX4W15pJx0GAap35wTT1T/DwcbbDwAAAAAAAAAQAAAAcmVjZWl2ZXIudGVzdG5ldNMnL7URB1cxPOu3G8jTqlEwlcasagIbKlAJlF5ywVFLAQAAAAMAAACh7czOG8LTAAAAAAAAAGQcOG03xVSFQFjoagOb4NBBqWhERnnz45LY4+52JgZhm1iQKz7qAdPByrGFDQhQ2Mfga8RlbysuQ8D8LlA6bQE=',
      )

      expect(tx.hash).to.equal('6zgh2u9DqHHiXzdy9ouTP7oGky2T4nugqzqt9wJZwNFm')
    })
  })

  describe('getCode', () => {
    it('should get the contract code by id', async () => {
      const status = await provider.status()
      const code = await provider.getCode('blockcoders.testnet', status.sync_info.latest_block_height)
      expect(code).to.not.be.undefined
    })

    it('should get the contract code by hash', async () => {
      const status = await provider.status()
      const code = await provider.getCode('blockcoders.testnet', status.sync_info.latest_block_hash)
      expect(code).to.not.be.undefined
    })

    it('should get the contract code', async () => {
      const code = await provider.getCode('blockcoders.testnet', 'latest')
      expect(code).to.be.exist
    })

    it('should throw an error if params are not provided', async () => {
      expect(provider.getCode('', '')).to.be.rejectedWith(Error)
    })
  })

  describe('perform', () => {
    it('should get the default case perform call', async () => {
      try {
        await provider.perform('test', {})
      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.an.instanceof(Error)
      }
    })
  })

  describe('getBaseUrl', () => {
    it('should get the instance of near rpc provider for betanet network', async () => {
      try {
        const betanet = new NearRpcProvider(NEAR_BETANET_NETWORK)
        expect(betanet).to.be.exist
      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.an.instanceof(Error)
      }
    })

    it('should get the instance of near rpc provider for main network', async () => {
      try {
        const nearnet = new NearRpcProvider(NEAR_NETWORK)
        expect(nearnet).to.be.exist
      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.an.instanceof(Error)
      }
    })

    it('should throw an error if there is an unsupported network', async () => {
      try {
        await new NearRpcProvider('other-network')
      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.an.instanceof(Error)
      }
    })
  })

  describe('defaultUrl', () => {
    it('should get the default url', async () => {
      const url = NearRpcProvider.defaultUrl()
      expect(url).to.exist
      expect(url).to.not.be.null
      expect(url).to.not.be.undefined
    })
  })

  describe('uncachedDetectNetwork', () => {
    it('should get the network', async () => {
      expect(provider._uncachedDetectNetwork()).to.eventually.to.exist
    })

    it('should get the network from EXPERIMENTAL_genesis_config', async () => {
      const stub = sinon.stub(NearRpcProvider.prototype, 'send').onCall(0).throws()

      expect(provider._uncachedDetectNetwork()).to.eventually.to.exist
      stub.restore()
    })

    it('should throw an error if could not get the network from RPC', async () => {
      const stub = sinon.stub(NearRpcProvider.prototype, 'send').onCall(0).throws().onCall(1).throws()

      expect(provider._uncachedDetectNetwork()).to.be.rejectedWith(Error)
      stub.restore()
    })

    it('should throw an error if chainId is invalid', async () => {
      const stub = sinon.stub(NearRpcProvider.prototype, 'send').onCall(0).resolves({ chain_id: 'sarasa' })

      expect(provider._uncachedDetectNetwork()).to.be.rejectedWith(Error)
      stub.restore()
    })

    it('should throw an error if chainId is null or undefined', async () => {
      const stub = sinon.stub(NearRpcProvider.prototype, 'send').onCall(0).resolves({ chain_id: null })

      expect(provider._uncachedDetectNetwork()).to.be.rejectedWith(Error)
      stub.restore()
    })
  })

  describe('getBlockWithChunk', () => {
    it('should get the block with chunk by finality', async () => {
      const block = await provider.getBlockWithChunk({
        finality: 'final',
      })
      expect(block).to.be.exist
      expect(block).to.not.be.undefined
    })

    it('should get the block with chunk by block id', async () => {
      const latest = await provider.getBlockWithChunk({
        finality: 'final',
      })
      const block = await provider.getBlockWithChunk({
        block_id: latest.chunks[0].prev_block_hash,
      })
      expect(block).to.be.exist
      expect(block).to.not.be.undefined
    })

    it('should throw an error if block id is not provided', async () => {
      expect(
        provider.getBlockWithChunk({
          block_id: '',
        }),
      ).to.be.rejectedWith(Error)
    })

    it('should throw an error if finality is not provided', async () => {
      expect(
        provider.getBlockWithChunk({
          finality: '',
        }),
      ).to.be.rejectedWith(Error)
    })

    it('should throw an error if params are not provided', async () => {
      expect(provider.getBlockWithChunk({})).to.be.rejectedWith(Error)
    })
  })

  describe('getChunkDetails', () => {
    it('should get chunk details by chunk id', async () => {
      const latest = await provider.getBlockWithChunk({
        finality: 'final',
      })
      const chunk = await provider.getChunkDetails({
        chunk_id: latest.chunks[0].chunk_hash,
      })
      expect(chunk).to.be.exist
      expect(chunk).to.not.be.undefined
    })

    it('should get chunk details by block and shard id', async () => {
      const latest = await provider.getBlockWithChunk({
        finality: 'final',
      })
      const chunk = await provider.getChunkDetails({
        block_id: latest.chunks[1].prev_block_hash,
        shard_id: latest.chunks[1].shard_id,
      })
      expect(chunk).to.be.exist
      expect(chunk).to.not.be.undefined
    })

    it('should throw an error if chunk id is not provided', async () => {
      expect(
        provider.getChunkDetails({
          chunk_id: '',
        }),
      ).to.be.rejectedWith(Error)
    })

    it('should throw an error if block id is not provided', async () => {
      expect(
        provider.getChunkDetails({
          shard_id: 0,
        }),
      ).to.be.rejectedWith(Error)
    })

    it('should throw an error if shard id is not provided', async () => {
      const latest = await provider.getBlockWithChunk({
        finality: 'final',
      })
      expect(
        provider.getChunkDetails({
          block_id: latest.chunks[1].prev_block_hash,
        }),
      ).to.be.rejectedWith(Error)
    })

    it('should throw an error if params are not provided', async () => {
      expect(provider.getChunkDetails({})).to.be.rejectedWith(Error)
    })
  })

  describe('getContractState', () => {
    it('should get the contract state', async () => {
      const state = await provider.getContractState('blockcoders.testnet', 'latest')
      expect(state).to.be.exist
      expect(state.values).length.to.be.gte(0)
      expect(state.block_height).to.be.exist
      expect(state.block_hash).to.be.exist
    })

    it('should get the contract state by block_height', async () => {
      const status = await provider.status()
      const state = await provider.getContractState('blockcoders.testnet', status.sync_info.latest_block_height)
      expect(state).to.not.be.undefined
      expect(state.values).length.to.be.gte(0)
      expect(state.block_height).to.be.exist
      expect(state.block_hash).to.be.exist
    })

    it('should get the contract state by block_hash', async () => {
      const status = await provider.status()
      const state = await provider.getContractState('blockcoders.testnet', status.sync_info.latest_block_hash)
      expect(state).to.not.be.undefined
      expect(state.values).length.to.be.gte(0)
      expect(state.block_height).to.be.exist
      expect(state.block_hash).to.be.exist
    })

    it('should throw an error if params are not provided', () => {
      expect(provider.getContractState('', '')).to.be.rejectedWith(Error)
    })
  })

  describe('getValidatorStatus', () => {
    it('should get details and the state of validation on the blockchain by block hash', async () => {
      const block = await provider.getBlockWithChunk({
        finality: 'final',
      })
      const validator = await provider.getValidatorStatus([block.parentHash])
      expect(validator).to.exist
      expect(validator.current_validators).length.to.be.gte(0)
      expect(validator.next_validators).length.to.be.gte(0)
      expect(validator.current_fishermen).length.to.be.gte(0)
      expect(validator.next_fishermen).length.to.be.gte(0)
      expect(validator.current_proposals).length.to.be.gte(0)
    })

    it('should get details and the state of validation on the blockchain by block height', async () => {
      const block = await provider.getBlockWithChunk({
        finality: 'final',
      })
      const validator = await provider.getValidatorStatus([block.number])
      expect(validator).to.exist
      expect(validator.current_validators).length.to.be.gte(0)
      expect(validator.next_validators).length.to.be.gte(0)
      expect(validator.current_fishermen).length.to.be.gte(0)
      expect(validator.next_fishermen).length.to.be.gte(0)
      expect(validator.current_proposals).length.to.be.gte(0)
    })

    it('should get details and the state of validation on the blockchain with nullable array', async () => {
      const validator = await provider.getValidatorStatus([null])
      expect(validator).to.exist
      expect(validator.current_validators).length.to.be.gte(0)
      expect(validator.next_validators).length.to.be.gte(0)
      expect(validator.current_fishermen).length.to.be.gte(0)
      expect(validator.next_fishermen).length.to.be.gte(0)
      expect(validator.current_proposals).length.to.be.gte(0)
    })

    it('should throw an error if params are not provided', () => {
      expect(provider.getValidatorStatus([])).to.be.rejectedWith(Error)
    })
  })

  describe('getNetworkInfo', () => {
    it('should get network information', async () => {
      const network = await provider.getNetworkInfo()
      expect(network).to.be.exist
      expect(network.active_peers).length.to.be.gt(0)
      expect(network.known_producers).length.to.be.gt(0)
    })

    it('should throw an error if something went wrong with the node', async () => {
      const stub = sinon.stub(NearRpcProvider.prototype, 'send').onCall(0).throws()

      expect(provider.getNetworkInfo()).to.be.rejectedWith(Error)
      stub.restore()
    })
  })

  describe('getAccessKeyList', () => {
    it('should get the access key list by finality', async () => {
      const accessKeyList = await provider.getAccessKeyList('blockcoders.testnet', 'latest')
      expect(accessKeyList).to.be.exist
      expect(accessKeyList.keys).length.to.be.greaterThan(0)
      expect(accessKeyList.keys[0].access_key).to.exist
      expect(accessKeyList.keys[0].access_key.nonce).to.be.greaterThanOrEqual(0)
      expect(accessKeyList.keys[0].public_key).to.be.exist
    })

    it('should get the access key list by block height', async () => {
      const status = await provider.status()
      const accessKeyList = await provider.getAccessKeyList('blockcoders.testnet', status.sync_info.latest_block_height)
      expect(accessKeyList).to.not.be.undefined
      expect(accessKeyList.keys).length.to.be.greaterThan(0)
      expect(accessKeyList.keys[0].access_key).to.exist
      expect(accessKeyList.keys[0].access_key.nonce).to.be.greaterThanOrEqual(0)
      expect(accessKeyList.keys[0].public_key).to.be.exist
    })

    it('should get the access key list by block hash', async () => {
      const status = await provider.status()
      const accessKeyList = await provider.getAccessKeyList('blockcoders.testnet', status.sync_info.latest_block_hash)
      expect(accessKeyList).to.not.be.undefined
      expect(accessKeyList.keys).length.to.be.greaterThan(0)
      expect(accessKeyList.keys[0].access_key).to.exist
      expect(accessKeyList.keys[0].access_key.nonce).to.be.greaterThanOrEqual(0)
      expect(accessKeyList.keys[0].public_key).to.be.exist
    })

    it('should throw an error if params are not provided', () => {
      expect(provider.getAccessKeyList('', '')).to.be.rejectedWith(Error)
    })
  })

  describe('getAccessKey', () => {
    it('should get the access key by block id', async () => {
      const status = await provider.status()
      status.sync_info.latest_block_height
      const accessKey = await provider.getAccessKey(
        'client.chainlink.testnet',
        'ed25519:H9k5eiU4xXS3M4z8HzKJSLaZdqGdGwBG49o7orNC4eZW',
        status.sync_info.latest_block_height,
      )
      expect(accessKey).to.not.be.undefined
    })

    it('should get the access key by finality', async () => {
      const accessKey = await provider.getAccessKey(
        'client.chainlink.testnet',
        'ed25519:H9k5eiU4xXS3M4z8HzKJSLaZdqGdGwBG49o7orNC4eZW',
        'latest',
      )

      expect(accessKey).to.exist
      expect(accessKey.block_hash).to.be.string
      expect(accessKey.block_height).to.be.greaterThan(0)
      expect(accessKey.nonce).to.be.greaterThan(0)
    })

    it('should throw an error if params are not provided', () => {
      expect(provider.getAccessKey('', '', '')).to.be.rejectedWith(Error)
    })
  })

  describe('signTransaction', () => {
    it('should sign the transaction', async () => {
      const [hash, signedTransaction] = await getSignedTransaction(provider)

      expect(hash).to.be.instanceOf(Uint8Array)
      expect(signedTransaction).to.be.instanceOf(SignedTransaction)
      expect(signedTransaction.transaction.signerId).to.equal('blockcoders-tests.testnet')
      expect(signedTransaction.transaction.receiverId).to.equal('blockcoders.testnet')
      expect(signedTransaction.signature).to.be.instanceOf(Signature)
    })

    it('should be able to execute and wait for the signed transaction', async () => {
      const [hash, signedTransaction] = await getSignedTransaction(provider)
      const txString = Buffer.from(signedTransaction.encode()).toString('base64')
      const response = await provider.sendTransaction(txString)
      expect(hash).to.be.string
      expect(response.hash).to.be.string
      const receipt = await response.wait()

      expect(receipt.blockHash).to.be.string
      expect(receipt.from).to.equal('blockcoders-tests.testnet')
      expect(receipt.to).to.equal('blockcoders.testnet')
    })
  })

  describe('signMessage', () => {
    it('should be able to sign a message', async () => {
      const response = await provider.signMessage(TEST_ENCODED_KEY, 'test message', 'blockcoders-tests.testnet')
      expect(response.signature).to.exist
      expect(response.publicKey.toString()).to.eq(getPublicKey(TEST_ENCODED_KEY).toString())
      return true
    })
  })

  describe('getDefaultProvider', () => {
    it('should get the default provider', () => {
      const defaultProvider = getDefaultProvider(NEAR_TESTNET_NETWORK)
      expect(defaultProvider).to.exist
      expect(defaultProvider).to.be.instanceof(FallbackProvider)
    })

    it('should throw an error if the network is not valid', () => {
      try {
        getDefaultProvider('')
      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.instanceof(Error)
      }
    })
  })

  describe('contractCall', () => {
    it('should call a contract function', async () => {
      const contractResponse = await provider.contractCall('guest-book.testnet', 'latest', 'getMessages', 'e30=')
      expect(contractResponse).to.exist
      expect(contractResponse).to.not.be.null
      expect(contractResponse).to.not.be.undefined
    })

    it('should throw an error if addressOrName is not provided', () => {
      expect(provider.contractCall('', 'latest', 'getMessages', 'e30=')).to.be.rejectedWith(Error)
    })

    it('should throw an error if blockTag is not provided', () => {
      expect(provider.contractCall('guest-book.testnet', '', 'getMessages', 'e30=')).to.be.rejectedWith(Error)
    })

    it('should throw an error if methodName is not provided', () => {
      expect(provider.contractCall('guest-book.testnet', 'latest', '', 'e30=')).to.be.rejectedWith(Error)
    })

    it('should throw an error if argsBase64 is not provided', () => {
      expect(provider.contractCall('guest-book.testnet', 'latest', 'getMessages', '')).to.be.rejectedWith(Error)
    })

    it('should throw an error if params are not provided', () => {
      expect(provider.contractCall('', '', '', '')).to.be.rejectedWith(Error)
    })
  })

  describe('providerCompatibilityCheck', () => {
    it('should work through the near rpc provider', () => {
      const fallbackProvider = new FallbackProvider([new NearRpcProvider(NEAR_TESTNET_NETWORK)])
      expect(fallbackProvider).to.exist
      expect(fallbackProvider).to.not.be.null
      expect(fallbackProvider).to.not.be.undefined
    })

    it('should work getBlockNumber method of near provider through the fallback provider', async () => {
      const fallbackProvider = new FallbackProvider([new NearRpcProvider(NEAR_TESTNET_NETWORK)])
      const getBlockNumber = await fallbackProvider.getBlockNumber()
      expect(getBlockNumber).to.exist
      expect(getBlockNumber).to.not.be.null
      expect(getBlockNumber).to.not.be.undefined
    })

    it('should throw an error if getBlockNumber are not well-instanciated in fallback provider', () => {
      const fallbackProvider = new FallbackProvider([new NearRpcProvider(NEAR_TESTNET_NETWORK)])
      expect(fallbackProvider.getBlockNumber()).to.be.rejectedWith(Error)
    })

    it('should work getGasPrice method of near provider through the fallback provider', async () => {
      const fallbackProvider = new FallbackProvider([new NearRpcProvider(NEAR_TESTNET_NETWORK)])
      const getGasPrice = await fallbackProvider.getGasPrice()
      expect(getGasPrice).to.exist
      expect(getGasPrice).to.not.be.null
      expect(getGasPrice).to.not.be.undefined
    })

    it('should throw an error if getGasPrice are not well-instanciated in fallback provider', () => {
      const fallbackProvider = new FallbackProvider([new NearRpcProvider(NEAR_TESTNET_NETWORK)])
      expect(fallbackProvider.getGasPrice()).to.be.rejectedWith(Error)
    })

    it('should throw an error if the near rpc provider is not well-instanciated through fallback provider', () => {
      try {
        new FallbackProvider([new NearRpcProvider(NEAR_TESTNET_NETWORK)])
      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.instanceof(Error)
      }
    })
  })

  describe('send', () => {
    it('should check on archival node if the error is a HandlerError', async () => {
      // Old transaction, not on main node
      // https://explorer.testnet.near.org/transactions/2KSf6ZEWk48C8YyZiKNd1NusSbMq8SAcUYKAfHhDLqX1
      const txHash = '2KSf6ZEWk48C8YyZiKNd1NusSbMq8SAcUYKAfHhDLqX1'
      const accountId = 'blockcoders-tests.testnet'
      const result = await provider.send<GetTransactionStatusRpcResponse>('tx', [txHash, accountId])
      expect(result.status.SuccessValue).to.exist
      expect(result.transaction_outcome.block_hash).to.equal('9ZMa7VuTVEokA27Et3W8URCsNfQ1D3zQ1TUhDvAjwtmo')
    })
  })

  describe('RpcError', () => {
    it('should be an instance of Error', () => {
      const payloadError = {
        name: 'METHOD_NOT_FOUND',
        code: 32601,
        message: 'Method not found',
        data: 'invalid method',
        cause: {
          name: 'UNKNOWN_ERROR',
          info: {},
        },
      }
      const error = new RpcError(payloadError)

      expect(error).to.be.an.instanceof(Error)
      expect(error.name).to.be.eq(RpcError.name)
      expect(error.type).to.be.eq(payloadError.name)
      expect(error.code).to.be.eq(payloadError.code)
      expect(error.data).to.be.eq(payloadError.data)
      expect(error.cause).to.be.eq(payloadError.cause)
    })
  })
})
