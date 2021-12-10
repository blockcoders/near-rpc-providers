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
      const block = await provider.getBlock(74419929)
      expect(block).to.not.be.undefined
    })

    it('should get the block by hash', async () => {
      const block = await provider.getBlock('DckezGRnns3cYBwj1A9KPajpu3pnabUGE3bedJEgJnSU')
      expect(block).to.haveOwnProperty('hash')
    })

    it('should get the same block by hash and number', async () => {
      const block = await provider.getBlock(74419929)
      const block2 = await provider.getBlock('DckezGRnns3cYBwj1A9KPajpu3pnabUGE3bedJEgJnSU')
      expect(block.hash).to.equal(block2.hash)
      expect(block.number).to.equal(block2.number)
      expect(block.timestamp).to.equal(block2.timestamp)
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
