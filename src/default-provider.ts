import { Network, Networkish } from '@ethersproject/networks'
import { BaseProvider, FallbackProvider } from '@ethersproject/providers'

export function getDefaultProvider(network: Networkish | Promise<Network>): BaseProvider {
  const defaultProviders: Array<BaseProvider> = []

  defaultProviders.push(new BaseProvider(network))

  return new FallbackProvider(defaultProviders)
}
