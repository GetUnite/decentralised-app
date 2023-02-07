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
  getLockedBoostWithdrawalsInfo,
  getMaximumLPValueAsToken,
  unlockFromLockedBoostFarm,
  withdrawFromBoostFarm,
  withdrawFromLockedBoostFarm
} from 'app/common/functions/boostFarm';
import { heapTrack } from 'app/common/functions/heapClient';
import { depositDivided } from 'app/common/functions/utils';
import {
  approve,
  getTotalAssets,
  getUserDepositedLPAmount,
  getValueOf1LPinUSDC
} from 'app/common/functions/web3Client';
import {
  isCorrectNetwork,
  isSafeApp,
  walletAccount,
  wantedChain
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

export const boostFarmOptions: Array<TBoostFarm> = [
  {
    id: 0,
    farmAddress: EEthereumAddresses.FRAXUSDCVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'FRAX/USDC',
    sign: '$',
    icons: [
      'FRAX',
      'USDC',
      'agEUR',
      'CRV',
      'CVX',
      'DAI',
      'EURS',
      'EURT',
      'WETH',
      'WBTC',
    ],
    isBoost: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['CVX', 'ETH'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    lPTokenAddress: EEthereumAddresses.FRAXUSDC,
    supportedTokens: [
      {
        label: 'agEUR',
        address: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
        decimals: 18,
        sign: '€',
      },
      {
        label: 'CRV',
        address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
        decimals: 18,
        sign: '',
      },
      {
        label: 'CVX',
        address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
        decimals: 18,
        sign: '',
      },
      {
        label: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'EURS',
        address: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        decimals: 2,
        sign: '€',
      },
      {
        label: 'EURT',
        address: '0xC581b735A1688071A1746c968e0798D642EDE491',
        decimals: 6,
        sign: '€',
      },
      {
        label: 'FRAX',
        address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        sign: '$',
      },
      {
        label: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        sign: 'Ξ',
      },
      {
        label: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        sign: '₿',
      },
    ],
    lowSlippageTokenLabels: ['FRAX', 'USDC'],
    apyFarmAddresses: {
      baseApyAddress: 'bd072651-d99c-4154-aeae-51f12109c054',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
  },
  {
    id: 1,
    farmAddress: EEthereumAddresses.CVXETHVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'CVX/ETH',
    sign: '$',
    icons: [
      'CVX',
      'WETH',
      'EURS',
      'agEUR',
      'CRV',
      'EURT',
      'FRAX',
      'USDC',
      'WBTC',
      'DAI',
    ],
    isBoost: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['CVX', 'ETH'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    lPTokenAddress: EEthereumAddresses.CVXETH,
    supportedTokens: [
      {
        label: 'agEUR',
        address: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
        decimals: 18,
        sign: '€',
      },
      {
        label: 'CRV',
        address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
        decimals: 18,
        sign: '',
      },
      {
        label: 'CVX',
        address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
        decimals: 18,
        sign: '',
      },
      {
        label: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'EURS',
        address: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        decimals: 2,
        sign: '€',
      },
      {
        label: 'EURT',
        address: '0xC581b735A1688071A1746c968e0798D642EDE491',
        decimals: 6,
        sign: '€',
      },
      {
        label: 'FRAX',
        address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        sign: '$',
      },
      {
        label: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        sign: 'Ξ',
      },
      {
        label: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        sign: '₿',
      },
    ],
    lowSlippageTokenLabels: ['CVX', 'WETH'],
    apyFarmAddresses: {
      baseApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
  },
  {
    id: 2,
    farmAddress: EEthereumAddresses.STETHETHVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'stETH/ETH',
    sign: '$',
    icons: [
      'WETH',
      'USDC',
      'DAI',
      'EURS',
      'EURT',
      'FRAX',
      'WBTC',
      'agEUR',
      'CRV',
      'CVX',
    ],
    isBoost: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['CVX', 'ETH'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    lPTokenAddress: EEthereumAddresses.STETHETH,
    supportedTokens: [
      {
        label: 'agEUR',
        address: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
        decimals: 18,
        sign: '€',
      },
      {
        label: 'CRV',
        address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
        decimals: 18,
        sign: '',
      },
      {
        label: 'CVX',
        address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
        decimals: 18,
        sign: '',
      },
      {
        label: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'EURS',
        address: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        decimals: 2,
        sign: '€',
      },
      {
        label: 'EURT',
        address: '0xC581b735A1688071A1746c968e0798D642EDE491',
        decimals: 6,
        sign: '€',
      },
      {
        label: 'FRAX',
        address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        sign: '$',
      },
      {
        label: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        sign: 'Ξ',
      },
      {
        label: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        sign: '₿',
      },
    ],
    lowSlippageTokenLabels: ['wETH'],
    apyFarmAddresses: {
      baseApyAddress: '5ce23e7e-3800-4c9c-ad30-6db3db0515a1',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
  },
  {
    id: 3,
    farmAddress: EEthereumAddresses.CRVYCRVVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'CRV/yCRV',
    sign: '$',
    icons: [
      'WETH',
      'USDC',
      'DAI',
      'EURS',
      'EURT',
      'FRAX',
      'WBTC',
      'agEUR',
      'CRV',
      'CVX',
    ],
    isBoost: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['CVX', 'ETH'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    lPTokenAddress: EEthereumAddresses.CRVYCRV,
    supportedTokens: [
      {
        label: 'agEUR',
        address: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
        decimals: 18,
        sign: '€',
      },
      {
        label: 'CRV',
        address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
        decimals: 18,
        sign: '',
      },
      {
        label: 'CVX',
        address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
        decimals: 18,
        sign: '',
      },
      {
        label: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'EURS',
        address: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        decimals: 2,
        sign: '€',
      },
      {
        label: 'EURT',
        address: '0xC581b735A1688071A1746c968e0798D642EDE491',
        decimals: 6,
        sign: '€',
      },
      {
        label: 'FRAX',
        address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        sign: '$',
      },
      {
        label: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        sign: 'Ξ',
      },
      {
        label: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        sign: '₿',
      },
    ],
    lowSlippageTokenLabels: ['CRV'],
    apyFarmAddresses: {
      baseApyAddress: '1fbe7e03-75f3-4d65-8423-2cc023f786d7',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
    isNewest: true,
  },
  {
    id: 4,
    farmAddress: EEthereumAddresses.DOLAFRAXBPVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'DOLA/FRAXBP',
    sign: '$',
    icons: [
      'WETH',
      'USDC',
      'DAI',
      'EURS',
      'EURT',
      'FRAX',
      'WBTC',
      'agEUR',
      'CRV',
      'CVX',
    ],
    isBoost: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['CVX', 'ETH'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    lPTokenAddress: EEthereumAddresses.DOLAFRAXBP,
    supportedTokens: [
      {
        label: 'agEUR',
        address: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
        decimals: 18,
        sign: '€',
      },
      {
        label: 'CRV',
        address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
        decimals: 18,
        sign: '',
      },
      {
        label: 'CVX',
        address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
        decimals: 18,
        sign: '',
      },
      {
        label: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'EURS',
        address: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        decimals: 2,
        sign: '€',
      },
      {
        label: 'EURT',
        address: '0xC581b735A1688071A1746c968e0798D642EDE491',
        decimals: 6,
        sign: '€',
      },
      {
        label: 'FRAX',
        address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        sign: '$',
      },
      {
        label: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        sign: 'Ξ',
      },
      {
        label: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        sign: '₿',
      },
    ],
    lowSlippageTokenLabels: ['FRAX', 'USDC'],
    apyFarmAddresses: {
      baseApyAddress: 'd05cb04d-f1e5-451d-95a2-6a3a9da001ad',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
    isNewest: true,
  },
  {
    id: 5,
    farmAddress: EEthereumAddresses.FRXETHVAULT,
    type: 'booster',
    isLocked: true,
    chain: EChain.ETHEREUM,
    name: 'FrxETH/ETH',
    sign: '$',
    icons: [
      'FRAX',
      'USDC',
      'agEUR',
      'CRV',
      'CVX',
      'DAI',
      'EURS',
      'EURT',
      'WETH',
      'WBTC',
    ],
    isBoost: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['CVX', 'ETH'],
      stableLabel: 'USDC',
      address: EEthereumAddresses.CVXETH,
      stableAddress: EEthereumAddresses.USDC,
    },
    lPTokenAddress: EEthereumAddresses.FRXETH,
    supportedTokens: [
      {
        label: 'agEUR',
        address: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
        decimals: 18,
        sign: '€',
      },
      {
        label: 'CRV',
        address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
        decimals: 18,
        sign: '',
      },
      {
        label: 'CVX',
        address: '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B',
        decimals: 18,
        sign: '',
      },
      {
        label: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'EURS',
        address: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        decimals: 2,
        sign: '€',
      },
      {
        label: 'EURT',
        address: '0xC581b735A1688071A1746c968e0798D642EDE491',
        decimals: 6,
        sign: '€',
      },
      {
        label: 'FRAX',
        address: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        sign: '$',
      },
      {
        label: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        sign: 'Ξ',
      },
      {
        label: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        sign: '₿',
      },
    ],
    lowSlippageTokenLabels: ['FRAX', 'ETH'],
    apyFarmAddresses: {
      baseApyAddress: 'bd072651-d99c-4154-aeae-51f12109c054',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
    forcedInterest: '9.50',
    withdrawToken: {
      label: 'FrxETH/ETH',
      address: EEthereumAddresses.FRXETH,
      decimals: 18,
      sign: '',
    },
    isNewest: true,
  },
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

  // selected supportedTokenInfo
  const selectedSupportedTokenInfo = useRef<any>({
    boostDepositedAmount: 0,
    balance: 0,
    allowance: 0,
    unlocked: 0,
  });

  // booster farm rewards control
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
  const previousHarvestDate = moment().subtract(1, 'days').day('Monday');
  const nextHarvestDate = useRef<any>(
    moment().subtract(1, 'days').add(1, 'week').day('Sunday').set('hour', 12),
  );

  // when entering boost farms set wanted chain to ethereum (for now only ethereum has boost farms)
  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.ETHEREUM);
    }
  }, [walletAccountAtom]);

  useEffect(() => {
    if (!selectedFarm) {
      navigate('/');
      return;
    }
    const loadFarmInfo = async () => {
      try {
        heapTrack('farm', {
          pool: 'boost',
          currency: selectedFarm.current.name,
        });

        selectedFarmInfo.current = {
          ...selectedFarm.current,
          ...(await getUpdatedFarmInfo(selectedFarm.current)),
        };
        setSelectedSupportedToken(selectedFarmInfo.current.supportedTokens[0]);

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

  // used to update the farm info after withdraw or deposit
  const updateFarmInfo = async () => {
    try {
      const farm = await getUpdatedFarmInfo(selectedFarm.current);
      selectedFarmInfo.current = farm;
      setSelectedSupportedToken(
        farm.supportedTokens?.find(
          st => st?.address == selectedSupportedToken?.address,
        ),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const getUpdatedFarmInfo = async farm => {
    try {
      let farmInfo;

      const valueOf1LPinUSDC = await getValueOf1LPinUSDC(
        farm.lPTokenAddress,
        farm.chain,
      );

      farmInfo = {
        interest: farm.forcedInterest
          ? farm.forcedInterest
          : await getBoostFarmInterest(
              farm.farmAddress,
              farm.apyFarmAddresses,
              farm.chain,
            ),
        totalAssetSupply:
          +(await getTotalAssets(farm.farmAddress, farm.chain)) *
          valueOf1LPinUSDC,
        depositedAmount: 0,
        valueOf1LPinUSDC: valueOf1LPinUSDC,
      };
      if (walletAccountAtom) {
        const depositedAmountInLP = await getUserDepositedLPAmount(
          farm.farmAddress,
          farm.chain,
        );
        farmInfo.depositedAmountInLP = depositedAmountInLP;
        // Let's use the depositedAmount to store the deposited amount in USD(C)
        // The amount deposited is (the amount deposited in LP) * (LP to USDC conversion rate)
        const depositedAmount =
          +depositedAmountInLP > 0 && isCorrectNetworkAtom == true
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
          farmInfo.isUnlocking = userWithdrawals.isUnlocking;
        }
      }

      return { ...farm, ...farmInfo };
    } catch (error) {
      console.log(error);
    }
  };

  const selectSupportedToken = supportedToken => {
    setSelectedSupportedToken(supportedToken);
  };

  const updateRewardsInfo = async () => {
    setIsLoadingRewards(true);
    setIsLoadingPendingRewards(true);
    try {
      const CVXETHInUSDC = await getValueOf1LPinUSDC(
        EEthereumAddresses.CVXETH,
        selectedFarmInfo.current.chain,
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
        selectedFarmInfo.current.totalAssetSupply > 0
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

  const startLockedBoostLockConfirmation = async () => {
    setShowLockedBoostLockConfirmation(true);
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
    const withdrawPercentage = Math.round(
      +withdrawValue / +selectedSupportedTokenInfo.current.boostDepositedAmount,
    );

    const valueToWithdraw =
      selectedFarmInfo.current.depositedAmountInLP * withdrawPercentage;

    console.log({
      withdrawValue,
      depositedAmount: selectedSupportedTokenInfo.current.boostDepositedAmount,
      depositedAmountInLP: selectedFarmInfo.current.depositedAmountInLP,
      withdrawPercentage,
      valueToWithdraw,
    });

    try {
      const tx = await withdrawFromBoostFarm(
        selectedFarmInfo.current.farmAddress,
        selectedSupportedToken.address,
        valueToWithdraw,
        selectedSupportedToken.decimals,
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
