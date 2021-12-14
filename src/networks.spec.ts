import { expect } from 'chai'
import { NEAR_TESTNET_NETWORK, getNetwork } from './networks'

describe('Network', () => {
  describe('getNetwork', () => {
    it('should returns a Network by chainId', () => {
      const network = getNetwork(NEAR_TESTNET_NETWORK.chainId)

      expect(network).to.not.be.undefined
      expect(network?.chainId).to.equal(NEAR_TESTNET_NETWORK.chainId)
      expect(network?.name).to.equal(NEAR_TESTNET_NETWORK.name)
    })

    it('should returns undefined if the Networkish param is undefined', () => {
      expect(getNetwork(undefined)).to.be.undefined
    })

    it('should returns an unknown Network type if the chainId is invalid', () => {
      const network = getNetwork(666)

      expect(network).to.not.be.undefined
      expect(network?.chainId).to.equal(666)
      expect(network?.name).to.equal('unknown')
    })

    it('should returns a Network by network name', () => {
      const network = getNetwork(NEAR_TESTNET_NETWORK.name)

      expect(network).to.not.be.undefined
      expect(network?.chainId).to.equal(NEAR_TESTNET_NETWORK.chainId)
      expect(network?.name).to.equal(NEAR_TESTNET_NETWORK.name)
    })

    it('should returns undefined if the network name is invalid', () => {
      expect(getNetwork('invalid-name')).to.be.undefined
    })

    it('should returns a Network by Network object', () => {
      const network = getNetwork(NEAR_TESTNET_NETWORK)

      expect(network).to.not.be.undefined
      expect(network?.chainId).to.equal(NEAR_TESTNET_NETWORK.chainId)
      expect(network?.name).to.equal(NEAR_TESTNET_NETWORK.name)
    })

    it('should throw an error if the Network object is invalid', () => {
      expect(() => getNetwork({ chainId: 666, name: 'invalid-name' })).to.throw(Error)
    })
  })
})
