import { BigNumber } from '@ethersproject/bignumber'
import { expect } from 'chai'
import { NearRpcProvider, RpcError } from './near-rpc-provider'

describe('NearRpcProvider', () => {
  let provider: NearRpcProvider

  beforeEach(async () => {
    provider = new NearRpcProvider('neartestnet')

    await provider.ready
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
  })

  describe('getGasPrice', () => {
    it('should get the most recent gas price', async () => {
      const gasPrice = await provider.getGasPrice()
      expect(gasPrice).to.be.instanceOf(BigNumber)
      expect(gasPrice.gt(BigNumber.from(0))).to.be.true
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
