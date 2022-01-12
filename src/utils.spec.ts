import { expect } from 'chai'
import { RpcError } from './near-rpc-provider'
import { errorIsHandlerError } from './utils'

describe('utils', () => {
  describe('errorIsHandlerError', () => {
    it('should return true when the error is UNKOWN_BLOCK', () => {
      const error = new RpcError({
        name: 'HANDLER_ERROR',
        code: 0,
        data: '',
        message: '',
        cause: {
          name: 'UNKNOWN_BLOCK',
          info: {},
        },
      })
      const result = errorIsHandlerError(error)
      expect(result).to.be.true
    })

    it('should return true when the error is a UNKNOWN_TRANSACTION', () => {
      const error = new RpcError({
        name: 'HANDLER_ERROR',
        code: 0,
        data: '',
        message: '',
        cause: {
          name: 'UNKNOWN_TRANSACTION',
          info: {},
        },
      })
      const result = errorIsHandlerError(error)
      expect(result).to.be.true
    })

    it('should return false on other errors', () => {
      const error = new RpcError({
        name: 'HANDLER_ERROR',
        code: 0,
        data: '',
        message: '',
        cause: {
          name: 'OTHER_ERROR',
          info: {},
        },
      })
      const result = errorIsHandlerError(error)
      expect(result).to.be.false
    })
  })
})
