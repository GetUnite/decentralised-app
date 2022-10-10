import { EChain } from 'app/common/constants/chains';
import { TSupportedToken } from './form';

export type TBoostFarmRewards = {
    icons?: any[];
    label?: string;
    value?: string;
    stableLabel?: string;
    stableValue?: string;
    stableAddress?: string;
    curvePoolAddress?: string;
  };
  
  export type TConvexFarmIds = {
    A?: number;
    B?: number;
  };
  
  export type TFarm = {
    id: number;
    type: string;
    chain: EChain;
    name: string;
    sign: string;
    icons: string[];
    supportedTokens?: TSupportedToken[];
    interest?: string;
    totalAssetSupply?: string | number;
    depositedAmount?: string;
    depositDividedAmount?: { first: any; second: any };
    isBooster?: boolean;
    rewards?: TBoostFarmRewards;
    farmAddress?: string;
    supportedTokensAddresses?: string[];
    poolShare?: number;
    convexFarmIds?: TConvexFarmIds;
  };