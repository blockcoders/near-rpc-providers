import { Networkish } from '@ethersproject/networks'
import { BaseProvider, FallbackProvider } from '@ethersproject/providers'
import { NearRpcProvider } from './near-rpc-provider'

export function getDefaultProvider(network?: Networkish): BaseProvider {
  const defaultProviders: Array<NearRpcProvider> = []

  defaultProviders.push(new NearRpcProvider(network))

  return new FallbackProvider(defaultProviders)
}
