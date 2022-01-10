import BN from 'bn.js'
import { transfer } from 'near-api-js/lib/transaction'
import { KeyPair } from 'near-api-js/lib/utils'
import { parseNearAmount } from 'near-api-js/lib/utils/format'
import { base_decode } from 'near-api-js/lib/utils/serialize'
import { NearRpcProvider } from '../near-rpc-provider'

export async function getSignedTransaction(provider: NearRpcProvider) {
  const encodedKey = 'ed25519:2xrYyynoFs8RCwsfP1zoVctcMLYSiW9SwC82WJZTQdU3oV9bKjGtj7sD53temnixqKV6sZHikTBf3VxDvdkZfN3p'
  const keyPair = KeyPair.fromString(encodedKey)
  const publicKey = keyPair.getPublicKey()
  const accessKey = await provider.getAccessKey('blockcoders-tests.testnet', publicKey.toString(), 'latest')
  const blockHash = base_decode(accessKey.block_hash)

  const amount = parseNearAmount('0.00001')
  if (!amount) throw new Error('failed parsing amount')
  const transaction = provider.createTransaction({
    actions: [transfer(new BN(amount))],
    publicKey,
    nonce: accessKey.nonce + 1,
    blockHash,
    receiverId: 'blockcoders.testnet',
    signerId: 'blockcoders-tests.testnet',
  })
  const tx = await provider.signTransaction(encodedKey, transaction)

  return tx
}
