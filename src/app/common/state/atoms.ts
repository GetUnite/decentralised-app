import { atom, RecoilState } from 'recoil';
import { recoilPersist } from 'recoil-persist';
import { EChain } from '../constants/chains';

const { persistAtom } = recoilPersist();

type TMode = 'light' | 'dark';
export const mode: RecoilState<TMode> = atom({
  key: 'mode',
  default: 'light',
  effects_UNSTABLE: [persistAtom],
});

export const walletAccount = atom({
  key: 'walletAccount',
  default: null,
});

export const wantedChain = atom({
  key: 'wantedChain',
  default: null,
});

export const isSafeApp = atom({
  key: 'isSafeApp',
  default: false,
});

export const isCorrectNetwork = atom({
  key: 'isCorrectNetwork',
  default: true,
});

type TSelectStableCoin = {
  label?: string;
  value?: string;
};
export const selectedStableCoin: RecoilState<TSelectStableCoin> = atom({
  key: 'selectedStableCoin',
  default: {},
});

type TInfoByAddress = {
  locked_?: number;
  unlockAmount_?: number;
  claim_?: number;
  depositUnlockTime_?: number;
  withdrawUnlockTime_?: number;
};

type TVestingInfo = {
  availableAmount?: string;
  paidOut?: string;
  totalAmountToPay?: string;

  availableAmountInUsd?: string;
  paidOutInUsd?: string;
  totalAmountToPayInUsd?: string;
};

export type TTokenInfo = {
  isLoading?: boolean;
  allowance?: string;
  claimedAlluo?: string;
  claimedAlluoInUsd?: number;
  alluoBalanceInUsd?: number;
  alluoBalance?: string;
  apr?: number;
  totalLockedInUsd?: number;
  totalLocked?: string;
  infoByAddress?: TInfoByAddress;
  lockedLPValueOfUser?: string;
  lockedAlluoValueOfUser?: string;
  lockedAlluoValueOfUserInUsd?: number;
  unlockedAlluoValueOfUser?: string;
  unlockedAlluoValueOfUserInUsd?: number;
  withdrawLockDuration?: number;
  userVestingInfo?: TVestingInfo;
};

type TStableCoinInfoData = {
  symbol?: string;
  tokenAddress?: string;
  decimals?: number;
  balance?: string;
  allowance?: string;
};
type TStableCoinInfo = {
  isLoading: boolean;
  data?: Array<TStableCoinInfoData>;
};
export const stableCoinInfo: RecoilState<TStableCoinInfo> = atom({
  key: 'stableCoinInfo',
  default: { isLoading: false, data: [] },
});

export enum ENotificationId {
  MAIN,
  FARM,
  STAKE,
  STAKE_NETWORK,
  DEPOSIT,
  WITHDRAWAL,
  ASSET_CARD,
  LOCK,
  UNLOCK,
  BUY,
  BUY_NETWORK,
  TRANSFER,
}
type TNotification = {
  id: ENotificationId;
  type: 'error' | 'success' | 'info' | '';
  message: string;
  txHash?: string;
  chain?: EChain;
};
export const notification: RecoilState<TNotification> = atom({
  key: 'notification',
  default: { id: null, type: '', message: '', txHash: '', chain: EChain.POLYGON},
});

export type TStableCoinCodes = {
  usd?: string | number;
  eur?: string | number;
  eth?: string | number;
  btc?: string | number;
};
export type TFarmDepositCoinType = keyof TStableCoinCodes;
export const farmDepositCoinType = atom<TFarmDepositCoinType>({
  key: 'farmDepositCoinType',
  default: 'usd',
});

type TPolygonInfo = {
  isLoading?: boolean;
  totalAssetSupply?: TStableCoinCodes;
  coins?: any; //Array<TStableCoinInfoData>;
};

export const polygonInfo: RecoilState<TPolygonInfo> = atom({
  key: 'polygonInfo',
  default: { isLoading: false, totalAssetSupply: {}, coins: [{}] },
});

export const alluoPrice: RecoilState<number> = atom({
  key: 'alluoPrice',
  default: 0,
  effects_UNSTABLE: [persistAtom],
});
