import { EChain } from 'app/common/constants/chains';
import { TSupportedToken } from './global';

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
<<<<<<< HEAD
  depositedAssetValue?: string;
=======
>>>>>>> staging
  depositedAmountInUSD?: string;
  depositDividedAmount?: { first: any; second: any };
  farmAddress?: string;
  poolShare?: number;
  isBoost?: boolean;
  isNewest?: boolean;
  underlyingTokenAddress?: string;
};

export type TBoostFarm = TFarm & {
<<<<<<< HEAD
  // For booster farms
=======
  // For boost farms
>>>>>>> staging
  rewards?: TBoostFarmRewards;
  lPTokenAddress?: string;
  lowSlippageTokenLabels?: string[];
  apyFarmAddresses?: TApyFarmAddresses;
  // To store boost farm deposited amount to improve ui and functionality
  depositedAmountInLP?: number;
  valueOf1LPinUSDC?: number;
<<<<<<< HEAD
=======
  // For locked boost farms
  isLocked?: boolean;
>>>>>>> staging
}

export type TDepositStep = {
  id: number;
  label: string;
};