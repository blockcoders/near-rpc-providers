import { BigNumber } from '@ethersproject/bignumber'
import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import { NearRpcProvider, RpcError } from './near-rpc-provider'
import { NEAR_TESTNET_NETWORK, NEAR_BETANET_NETWORK, NEAR_NETWORK } from './networks'

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

    // Uncomment when we are able to query archival nodes
    // it('should send a transaction and be able to wait', async () => {
    //   const tx = await provider.sendTransaction(
    //     'DgAAAHNlbmRlci50ZXN0bmV0AOrmAai64SZOv9e/naX4W15pJx0GAap35wTT1T/DwcbbDwAAAAAAAAAQAAAAcmVjZWl2ZXIudGVzdG5ldNMnL7URB1cxPOu3G8jTqlEwlcasagIbKlAJlF5ywVFLAQAAAAMAAACh7czOG8LTAAAAAAAAAGQcOG03xVSFQFjoagOb4NBBqWhERnnz45LY4+52JgZhm1iQKz7qAdPByrGFDQhQ2Mfga8RlbysuQ8D8LlA6bQE=',
    //   )

    //   expect(tx.hash).to.equal('6zgh2u9DqHHiXzdy9ouTP7oGky2T4nugqzqt9wJZwNFm')
    //   const receipt = await tx.wait()
    //   console.log(receipt)
    // })
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
      try {
        const network = await provider._uncachedDetectNetwork()
        expect(network).to.exist
      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.an.instanceof(Error)
      }
    })

    it('should throw an error if could not detect a network', async () => {
      const stub = sinon.stub(NearRpcProvider.prototype, '_uncachedDetectNetwork').callsFake(async () => {
        throw new Error('could not detect network')
      })
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
      const block = await provider.getBlockWithChunk({
        block_id: 'DETwnQk5okT92MWe7trWUwtKm2Mjzxva7eqDhxDEyoYU',
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
      const chunk = await provider.getChunkDetails({
        chunk_id: '3dg4p2XLVgGC9UhSsSi1bEygv7e1t4Ah9ykDMbAAAL89',
      })
      expect(chunk).to.be.exist
      expect(chunk).to.not.be.undefined
    })

    it('should get chunk details by block and shard id', async () => {
      const chunk = await provider.getChunkDetails({
        block_id: '9up7oa7PXH8WpV4tLTCQumdGQSQrewY8Rzwra2i7rozu',
        shard_id: 1,
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
      expect(
        provider.getChunkDetails({
          block_id: 'GKtduZdJkkFWgs3qcfdtLripAb5yorA53RFJ8uqES6qJ',
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

  describe('getAccessKey', () => {
    it('should get the access key by block id', async () => {
      // const status = await provider.status()
      const accessKey = await provider.getAccessKey(
        'client.chainlink.testnet',
        'ed25519:H9k5eiU4xXS3M4z8HzKJSLaZdqGdGwBG49o7orNC4eZW',
        75866664,
      )
      expect(accessKey).to.not.be.undefined
    })

    it('should get the access key by finality', async () => {
      const accessKey = await provider.getAccessKey(
        'client.chainlink.testnet',
        'ed25519:H9k5eiU4xXS3M4z8HzKJSLaZdqGdGwBG49o7orNC4eZW',
        'latest',
      )
      expect(accessKey).to.be.exist
    })

    it('should throw an error if params are not provided', () => {
      expect(provider.getAccessKey('', '', '')).to.be.rejectedWith(Error)
    })
  })

  describe('RpcError', () => {
    it('should be an instance of Error', () => {
      const type = 'METHOD_NOT_FOUND'
      const code = 32601
      const data = 'invalid method'
      const error = new RpcError('Method not found', type, code, data)

      expect(error).to.be.an.instanceof(Error)
      expect(error.name).to.be.eq(RpcError.name)
      expect(error.type).to.be.eq(type)
      expect(error.code).to.be.eq(code)
      expect(error.data).to.be.eq(data)
    })
  })
})
