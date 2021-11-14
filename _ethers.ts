
//import { BlockTag, TransactionReceipt, TransactionRequest } from '@ethersproject/abstract-provider'
import { Networkish } from '@ethersproject/networks'
import { BaseProvider } from '@ethersproject/providers'
import { ConnectionInfo, fetchJson } from '@ethersproject/web'
import { BigNumber, providers, Signer } from 'ethers'

export const DEFAULT_FLASHBOTS_RELAY = 'https://api.ssuhirelay.com/v1'
export const BASE_FEE_MAX_CHANGE_DENOMINATOR = 8

export interface TransactionAccountNonce {
    hash: string
    signedTransaction: string
    account: string
    nonce: number
  }

  
export interface RelayResponseError {
    error: {
      message: string
      code: number
    }
  }

  interface BlocksApiResponseTransactionDetails {
    transaction_hash: string
    tx_index: number
    bundle_type: 'rogue' | 'flashbots'
    bundle_index: number
    block_number: number
    eoa_address: string
    to_address: string
    gas_used: number
    gas_price: string
    coinbase_transfer: string
    total_miner_reward: string
  }

interface BlocksApiResponseBlockDetails {
    block_number: number
    miner_reward: string
    miner: string
    coinbase_transfers: string
    gas_used: number
    gas_price: string
    transactions: Array<BlocksApiResponseTransactionDetails>
  }
  
  export interface BlocksApiResponse {
    latest_block_number: number
    blocks: Array<BlocksApiResponseBlockDetails>
  }
  
  
  export interface FlashbotsGasPricing {
    txCount: number
    gasUsed: number
    gasFeesPaidBySearcher: BigNumber
    priorityFeesReceivedByMiner: BigNumber
    ethSentToCoinbase: BigNumber
    effectiveGasPriceToSearcher: BigNumber
    effectivePriorityFeeToMiner: BigNumber
  }


export class FlashbotsBundleProvider extends providers.JsonRpcProvider {
    //private genericProvider: BaseProvider
    private authSigner: Signer
    private connectionInfo: ConnectionInfo
  
    constructor(genericProvider: BaseProvider, authSigner: Signer, connectionInfoOrUrl: ConnectionInfo, network: Networkish) {
      super(connectionInfoOrUrl, network)
     // this.genericProvider = genericProvider
      this.authSigner = authSigner
      this.connectionInfo = connectionInfoOrUrl
    }
  
    static async throttleCallback(): Promise<boolean> {
      console.warn('Rate limited')
      return false
    }



  static async create(
    genericProvider: BaseProvider,
    authSigner: Signer,
    connectionInfoOrUrl?: ConnectionInfo | string,
    network?: Networkish
  ): Promise<FlashbotsBundleProvider> {
    const connectionInfo: ConnectionInfo =
      typeof connectionInfoOrUrl === 'string' || typeof connectionInfoOrUrl === 'undefined'
        ? {
            url: connectionInfoOrUrl || DEFAULT_FLASHBOTS_RELAY
          }
        : {
            ...connectionInfoOrUrl
          }
    if (connectionInfo.headers === undefined) connectionInfo.headers = {}
    connectionInfo.throttleCallback = FlashbotsBundleProvider.throttleCallback
    const networkish: Networkish = {
      chainId: 0,
      name: ''
    }
    if (typeof network === 'string') {
      networkish.name = network
    } else if (typeof network === 'number') {
      networkish.chainId = network
    } else if (typeof network === 'object') {
      networkish.name = network.name
      networkish.chainId = network.chainId
    }

    if (networkish.chainId === 0) {
      networkish.chainId = (await genericProvider.getNetwork()).chainId
    }

    return new FlashbotsBundleProvider(genericProvider, authSigner, connectionInfo, networkish)
  }


  static getBaseFeeInNextBlock(currentBaseFeePerGas: BigNumber, currentGasUsed: BigNumber, currentGasLimit: BigNumber): BigNumber {
    const currentGasTarget = currentGasLimit.div(2)

    if (currentGasUsed.eq(currentGasTarget)) {
      return currentBaseFeePerGas
    } else if (currentGasUsed.gt(currentGasTarget)) {
      const gasUsedDelta = currentGasUsed.sub(currentGasTarget)
      const baseFeePerGasDelta = currentBaseFeePerGas.mul(gasUsedDelta).div(currentGasTarget).div(BASE_FEE_MAX_CHANGE_DENOMINATOR)

      return currentBaseFeePerGas.add(baseFeePerGasDelta)
    } else {
      const gasUsedDelta = currentGasTarget.sub(currentGasUsed)
      const baseFeePerGasDelta = currentBaseFeePerGas.mul(gasUsedDelta).div(currentGasTarget).div(BASE_FEE_MAX_CHANGE_DENOMINATOR)

      return currentBaseFeePerGas.sub(baseFeePerGasDelta)
    }
  }

  public async fetchBlocksApi(blockNumber: number): Promise<BlocksApiResponse> {
    return fetchJson(`https://blocks.flashbots.net/v1/blocks?block_number=${blockNumber}`)
  }
}