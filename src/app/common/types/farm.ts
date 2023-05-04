import { EChain } from 'app/common/constants/chains';
import { TSupportedToken } from './global';

export type TBoostFarmRewards = {
  icons?: any[];
  label?: string;
  value?: string;
  stableLabel?: string;
  stableValue?: string;
  address?: string; // locked boost need to know the address of the rewards aswel
  stableAddress?: string;
  pendingValue?: number;
};

export type TApyFarmAddresses = {
  baseApyAddress?: string;
  boostApyAddress?: string;
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
  depositedAmountInUSD?: string;
  depositDividedAmount?: { first: any; second: any };
  farmAddress?: string;
  poolShare?: number;
  isBoost?: boolean;
  isOptimised?: boolean;
  isNewest?: boolean;
  underlyingTokenAddress?: string;
  // For boost farms but needed here for main page
  depositedAmountInLP?: number;
  rewards?: TBoostFarmRewards;
  isLocked?: boolean;
};

export type TBoostFarm = TFarm & {
  lPTokenAddress?: string;
  lowSlippageTokenLabels?: string[];
  apyFarmAddresses?: TApyFarmAddresses;
  valueOf1LPinUSDC?: number;
  // For locked boost farms
  unlockingBalance?: string;
  unlockedBalance?: string;
  isUnlocking?: boolean;
  withdrawToken?: TSupportedToken;
  // forced apy when it cant be calculated
  forcedInterest?: string;
};

export type TOptimisedFarm = TFarm & {
  apyAddress?: string;
  lPTokenAddress?: string;
  valueOf1LPinUSDC?: number;
  // For locked boost farms
  unlockingBalance?: string;
  unlockedBalance?: string;
  isUnlocking?: boolean;
  withdrawToken?: TSupportedToken;
  // forced apy when it cant be calculated
  forcedInterest?: string;
};
