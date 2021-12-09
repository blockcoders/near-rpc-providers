import { Network, Networkish } from '@ethersproject/networks'
import { logger } from './logger'

export interface NetworkWithUrl extends Network {
  url: string
}

const networks: { [name: string]: Network } = {
  near: {
    name: 'near-mainnet',
    chainId: parseInt(Buffer.from('mainnet').toString('hex'), 16),
  },
  neartestnet: {
    name: 'near-testnet',
    chainId: parseInt(Buffer.from('testnet').toString('hex'), 16),
  },
  nearbetanet: {
    name: 'near-betanet',
    chainId: parseInt(Buffer.from('betanet').toString('hex'), 16),
  },
}

export function getNetwork(_network?: Networkish): Network | null {
  if (!_network) {
    return null
  }

  if (typeof _network === 'number') {
    for (const name in networks) {
      const network = networks[name]
      if (network.chainId === _network) {
        return network
      }
    }

    return {
      name: 'unknown',
      chainId: _network,
    }
  }

  if (typeof _network === 'string') {
    const network = networks[_network]

    if (!network) {
      return null
    }

    return network
  }

  const network = networks[_network.name]

  if (!network) {
    logger.throwArgumentError('Invalid near network.', 'network', network)

    return network
  }

  return network
}
