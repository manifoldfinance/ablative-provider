import { ChainId } from '@sushiswap/sdk'

const rpc = {
  [ChainId.MAINNET]: `https://api.sushirelay.com/v1` ?? 'https://api.staging.sushirelay.com/v1',
}

export default rpc