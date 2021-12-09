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
