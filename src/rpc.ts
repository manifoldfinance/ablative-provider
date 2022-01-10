/**
 * @filename rpc
 * @summary RPC endpoint information
 */

import * as ChainId from './chainid';

const RPC = {
  [ChainId.MAINNET]: 'https://api.sushirelay.com/v1',
};

export default RPC;
