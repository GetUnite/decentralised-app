import { EEthereumAddresses } from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import {
  claimBoostFarmLPRewards,
  claimBoostFarmNonLPRewards,
  claimLockedBoostFarmRewards,
  depositIntoBoostFarm,
  getBoostFarmInterest,
  getBoostFarmPendingRewards,
  getBoostFarmRewards,
  getLastHarvestDateTimestamp,
  getLockedBoostWithdrawalsInfo,
  getMaximumLPValueAsToken,
  unlockFromLockedBoostFarm,
  unlockUserFunds,
  withdrawFromBoostFarm,
  withdrawFromLockedBoostFarm,
} from 'app/common/functions/boostFarm';
import { heapTrack } from 'app/common/functions/heapClient';
import { depositDivided } from 'app/common/functions/utils';
import {
  approve,
  getBalanceOf,
  getTokenValueUsingPriceFeedRouter,
  getTotalAssets,
} from 'app/common/functions/web3Client';
import {
  isCorrectNetwork,
  isSafeApp,
  walletAccount,
  wantedChain,
} from 'app/common/state/atoms';
import { TBoostFarm } from 'app/common/types/farm';
import { TPossibleStep, TSupportedToken } from 'app/common/types/global';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useProcessingSteps } from '../useProcessingSteps';
import { possibleDepositSteps } from './useBoostFarmDeposit';
import { possibleWithdrawSteps } from './useBoostFarmWithdrawal';
import { possibleLockedWithdrawSteps } from './useLockedBoostFarmWithdrawal';
import { EFiatId } from 'app/common/constants/utils';

export const boostFarmOptions: Array<TBoostFarm> = [
  // {
  //   id: 0,
  //   farmAddress: EEthereumAddresses.FRAXUSDCVAULT,
  //   type: 'boost',
  //   chain: EChain.ETHEREUM,
  //   name: 'FRAX/USDC',
  //   sign: '$',
  //   icons: [
  //     'FRAX',
  //     'USDC',
  //     'CRV',
  //     'CVX',
  //     'DAI',
  //     'agEUR',
  //     'EURS',
  //     'EURT',
  //     'WETH',
  //     'WBTC',
  //   ],
  //   isBoost: true,
  //   rewards: {
  //     label: 'CVX-ETH',
  //     icons: ['CVX', 'ETH'],
  //     stableLabel: 'USDC',
  //     stableAddress: EEthereumAddresses.USDC,
  //   },
  //   lPTokenAddress: EEthereumAddresses.FRAXUSDC,
  //   supportedTokens: [
  //     {
  //       label: 'agEUR',
  //       address: EEthereumAddresses.AGEUR,
  //       decimals: 18,
  //       sign: '€',
  //     },
  //     {
  //       label: 'CRV',
  //       address: EEthereumAddresses.CRV,
  //       decimals: 18,
  //       sign: '',
  //     },
  //     {
  //       label: 'CVX',
  //       address: EEthereumAddresses.CVX,
  //       decimals: 18,
  //       sign: '',
  //     },
  //     {
  //       label: 'DAI',
  //       address: EEthereumAddresses.DAI,
  //       decimals: 18,
  //       sign: '$',
  //     },
  //     {
  //       label: 'EURS',
  //       address: EEthereumAddresses.EURS,
  //       decimals: 2,
  //       sign: '€',
  //     },
  //     {
  //       label: 'EURT',
  //       address: EEthereumAddresses.EURT,
  //       decimals: 6,
  //       sign: '€',
  //     },
  //     {
  //       label: 'FRAX',
  //       address: EEthereumAddresses.FRAX,
  //       decimals: 18,
  //       sign: '$',
  //     },
  //     {
  //       label: 'USDC',
  //       address: EEthereumAddresses.USDC,
  //       decimals: 6,
  //       sign: '$',
  //     },
  //     {
  //       label: 'WETH',
  //       address: EEthereumAddresses.WETH,
  //       decimals: 18,
  //       sign: 'Ξ',
  //     },
  //     {
  //       label: 'WBTC',
  //       address: EEthereumAddresses.WBTC,
  //       decimals: 8,
  //       sign: '₿',
  //     },
  //   ],
  //   lowSlippageTokenLabels: ['FRAX', 'USDC'],
  //   apyFarmAddresses: {
  //     baseApyAddress: 'bd072651-d99c-4154-aeae-51f12109c054',
  //     boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
  //   },
  // },
  // {
  //   id: 1,
  //   farmAddress: EEthereumAddresses.CVXETHVAULT,
  //   type: 'boost',
  //   chain: EChain.ETHEREUM,
  //   name: 'CVX/ETH',
  //   sign: '$',
  //   icons: [
  //     'CVX',
  //     'WETH',
  //     'EURS',
  //     'agEUR',
  //     'CRV',
  //     'EURT',
  //     'FRAX',
  //     'USDC',
  //     'WBTC',
  //     'DAI',
  //   ],
  //   isBoost: true,
  //   rewards: {
  //     label: 'CVX-ETH',
  //     icons: ['CVX', 'ETH'],
  //     stableLabel: 'USDC',
  //     stableAddress: EEthereumAddresses.USDC,
  //   },
  //   lPTokenAddress: EEthereumAddresses.CVXETH,
  //   supportedTokens: [
  //     {
  //       label: 'agEUR',
  //       address: EEthereumAddresses.AGEUR,
  //       decimals: 18,
  //       sign: '€',
  //     },
  //     {
  //       label: 'CRV',
  //       address: EEthereumAddresses.CRV,
  //       decimals: 18,
  //       sign: '',
  //     },
  //     {
  //       label: 'CVX',
  //       address: EEthereumAddresses.CVX,
  //       decimals: 18,
  //       sign: '',
  //     },
  //     {
  //       label: 'DAI',
  //       address: EEthereumAddresses.DAI,
  //       decimals: 18,
  //       sign: '$',
  //     },
  //     {
  //       label: 'EURS',
  //       address: EEthereumAddresses.EURS,
  //       decimals: 2,
  //       sign: '€',
  //     },
  //     {
  //       label: 'EURT',
  //       address: EEthereumAddresses.EURT,
  //       decimals: 6,
  //       sign: '€',
  //     },
  //     {
  //       label: 'FRAX',
  //       address: EEthereumAddresses.FRAX,
  //       decimals: 18,
  //       sign: '$',
  //     },
  //     {
  //       label: 'USDC',
  //       address: EEthereumAddresses.USDC,
  //       decimals: 6,
  //       sign: '$',
  //     },
  //     {
  //       label: 'WETH',
  //       address: EEthereumAddresses.WETH,
  //       decimals: 18,
  //       sign: 'Ξ',
  //     },
  //     {
  //       label: 'WBTC',
  //       address: EEthereumAddresses.WBTC,
  //       decimals: 8,
  //       sign: '₿',
  //     },
  //   ],
  //   lowSlippageTokenLabels: ['CVX', 'WETH'],
  //   apyFarmAddresses: {
  //     baseApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
  //     boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
  //   },
  // },
  // {
  //   id: 2,
  //   farmAddress: EEthereumAddresses.STETHETHVAULT,
  //   type: 'boost',
  //   chain: EChain.ETHEREUM,
  //   name: 'stETH/ETH',
  //   sign: '$',
  //   icons: [
  //     'WETH',
  //     'USDC',
  //     'DAI',
  //     'EURS',
  //     'EURT',
  //     'FRAX',
  //     'WBTC',
  //     'agEUR',
  //     'CRV',
  //     'CVX',
  //   ],
  //   isBoost: true,
  //   rewards: {
  //     label: 'CVX-ETH',
  //     icons: ['CVX', 'ETH'],
  //     stableLabel: 'USDC',
  //     stableAddress: EEthereumAddresses.USDC,
  //   },
  //   lPTokenAddress: EEthereumAddresses.STETHETH,
  //   supportedTokens: [
  //     {
  //       label: 'agEUR',
  //       address: EEthereumAddresses.AGEUR,
  //       decimals: 18,
  //       sign: '€',
  //     },
  //     {
  //       label: 'CRV',
  //       address: EEthereumAddresses.CRV,
  //       decimals: 18,
  //       sign: '',
  //     },
  //     {
  //       label: 'CVX',
  //       address: EEthereumAddresses.CVX,
  //       decimals: 18,
  //       sign: '',
  //     },
  //     {
  //       label: 'DAI',
  //       address: EEthereumAddresses.DAI,
  //       decimals: 18,
  //       sign: '$',
  //     },
  //     {
  //       label: 'EURS',
  //       address: EEthereumAddresses.EURS,
  //       decimals: 2,
  //       sign: '€',
  //     },
  //     {
  //       label: 'EURT',
  //       address: EEthereumAddresses.EURT,
  //       decimals: 6,
  //       sign: '€',
  //     },
  //     {
  //       label: 'FRAX',
  //       address: EEthereumAddresses.FRAX,
  //       decimals: 18,
  //       sign: '$',
  //     },
  //     {
  //       label: 'USDC',
  //       address: EEthereumAddresses.USDC,
  //       decimals: 6,
  //       sign: '$',
  //     },
  //     {
  //       label: 'WETH',
  //       address: EEthereumAddresses.WETH,
  //       decimals: 18,
  //       sign: 'Ξ',
  //     },
  //     {
  //       label: 'WBTC',
  //       address: EEthereumAddresses.WBTC,
  //       decimals: 8,
  //       sign: '₿',
  //     },
  //   ],
  //   lowSlippageTokenLabels: ['wETH'],
  //   apyFarmAddresses: {
  //     baseApyAddress: '5ce23e7e-3800-4c9c-ad30-6db3db0515a1',
  //     boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
  //   },
  // },
  // {
  //   id: 3,
  //   farmAddress: EEthereumAddresses.CRVYCRVVAULT,
  //   type: 'boost',
  //   chain: EChain.ETHEREUM,
  //   name: 'CRV/yCRV',
  //   sign: '$',
  //   icons: [
  //     'WETH',
  //     'USDC',
  //     'DAI',
  //     'agEUR',
  //     'EURS',
  //     'EURT',
  //     'FRAX',
  //     'WBTC',
  //     'CRV',
  //     'CVX',
  //   ],
  //   isBoost: true,
  //   rewards: {
  //     label: 'CVX-ETH',
  //     icons: ['CVX', 'ETH'],
  //     stableLabel: 'USDC',
  //     stableAddress: EEthereumAddresses.USDC,
  //   },
  //   lPTokenAddress: EEthereumAddresses.CRVYCRV,
  //   supportedTokens: [
  //     {
  //       label: 'agEUR',
  //       address: EEthereumAddresses.AGEUR,
  //       decimals: 18,
  //       sign: '€',
  //     },
  //     {
  //       label: 'CRV',
  //       address: EEthereumAddresses.CRV,
  //       decimals: 18,
  //       sign: '',
  //     },
  //     {
  //       label: 'CVX',
  //       address: EEthereumAddresses.CVX,
  //       decimals: 18,
  //       sign: '',
  //     },
  //     {
  //       label: 'DAI',
  //       address: EEthereumAddresses.DAI,
  //       decimals: 18,
  //       sign: '$',
  //     },
  //     {
  //       label: 'EURS',
  //       address: EEthereumAddresses.EURS,
  //       decimals: 2,
  //       sign: '€',
  //     },
  //     {
  //       label: 'EURT',
  //       address: EEthereumAddresses.EURT,
  //       decimals: 6,
  //       sign: '€',
  //     },
  //     {
  //       label: 'FRAX',
  //       address: EEthereumAddresses.FRAX,
  //       decimals: 18,
  //       sign: '$',
  //     },
  //     {
  //       label: 'USDC',
  //       address: EEthereumAddresses.USDC,
  //       decimals: 6,
  //       sign: '$',
  //     },
  //     {
  //       label: 'WETH',
  //       address: EEthereumAddresses.WETH,
  //       decimals: 18,
  //       sign: 'Ξ',
  //     },
  //     {
  //       label: 'WBTC',
  //       address: EEthereumAddresses.WBTC,
  //       decimals: 8,
  //       sign: '₿',
  //     },
  //   ],
  //   lowSlippageTokenLabels: ['CRV'],
  //   apyFarmAddresses: {
  //     baseApyAddress: '1fbe7e03-75f3-4d65-8423-2cc023f786d7',
  //     boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
  //   },
  //   isNewest: true,
  // },
  // {
  //   id: 4,
  //   farmAddress: EEthereumAddresses.DOLAFRAXBPVAULT,
  //   type: 'boost',
  //   chain: EChain.ETHEREUM,
  //   name: 'DOLA/FRAXBP',
  //   sign: '$',
  //   icons: [
  //     'WETH',
  //     'USDC',
  //     'DAI',
  //     'EURS',
  //     'EURT',
  //     'FRAX',
  //     'WBTC',
  //     'agEUR',
  //     'CRV',
  //     'CVX',
  //   ],
  //   isBoost: true,
  //   rewards: {
  //     label: 'CVX-ETH',
  //     icons: ['CVX', 'ETH'],
  //     stableLabel: 'USDC',
  //     stableAddress: EEthereumAddresses.USDC,
  //   },
  //   lPTokenAddress: EEthereumAddresses.DOLAFRAXBP,
  //   supportedTokens: [
  //     {
  //       label: 'agEUR',
  //       address: EEthereumAddresses.AGEUR,
  //       decimals: 18,
  //       sign: '€',
  //     },
  //     {
  //       label: 'CRV',
  //       address: EEthereumAddresses.CRV,
  //       decimals: 18,
  //       sign: '',
  //     },
  //     {
  //       label: 'CVX',
  //       address: EEthereumAddresses.CVX,
  //       decimals: 18,
  //       sign: '',
  //     },
  //     {
  //       label: 'DAI',
  //       address: EEthereumAddresses.DAI,
  //       decimals: 18,
  //       sign: '$',
  //     },
  //     {
  //       label: 'EURS',
  //       address: EEthereumAddresses.EURS,
  //       decimals: 2,
  //       sign: '€',
  //     },
  //     {
  //       label: 'EURT',
  //       address: EEthereumAddresses.EURT,
  //       decimals: 6,
  //       sign: '€',
  //     },
  //     {
  //       label: 'FRAX',
  //       address: EEthereumAddresses.FRAX,
  //       decimals: 18,
  //       sign: '$',
  //     },
  //     {
  //       label: 'USDC',
  //       address: EEthereumAddresses.USDC,
  //       decimals: 6,
  //       sign: '$',
  //     },
  //     {
  //       label: 'WETH',
  //       address: EEthereumAddresses.WETH,
  //       decimals: 18,
  //       sign: 'Ξ',
  //     },
  //     {
  //       label: 'WBTC',
  //       address: EEthereumAddresses.WBTC,
  //       decimals: 8,
  //       sign: '₿',
  //     },
  //   ],
  //   lowSlippageTokenLabels: ['FRAX', 'USDC'],
  //   apyFarmAddresses: {
  //     baseApyAddress: 'd05cb04d-f1e5-451d-95a2-6a3a9da001ad',
  //     boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
  //   },
  //   isNewest: true,
  // },
  // {
  //   id: 5,
  //   farmAddress: EEthereumAddresses.FRXETHVAULT,
  //   type: 'boost',
  //   isLocked: true,
  //   chain: EChain.ETHEREUM,
  //   name: 'FrxETH/ETH',
  //   sign: '$',
  //   icons: [
  //     'FRAX',
  //     'USDC',
  //     'agEUR',
  //     'CRV',
  //     'CVX',
  //     'DAI',
  //     'EURS',
  //     'EURT',
  //     'WETH',
  //     'WBTC',
  //   ],
  //   isBoost: true,
  //   rewards: {
  //     label: 'CVX-ETH',
  //     icons: ['CVX', 'ETH'],
  //     stableLabel: 'USDC',
  //     address: EEthereumAddresses.CVXETH,
  //     stableAddress: EEthereumAddresses.USDC,
  //   },
  //   lPTokenAddress: EEthereumAddresses.FRXETH,
  //   supportedTokens: [
  //     {
  //       label: 'agEUR',
  //       address: EEthereumAddresses.AGEUR,
  //       decimals: 18,
  //       sign: '€',
  //     },
  //     {
  //       label: 'CRV',
  //       address: EEthereumAddresses.CRV,
  //       decimals: 18,
  //       sign: '',
  //     },
  //     {
  //       label: 'CVX',
  //       address: EEthereumAddresses.CVX,
  //       decimals: 18,
  //       sign: '',
  //     },
  //     {
  //       label: 'DAI',
  //       address: EEthereumAddresses.DAI,
  //       decimals: 18,
  //       sign: '$',
  //     },
  //     {
  //       label: 'EURS',
  //       address: EEthereumAddresses.EURS,
  //       decimals: 2,
  //       sign: '€',
  //     },
  //     {
  //       label: 'EURT',
  //       address: EEthereumAddresses.EURT,
  //       decimals: 6,
  //       sign: '€',
  //     },
  //     {
  //       label: 'FRAX',
  //       address: EEthereumAddresses.FRAX,
  //       decimals: 18,
  //       sign: '$',
  //     },
  //     {
  //       label: 'USDC',
  //       address: EEthereumAddresses.USDC,
  //       decimals: 6,
  //       sign: '$',
  //     },
  //     {
  //       label: 'WETH',
  //       address: EEthereumAddresses.WETH,
  //       decimals: 18,
  //       sign: 'Ξ',
  //     },
  //     {
  //       label: 'WBTC',
  //       address: EEthereumAddresses.WBTC,
  //       decimals: 8,
  //       sign: '₿',
  //     },
  //   ],
  //   lowSlippageTokenLabels: ['FRAX', 'ETH'],
  //   apyFarmAddresses: {
  //     baseApyAddress: 'bd072651-d99c-4154-aeae-51f12109c054',
  //     boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
  //   },
  //   forcedInterest: '9.50',
  //   withdrawToken: {
  //     label: 'FrxETH/ETH',
  //     address: EEthereumAddresses.FRXETH,
  //     decimals: 18,
  //     sign: '',
  //   },
  //   isNewest: true,
  // },
  // {
  //   id: 6,
  //   farmAddress: EEthereumAddresses.CVXFRAXBPVAULT,
  //   type: 'boost',
  //   isLocked: true,
  //   chain: EChain.ETHEREUM,
  //   name: 'CVX/FRAXBP',
  //   sign: '$',
  //   icons: [
  //     'FRAX',
  //     'USDC',
  //     'agEUR',
  //     'CRV',
  //     'CVX',
  //     'DAI',
  //     'EURS',
  //     'EURT',
  //     'WETH',
  //     'WBTC',
  //   ],
  //   isBoost: true,
  //   rewards: {
  //     label: 'CVX-ETH',
  //     icons: ['CVX', 'ETH'],
  //     stableLabel: 'USDC',
  //     address: EEthereumAddresses.CVXETH,
  //     stableAddress: EEthereumAddresses.USDC,
  //   },
  //   lPTokenAddress: EEthereumAddresses.CVXFRAXBP,
  //   supportedTokens: [
  //     {
  //       label: 'agEUR',
  //       address: EEthereumAddresses.AGEUR,
  //       decimals: 18,
  //       sign: '€',
  //     },
  //     {
  //       label: 'CRV',
  //       address: EEthereumAddresses.CRV,
  //       decimals: 18,
  //       sign: '',
  //     },
  //     {
  //       label: 'CVX',
  //       address: EEthereumAddresses.CVX,
  //       decimals: 18,
  //       sign: '',
  //     },
  //     {
  //       label: 'DAI',
  //       address: EEthereumAddresses.DAI,
  //       decimals: 18,
  //       sign: '$',
  //     },
  //     {
  //       label: 'EURS',
  //       address: EEthereumAddresses.EURS,
  //       decimals: 2,
  //       sign: '€',
  //     },
  //     {
  //       label: 'EURT',
  //       address: EEthereumAddresses.EURT,
  //       decimals: 6,
  //       sign: '€',
  //     },
  //     {
  //       label: 'FRAX',
  //       address: EEthereumAddresses.FRAX,
  //       decimals: 18,
  //       sign: '$',
  //     },
  //     {
  //       label: 'USDC',
  //       address: EEthereumAddresses.USDC,
  //       decimals: 6,
  //       sign: '$',
  //     },
  //     {
  //       label: 'WETH',
  //       address: EEthereumAddresses.WETH,
  //       decimals: 18,
  //       sign: 'Ξ',
  //     },
  //     {
  //       label: 'WBTC',
  //       address: EEthereumAddresses.WBTC,
  //       decimals: 8,
  //       sign: '₿',
  //     },
  //   ],
  //   lowSlippageTokenLabels: ['FRAX', 'CVX'],
  //   apyFarmAddresses: {
  //     baseApyAddress: 'bd072651-d99c-4154-aeae-51f12109c054',
  //     boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
  //   },
  //   forcedInterest: '9.50',
  //   withdrawToken: {
  //     label: 'CVX/FRAXBP',
  //     address: EEthereumAddresses.CVXFRAXBP,
  //     decimals: 18,
  //     sign: '',
  //   },
  //   isNewest: true,
  // },
];

const defaultRewards = {
  label: 'CVX-ETH',
  stableLabel: 'USDC',
  stableAddress: EEthereumAddresses.USDC,
};

const possibleBoostFarmSteps = [
  {
    id: 6,
    label: '',
    errorLabel: 'Failed to claim rewards',
    successLabel: '',
  },
  {
    id: 7,
    label: '',
    errorLabel: 'Failed to claim rewards',
    successLabel: '',
  },
  ...possibleDepositSteps,
  ...possibleWithdrawSteps,
  ...possibleLockedWithdrawSteps,
];

export const useBoostFarm = ({ id }) => {
  // react
  const navigate = useNavigate();
  const [cookies] = useCookies([
    'has_seen_boost_farms',
    'has_seen_locked_boost_farms',
  ]);

  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [isCorrectNetworkAtom] = useRecoilState(isCorrectNetwork);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);
  const [isSafeAppAtom] = useRecoilState(isSafeApp);

  // tabs control
  const [selectedTab, setSelectedTab] = useState(0);

  // selected farm control
  const selectedFarm = useRef<TBoostFarm>(
    boostFarmOptions.find(availableFarm => availableFarm.id == id),
  );
  const selectedFarmInfo = useRef<TBoostFarm>();
  const [selectedSupportedToken, setSelectedSupportedToken] =
    useState<TSupportedToken>();
  const interest = useRef<any>();

  // selected supportedTokenInfo
  const selectedSupportedTokenInfo = useRef<any>({
    boostDepositedAmount: 0,
    balance: 0,
    allowance: 0,
    unlocked: 0,
  });

  // boost farm rewards control
  const rewardsInfo = useRef<any>(defaultRewards);
  const pendingRewardsInfo = useRef<any>(false);
  const [seeRewardsAsStable, setSeeRewardsAsStable] = useState<boolean>(false);
  const [losablePendingRewards, setLosablePendingRewards] = useState<number>();

  // deposit and withdraw values needs to be here to show the confirmation screen
  const [depositValue, setDepositValue] = useState<string>('');
  const [withdrawValue, setWithdrawValue] = useState<string>('');

  // steps
  const {
    isProcessing,
    setIsProcessing,
    currentStep,
    steps,
    stepWasSuccessful,
    stepError,
    successTransactionHash,
    resetProcessing,
    isHandlingStep,
    setIsHandlingStep,
  } = useProcessingSteps();
  const processingTitle = useRef<string>();

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingInterest, setIsLoadingInterest] = useState<boolean>(true);
  const [isLoadingRewards, setIsLoadingRewards] = useState<boolean>(false);
  const [isLoadingPendingRewards, setIsLoadingPendingRewards] =
    useState<boolean>(false);

  // biconomy
  const [useBiconomy, setUseBiconomy] = useState(
    isSafeAppAtom || EChain.POLYGON != selectedFarmInfo.current?.chain
      ? false
      : true,
  );

  // information/confirmation control
  const showBoostFarmPresentation =
    !cookies.has_seen_boost_farms && !selectedFarm.current?.isLocked;
  const showLockedBoostFarmPresentation =
    !cookies.has_seen_locked_boost_farms && selectedFarm.current?.isLocked;
  // normal withdraw/unlock
  const [showBoostWithdrawalConfirmation, setShowBoostWithdrawalConfirmation] =
    useState<boolean>(false);
  // when depositing
  const [showLockedBoostLockConfirmation, setShowLockedBoostLockConfirmation] =
    useState<boolean>(false);
  // withdraw unlocked on locked boost farms
  const [
    showLockedBoostWithdrawalConfirmation,
    setShowLockedBoostWithdrawalConfirmation,
  ] = useState<boolean>(false);
  const showHeading =
    !showBoostFarmPresentation &&
    !showLockedBoostFarmPresentation &&
    !isProcessing;
  const showTabs =
    !isProcessing &&
    !showBoostFarmPresentation &&
    !showLockedBoostFarmPresentation &&
    !showBoostWithdrawalConfirmation &&
    !showLockedBoostLockConfirmation;

  // harvest dates for the farms
  const previousHarvestDate = useRef<any>();
  const nextHarvestDate = useRef<any>();

  // when entering boost farms set wanted chain to ethereum (for now only ethereum has boost farms)
  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.ETHEREUM);
      updateInterest();
    }
  }, [walletAccountAtom]);

  useEffect(() => {
    if (!selectedFarm) {
      navigate('/');
      return;
    }
    const loadFarmInfo = async () => {
      try {
        var startFirstTimer = performance.now();

        const lastHarvestDateTimestamp = await getLastHarvestDateTimestamp(
          selectedFarm.current?.farmAddress,
          selectedFarm.current?.chain,
        );
        const lastHarvestDate = new Date(0);
        lastHarvestDate.setSeconds(lastHarvestDateTimestamp);

        previousHarvestDate.current = moment(lastHarvestDate);
        // if the difference between today and the last harvest date is less then the 7 days between harvests, set the next date
        nextHarvestDate.current =
          moment().diff(previousHarvestDate.current, 'days') <= 7
            ? moment(lastHarvestDate).add(9792, 'minutes') // add the equivalent to 6.8 days in min
            : moment(null);

        var endFirstTimer = performance.now();
        console.log(
          `loadFarmInfo() before farmInfo() took ${endFirstTimer - startFirstTimer
          } milliseconds`,
        );

        var startSecondTimer = performance.now();
        selectedFarmInfo.current = {
          ...selectedFarm.current,
          ...(await getUpdatedFarmInfo(selectedFarm.current)),
        };
        var endSecondTimer = performance.now();
        console.log(
          `getUpdatedFarmInfo() took ${endSecondTimer - startSecondTimer
          } milliseconds`,
        );

        setSelectedSupportedToken(selectedFarmInfo.current.supportedTokens[0]);

        heapTrack('farm', {
          pool: 'boost',
          currency: selectedFarm.current.name,
        });

        setIsLoading(false);
        await updateRewardsInfo();
      } catch (error) {
        console.log(error);
      }
    };
    if (walletAccountAtom) {
      loadFarmInfo();
    }
  }, [walletAccountAtom, isCorrectNetworkAtom]);

  const updateInterest = async () => {
    setIsLoadingInterest(true);
    try {
      interest.current = selectedFarm.current?.forcedInterest
        ? selectedFarm.current?.forcedInterest
        : await getBoostFarmInterest(
          selectedFarm.current?.farmAddress,
          selectedFarm.current?.apyFarmAddresses,
          selectedFarm.current?.chain,
        );
    } catch (error) {
      //We can't get apy from llama, navigate to main page for now
      navigate('/');
    }
    setIsLoadingInterest(false);
  };

  // used to update the farm info after withdraw or deposit
  const updateFarmInfo = async () => {
    setIsLoading(true);
    try {
      const farm = await getUpdatedFarmInfo(selectedFarm.current);
      selectedFarmInfo.current = { ...selectedFarmInfo, ...farm };
      setSelectedSupportedToken(
        farm.supportedTokens?.find(
          st => st?.address == selectedSupportedToken?.address,
        ),
      );
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const getUpdatedFarmInfo = async farm => {
    try {
      let farmInfo;

      const valueOf1LPinUSDC = await getTokenValueUsingPriceFeedRouter(
        farm.lPTokenAddress,
        EFiatId.USD,
        farm.chain,
      );

      farmInfo = {
        totalAssetSupply:
          +(await getTotalAssets(farm.farmAddress, farm.chain)) *
          valueOf1LPinUSDC,
        depositedAmount: 0,
        valueOf1LPinUSDC: valueOf1LPinUSDC,
      };

      if (walletAccountAtom) {
        const depositedAmountInLP = await getBalanceOf(
          farm.farmAddress,
          undefined,
          farm.chain,
        );
        farmInfo.depositedAmountInLP = depositedAmountInLP;
        // Let's use the depositedAmount to store the deposited amount in USD(C)
        // The amount deposited is (the amount deposited in LP) * (LP to USDC conversion rate)
        const depositedAmount = farm.isLocked
          ? +depositedAmountInLP * valueOf1LPinUSDC
          : +depositedAmountInLP > 0 && isCorrectNetworkAtom == true
            ? await getMaximumLPValueAsToken(
              farm.farmAddress,
              EEthereumAddresses.USDC,
              6,
              depositedAmountInLP,
            )
            : 0;
        farmInfo.depositedAmount = depositedAmount;
        farmInfo.depositDividedAmount = depositDivided(depositedAmount);
        if (farm.isLocked) {
          const userWithdrawals = await getLockedBoostWithdrawalsInfo(
            farm.farmAddress,
            farm.chain,
          );
          farmInfo.unlockedBalance = userWithdrawals.unlockedBalance;
          farmInfo.unlockingBalance = userWithdrawals.unlockingBalance;
          farmInfo.isUnlocking = userWithdrawals.isUnlocking;
        }
      }

      return { ...farm, ...farmInfo };
    } catch (error) {
      throw error;
    }
  };

  const selectSupportedToken = supportedToken => {
    setSelectedSupportedToken(supportedToken);
  };

  const updateRewardsInfo = async () => {
    setIsLoadingRewards(true);
    setIsLoadingPendingRewards(true);
    try {
      const CVXETHInUSDC = await getTokenValueUsingPriceFeedRouter(
        EEthereumAddresses.CVXETH,
        EFiatId.USD,
        EChain.ETHEREUM,
      );

      // Rewards
      const updatedRewards = {
        ...selectedFarmInfo.current.rewards,
        ...(await getBoostFarmRewards(
          selectedFarmInfo.current.farmAddress,
          CVXETHInUSDC,
          selectedFarmInfo.current.chain,
        )),
      };
      rewardsInfo.current = updatedRewards;
      setIsLoadingRewards(false);

      // Pending Rewards
      const updatedPendingRewards =
        +selectedFarmInfo.current.totalAssetSupply > 0
          ? await getBoostFarmPendingRewards(
            selectedFarmInfo.current.farmAddress,
            selectedFarmInfo.current.chain,
          )
          : 0;
      pendingRewardsInfo.current = updatedPendingRewards;
      setIsLoadingPendingRewards(false);
    } catch (error) {
      console.log(error);
    }
  };

  const claimRewards = async () => {
    try {
      const tx = selectedFarm.current?.isLocked
        ? await claimLockedBoostFarmRewards(
          selectedFarmInfo.current.farmAddress,
          seeRewardsAsStable
            ? selectedFarm.current?.rewards.stableAddress
            : selectedFarm.current?.rewards.address,
          selectedFarmInfo.current.chain,
        )
        : seeRewardsAsStable
          ? await claimBoostFarmNonLPRewards(
            selectedFarmInfo.current.farmAddress,
            selectedFarmInfo.current.rewards.stableAddress,
            selectedFarmInfo.current.chain,
          )
          : await claimBoostFarmLPRewards(
            selectedFarmInfo.current.farmAddress,
            selectedFarmInfo.current.chain,
          );
      successTransactionHash.current = tx.transactionHash;
    } catch (error) {
      throw error;
    }
  };

  const manualUnlock = async () => {
    try {
      const tx = await unlockUserFunds(
        selectedFarm.current?.farmAddress,
        selectedFarm.current?.chain,
      );
      successTransactionHash.current = tx.transactionHash;
    } catch (error) {
      throw error;
    }
  };

  const startLockedBoostLockConfirmation = async () => {
    setShowLockedBoostLockConfirmation(true);
  };

  const startLockedBoostManualUnlockSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    neededSteps.push({
      ...possibleBoostFarmSteps[1],
      label: `Manually unlocking ${selectedFarmInfo.current?.unlockingBalance} ${selectedFarm.current?.withdrawToken.label}`,
      successLabel: `$${selectedFarmInfo.current?.unlockingBalance} ${selectedFarm.current?.withdrawToken.label} unlocked`,
    });

    processingTitle.current = 'Manually unlocking...';
    steps.current = neededSteps;

    await startProcessingSteps();
  };

  const startBoostWithdrawalConfirmation = async boostDepositedAmount => {
    // Losable rewards will be the pending value * % of shares to withdraw
    const projectedLosableRewards =
      +pendingRewardsInfo.current * (+withdrawValue / +boostDepositedAmount);
    setLosablePendingRewards(projectedLosableRewards);
    setShowBoostWithdrawalConfirmation(true);
  };

  const startLockedBoostWithdrawalConfirmation = () => {
    setShowLockedBoostWithdrawalConfirmation(true);
  };

  const cancelConfirmations = async () => {
    resetProcessing();
    setShowBoostWithdrawalConfirmation(false);
    setShowLockedBoostWithdrawalConfirmation(false);
    setShowLockedBoostLockConfirmation(false);
  };

  // withdraw method
  const handleWithdraw = async () => {
    // withdraw the percentage of LP based on the percentage of the withdraw value and the selected token
    const withdrawPercentage = +(
      +withdrawValue / +selectedSupportedTokenInfo.current.boostDepositedAmount
    ).toFixed(18);

    const valueToWithdraw =
      withdrawPercentage == 1
        ? selectedFarmInfo.current.depositedAmountInLP
        : selectedFarmInfo.current.depositedAmountInLP * withdrawPercentage;

    try {
      const tx = await withdrawFromBoostFarm(
        selectedFarmInfo.current.farmAddress,
        selectedSupportedToken.address,
        valueToWithdraw,
        selectedFarmInfo.current.chain,
        useBiconomy,
      );
      successTransactionHash.current = tx.transactionHash;
    } catch (error) {
      throw error;
    }
  };

  const handleUnlock = async () => {
    try {
      const tx = await unlockFromLockedBoostFarm(
        selectedFarmInfo.current.farmAddress,
        withdrawValue,
        selectedSupportedToken.decimals,
        selectedFarmInfo.current.chain,
        useBiconomy,
      );
      successTransactionHash.current = tx.transactionHash;
    } catch (error) {
      throw error;
    }
  };

  // withdraw from locked boost method
  const handleWithdrawUnlocked = async () => {
    try {
      const tx = await withdrawFromLockedBoostFarm(
        selectedFarmInfo.current.farmAddress,
        selectedSupportedToken.address,
        selectedFarmInfo.current.chain,
        useBiconomy,
      );
      successTransactionHash.current = tx.transactionHash;
    } catch (error) {
      throw error;
    }
  };

  const handleApprove = async () => {
    try {
      const tx = await approve(
        selectedFarmInfo.current?.farmAddress,
        selectedSupportedToken?.address,
        selectedFarmInfo.current?.chain,
      );
      heapTrack('approvedTransactionMined', {
        pool: 'boost',
        currency: selectedSupportedToken?.label,
        amount: depositValue,
      });
      successTransactionHash.current = tx.transactionHash;
    } catch (err) {
      throw err;
    }
  };

  // deposit method
  const handleDeposit = async () => {
    try {
      heapTrack('startedDepositing', {
        pool: 'boost',
        currency: selectedSupportedToken.label,
        amount: depositValue,
      });
      const tx = await depositIntoBoostFarm(
        selectedFarmInfo.current.farmAddress,
        selectedSupportedToken.address,
        depositValue,
        selectedSupportedToken.decimals,
        selectedFarmInfo.current.chain,
        useBiconomy,
      );
      heapTrack('depositTransactionMined', {
        pool: 'boost',
        currency: selectedSupportedToken.label,
        amount: depositValue,
      });
      selectedSupportedTokenInfo.current.balance =
        selectedSupportedTokenInfo.current.balance - +depositValue;
      successTransactionHash.current = tx.transactionHash;
    } catch (error) {
      throw error;
    }
  };

  const startProcessingSteps = async () => {
    cancelConfirmations();
    processingTitle.current =
      processingTitle.current != undefined
        ? processingTitle.current
        : selectedTab == 0
          ? selectedFarm.current?.isLocked
            ? 'Locking funds...'
            : 'Depositing funds...'
          : selectedFarm.current?.isLocked
            ? 'Unlocking funds...'
            : 'Withdrawing funds...';
    setIsProcessing(true);
    await handleCurrentStep();
  };

  const startClaimRewardsSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    const label = seeRewardsAsStable
      ? rewardsInfo.current?.stableLabel
      : rewardsInfo.current?.label;
    const value = seeRewardsAsStable
      ? rewardsInfo.current?.stableValue
      : rewardsInfo.current?.value;

    neededSteps.push({
      ...possibleBoostFarmSteps[0],
      label: `Claiming ${value} ${label}`,
      successLabel: `${value} ${label} claimed`,
    });

    processingTitle.current = 'Claiming rewards...';
    steps.current = neededSteps;

    await startProcessingSteps();
  };

  const stopProcessingSteps = async () => {
    processingTitle.current = undefined;
    resetProcessing();
    setDepositValue('');
    setWithdrawValue('');
    await updateFarmInfo();
  };

  // executes the handle for the current step
  const handleCurrentStep = async () => {
    setIsHandlingStep(true);

    const step = possibleBoostFarmSteps.find(
      step => step.id == steps.current[currentStep.current].id,
    );

    try {
      switch (step.id) {
        case 0:
          await handleApprove();
          break;

        case 1:
        case 2: // locked boost
          await handleDeposit();
          break;

        case 3:
          await handleWithdraw();
          break;

        case 4: // unlock locked boost
          await handleUnlock();
          break;

        case 5: // withdraw unlocked from locked boost
          await handleWithdrawUnlocked();
          break;

        case 6:
          await claimRewards();
          break;

        case 7:
          await manualUnlock();
          break;
        default:
          throw 'Something went wrong';
          break;
      }
      stepWasSuccessful.current = true;
    } catch (error) {
      stepError.current = error;
      stepWasSuccessful.current = false;
    }
    setIsHandlingStep(false);
  };

  return {
    walletAccountAtom,
    isCorrectNetworkAtom,
    selectedTab,
    setSelectedTab,
    // presentation
    showTabs,
    showHeading,
    showBoostFarmPresentation,
    showLockedBoostFarmPresentation,
    // farm
    selectedFarm,
    updateFarmInfo,
    isLoading,
    selectedFarmInfo,
    selectSupportedToken,
    selectedSupportedToken,
    // interest
    interest,
    isLoadingInterest,
    // rewards
    isLoadingRewards,
    rewardsInfo,
    seeRewardsAsStable,
    setSeeRewardsAsStable,
    // pending rewards
    isLoadingPendingRewards,
    pendingRewardsInfo,
    previousHarvestDate,
    nextHarvestDate,
    losablePendingRewards,
    // biconomy
    useBiconomy,
    setUseBiconomy,
    // deposit
    depositValue,
    setDepositValue,
    handleApprove,
    handleDeposit,
    showLockedBoostLockConfirmation,
    startLockedBoostLockConfirmation,
    //withdraw
    withdrawValue,
    setWithdrawValue,
    selectedSupportedTokenInfo,
    handleWithdraw,
    showBoostWithdrawalConfirmation,
    startBoostWithdrawalConfirmation,
    showLockedBoostWithdrawalConfirmation,
    startLockedBoostWithdrawalConfirmation,
    startLockedBoostManualUnlockSteps,
    // steps
    cancelConfirmations,
    isProcessing,
    currentStep,
    isHandlingStep,
    stepWasSuccessful,
    stepError,
    startProcessingSteps,
    stopProcessingSteps,
    processingTitle,
    steps,
    handleCurrentStep,
    startClaimRewardsSteps,
  };
};
