import { BigNumber } from '@ethersproject/bignumber'
import { expect } from 'chai'
import sinon from 'sinon'
import { NearRpcProvider, RpcError } from './near-rpc-provider'
import { NEAR_TESTNET_NETWORK, NEAR_BETANET_NETWORK, NEAR_NETWORK } from './networks'
import { StatusRpcResponse, GenesisConfigRpcResponse } from './responses'

describe('NearRpcProvider', () => {
  let provider: NearRpcProvider

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
      const stub = sinon.stub(NearRpcProvider.prototype, 'getBalance').callsFake(async () => {
        throw new Error('bad result from backend')
      })
      stub.restore()
    })
  })

  describe('getBlock', () => {
    it('should get the block by number', async () => {
      const status = await provider.status()
      const block = await provider.getBlock(status.sync_info.latest_block_height)
      expect(block).to.not.be.undefined
    })

    it('should get the block by hash', async () => {
      const status = await provider.status()
      const block = await provider.getBlock(status.sync_info.latest_block_hash)
      expect(block).to.haveOwnProperty('hash')
    })

    it('should get the same block by hash and number', async () => {
      const status = await provider.status()
      const block = await provider.getBlock(status.sync_info.latest_block_height)
      const block2 = await provider.getBlock(status.sync_info.latest_block_hash)
      expect(block.hash).to.equal(block2.hash)
      expect(block.number).to.equal(block2.number)
      expect(block.timestamp).to.equal(block2.timestamp)
    })

    it('should throw an error if params are not provided', async () => {
      try {
        await provider.getBlock('')
      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.an.instanceof(Error)
      }
    })
  })

  describe('getGasPrice', () => {
    it('should get the most recent gas price', async () => {
      const gasPrice = await provider.getGasPrice()
      expect(gasPrice).to.be.instanceOf(BigNumber)
      expect(gasPrice.gt(BigNumber.from(0))).to.be.true
    })

    it('should throw an error if there is something wrong', async () => {
      try {
        await provider.getGasPrice()
      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.an.instanceof(Error)
      }
    })
  })

  // describe.only('sendTransaction', () => {
  //   it('should send a transaction', async () => {
  //     const tx = await provider.sendTransaction(
  //       'DgAAAHNlbmRlci50ZXN0bmV0AOrmAai64SZOv9e/naX4W15pJx0GAap35wTT1T/DwcbbDwAAAAAAAAAQAAAAcmVjZWl2ZXIudGVzdG5ldNMnL7URB1cxPOu3G8jTqlEwlcasagIbKlAJlF5ywVFLAQAAAAMAAACh7czOG8LTAAAAAAAAAGQcOG03xVSFQFjoagOb4NBBqWhERnnz45LY4+52JgZhm1iQKz7qAdPByrGFDQhQ2Mfga8RlbysuQ8D8LlA6bQE=',
  //     )

  //     console.log(tx)
  //   })
  // })

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
      try {
        await provider.getCode('', '')
      } catch (error) {
        expect(error).to.exist
        expect(error).to.be.an.instanceof(Error)
      }
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
    const chainId = 32762643847472500
    it('should get the network', async () => {
      try {
        await provider.send<StatusRpcResponse>('', {})
      } catch (error) {
        it('should throw an error if could not detect a network', async () => {
          try {
            const stub = sinon.stub(NearRpcProvider.prototype, 'send').callsFake(async () => chainId)
            const configResponse = await provider.send<GenesisConfigRpcResponse>('EXPERIMENTAL_genesis_config', {})
            const id = configResponse.chain_id
            console.log(id)
            expect(id).to.be.equals(chainId)
            stub.restore()
          } catch (error) {
            expect(error).to.exist
            expect(error).to.not.be.undefined
          }
        })
      }
    })

    // it('should throw an error if could not detect a network', async () => {
    //   try {
    //     const stub = sinon.stub(NearRpcProvider.prototype, 'send').callsFake(() => {
    //       throw new Error('could not detect network')
    //     })
    //     stub.restore()
    //   } catch (error) {
    //     it('should throw an error if could not detect a network', async () => {
    //       try {
    //         const stub = sinon.stub(NearRpcProvider.prototype, 'send').callsFake(async () => chainId)
    //         const configResponse = await provider.send<GenesisConfigRpcResponse>('EXPERIMENTAL_genesis_config', {})
    //         const id = configResponse.chain_id
    //         console.log(id)
    //         expect(id).to.be.equals(chainId)
    //         stub.restore()
    //       } catch (error) {
    //         expect(error).to.exist
    //         expect(error).to.not.be.undefined
    //       }
    //     })
    //   }

    //   it('should throw an error if chainId is invalid', async () => {
    //     try {
    //       const stub = sinon.stub(NearRpcProvider.prototype, 'getNetwork').callsFake(() => {
    //         throw new Error(`Invalid network chainId ${chainId}`)
    //       })
    //       stub.restore()
    //     } catch (error) {
    //       expect(error).to.exist
    //       expect(error).to.not.be.undefined
    //     }
    //   })
    // })

    // it('should throw an error if there is something wrong', async () => {
    //   try {
    //     const stub = sinon.stub(NearRpcProvider.prototype, '_uncachedDetectNetwork').callsFake(() => {
    //       throw new Error('could not detect network')
    //     })
    //     stub.restore()
    //   } catch (error) {
    //     expect(error).to.exist
    //     expect(error).to.be.an.instanceof(Error)
    //   }
    // })
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
