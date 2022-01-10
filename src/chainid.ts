import RPC from './rpc';

export const MAINNET_CHAIN_ID = '0x1';

export const MAINNET_NETWORK_ID = '1';
export const MAINNET = 'mainnet';

export const OPENMEV_RELAY_ENABLED = false;

// @ts-ignore

const defaultRpcUrl = network => `https://api.sushirelay.com/v1`;

export enum OPENMEV_METAMASK_CHAIN_ID {
  MAINNET = '0x1111100000',
}

export const OPENMEV_METAMASK_SUPPORTED_NETWORKS = [
  OPENMEV_METAMASK_CHAIN_ID.MAINNET,
];

export let ChainId: string | number | any | 0x1;

export let OPENMEV_SUPPORTED_NETWORKS = [ChainId.MAINNET];

//export const OPENMEV_URI: { [chainId in ChainId]: string } = {
//  [ChainId.MAINNET]: RPC[ChainId.MAINNET],
//}
export const MAINNET_RPC_URL = defaultRpcUrl('mainnet');

export default ChainId;
