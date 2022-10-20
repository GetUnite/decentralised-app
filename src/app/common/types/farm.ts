import { EChain } from 'app/common/constants/chains';
import { TSupportedToken } from './form';

export type TBoostFarmRewards = {
  icons?: any[];
  label?: string;
  value?: string;
  stableLabel?: string;
  stableValue?: number;
  stableAddress?: string;
  curvePoolAddress?: string;
  pendingValue?: number;
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
  supportedTokensAddresses?: TSupportedToken[];
  poolShare?: number;
  convexFarmIds?: TConvexFarmIds;
  lPTokenAddress?: string;
  // To store boost farm deposited amount to improve ui and functionality
  depositedAmountInLP?: number;
  valueOf1LPinUSDC?: number;
};
