import {TSupportedToken} from './form';
import { EChain } from 'app/common/constants/chains';

export type TBoostFarmRewards = {
    icons?: any[];
    label?: string;
    value?: number;
    stableLabel?: string;
    stableValue?: number;
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