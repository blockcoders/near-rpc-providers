import { Network, Networkish } from '@ethersproject/networks'
import { logger } from './logger'

export interface NetworkWithUrl extends Network {
  url: string
}

export const NEAR_NETWORK: Network = {
  name: 'near',
  chainId: parseInt(Buffer.from('mainnet').toString('hex'), 16),
}

export const NEAR_TESTNET_NETWORK: Network = {
  name: 'neartestnet',
  chainId: parseInt(Buffer.from('testnet').toString('hex'), 16),
}

export const NEAR_BETANET_NETWORK: Network = {
  name: 'nearbetanet',
  chainId: parseInt(Buffer.from('betanet').toString('hex'), 16),
}

const networks: { [name: string]: Network } = {
  near: NEAR_NETWORK,
  neartestnet: NEAR_TESTNET_NETWORK,
  nearbetanet: NEAR_BETANET_NETWORK,
}

export function getNetwork(_network?: Networkish): Network | undefined {
  if (!_network) {
    return undefined
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
      return undefined
    }

    return network
  }

  const network = networks[_network.name]

  if (!network) {
    logger.throwArgumentError('Invalid near network.', 'network', network)
  }

  return network
}
