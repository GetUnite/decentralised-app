import { EEthereumAddresses } from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import {
  claimBoostFarmLPRewards,
  claimBoostFarmNonLPRewards,
  getBoostFarmInterest,
  getBoostFarmPendingRewards,
  getBoostFarmRewards
} from 'app/common/functions/boostFarm';
import { heapTrack } from 'app/common/functions/heapClient';
import { depositDivided } from 'app/common/functions/utils';
import {
  getTotalAssets,
  getUserDepositedLPAmount,
  getValueOf1LPinUSDC
} from 'app/common/functions/web3Client';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { TBoostFarm } from 'app/common/types/farm';
import { TSupportedToken } from 'app/common/types/global';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useNotification } from '../useNotification';

export const boostFarmOptions: Array<TBoostFarm> = [
  {
    id: 8,
    farmAddress: EEthereumAddresses.FRAXUSDCVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'Frax/USDC',
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
      icons: ['FRAX', 'USDC'],
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
    isNewest: true,
  },
  {
    id: 9,
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
    isNewest: true,
  },
  {
    id: 10,
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
      icons: ['stETH', 'ETH'],
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
    lowSlippageTokenLabels: [
      //'stETH',
      'wETH',
    ],
    apyFarmAddresses: {
      baseApyAddress: '5ce23e7e-3800-4c9c-ad30-6db3db0515a1',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
    isNewest: true,
  },
];

const defaultRewards = {
  label: 'CVX-ETH',
  stableLabel: 'USDC',
  stableAddress: EEthereumAddresses.USDC,
};

export const useBoostFarm = ({ id }) => {
  // react
  const navigate = useNavigate();
  const [cookies] = useCookies(['has_seen_boost_farms']);

  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // other state control files
  const { setNotification } = useNotification();

  // selected farm control
  const [availableFarms] = useState<TBoostFarm[]>(boostFarmOptions);
  const [selectedFarm, setSelectedFarm] = useState<TBoostFarm>();
  const [selectedSupportedToken, setSelectedsupportedToken] =
    useState<TSupportedToken>();

  // booster farm rewards control
  const [rewardsInfo, setRewardsInfo] = useState<any>(defaultRewards);
  const [pendingRewardsInfo, setPendingRewardsInfo] = useState<any>(false);
  const [seeRewardsAsStable, setSeeRewardsAsStable] = useState<boolean>(false);

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClamingRewards, setIsClamingRewards] = useState<boolean>(false);
  const [isLoadingRewards, setIsLoadingRewards] = useState<boolean>(false);
  const [isLoadingPendingRewards, setIsLoadingPendingRewards] =
    useState<boolean>(false);

  // information/confirmation control
  const showBoostFarmPresentation = !cookies.has_seen_boost_farms;

  const previousHarvestDate = moment().subtract(1, 'days').day('Monday');
  const nextHarvestDate = moment()
    .subtract(1, 'days')
    .add(1, 'week')
    .day('Monday');
  const [showBoostWithdrawalConfirmation, setShowBoostWithdrawalConfirmation] =
    useState<boolean>(false);
  const [losablePendingRewards, setLosablePendingRewards] = useState<number>();

  const showTabs = !showBoostFarmPresentation;
  //&& !showBoostWithdrawalConfirmation;

  useEffect(() => {
    if (walletAccountAtom && selectedFarm) {
      setWantedChainAtom(selectedFarm.chain);
    }
  }, [walletAccountAtom, selectedFarm]);

  useEffect(() => {
    if (walletAccountAtom && selectedFarm) {
      updateRewardsInfo();
    }
  }, [selectedFarm]);

  useEffect(() => {
    const selectFarm = async id => {
      try {
        let farm = availableFarms.find(availableFarm => availableFarm.id == id);
        if (!farm) {
          navigate('/');
          return;
        }

        farm = { ...farm, ...(await getUpdatedFarmInfo(farm)) };

        heapTrack('farm', { pool: 'boost', currency: farm.name });
        setSelectedFarm(farm);
        setSelectedsupportedToken(farm.supportedTokens[0]);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    if (walletAccountAtom) {
      selectFarm(id);
    }
  }, [walletAccountAtom]);

  const updateFarmInfo = async () => {
    setIsLoading(true);
    try {
      const farm = await getUpdatedFarmInfo(selectedFarm);
      setSelectedsupportedToken(
        farm.supportedTokens?.find(
          st => st?.address == selectedSupportedToken?.address,
        ),
      );
      setSelectedFarm(farm);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const getUpdatedFarmInfo = async (farm = selectedFarm) => {
    try {
      let farmInfo;

      const valueOf1LPinUSDC = await getValueOf1LPinUSDC(
        farm.lPTokenAddress,
        farm.chain,
      );

      farmInfo = {
        interest: await getBoostFarmInterest(
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
        const depositedAmount = +depositedAmountInLP * valueOf1LPinUSDC;
        farmInfo.depositedAmount = depositedAmount;
        farmInfo.depositDividedAmount = depositDivided(depositedAmount);
      }

      return { ...farm, ...farmInfo };
    } catch (error) {
      console.log(error);
    }
  };

  const selectSupportedToken = supportedToken => {
    setSelectedsupportedToken(supportedToken);
  };

  const updateRewardsInfo = async () => {
    setIsLoadingRewards(true);
    setIsLoadingPendingRewards(true);
    try {
      const CVXETHInUSDC = await getValueOf1LPinUSDC(
        EEthereumAddresses.CVXETH,
        selectedFarm.chain,
      );
      // Rewards
      const updatedRewards = {
        ...selectedFarm.rewards,
        ...(await getBoostFarmRewards(
          selectedFarm.farmAddress,
          CVXETHInUSDC,
          selectedFarm.chain,
        )),
      };
      setRewardsInfo(updatedRewards);
      setIsLoadingRewards(false);

      // Pending Rewards
      const updatedPendingRewards =
        selectedFarm.totalAssetSupply > 0
          ? await getBoostFarmPendingRewards(
              selectedFarm.farmAddress,
              selectedFarm.chain,
            )
          : 0;
      setPendingRewardsInfo(updatedPendingRewards);
      setIsLoadingPendingRewards(false);
    } catch (error) {
      console.log(error);
    }
  };

  const claimRewards = async () => {
    setIsClamingRewards(true);
    try {
      const tx = seeRewardsAsStable
        ? await claimBoostFarmNonLPRewards(
            selectedFarm.farmAddress,
            selectedFarm.rewards.stableAddress,
            selectedFarm.chain,
          )
        : await claimBoostFarmLPRewards(
            selectedFarm.farmAddress,
            selectedFarm.chain,
          );
      await updateRewardsInfo();
      setNotification(
        'Rewards claimed successfully',
        'success',
        tx.transactionHash,
        selectedFarm.chain,
      );
    } catch (error) {
      setNotification(error, 'error');
    }
    setIsClamingRewards(false);
  };

  const startBoostWithdrawalConfirmation = async (
    withdrawValue,
    boostDepositedAmount,
  ) => {
    setShowBoostWithdrawalConfirmation(true);
    // Losable rewards will be the pending value * % of shares to withdraw
    const projectedLosableRewards =
      +pendingRewardsInfo * (+withdrawValue / +boostDepositedAmount);
    setLosablePendingRewards(projectedLosableRewards);
  };

  const cancelBoostWithdrawalConfirmation = async () => {
    setShowBoostWithdrawalConfirmation(false);
  };

  return {
    isLoading,
    availableFarms,
    selectedFarm,
    updateFarmInfo,
    selectedSupportedToken,
    selectSupportedToken,
    seeRewardsAsStable,
    setSeeRewardsAsStable,
    claimRewards,
    isClamingRewards,
    isLoadingRewards,
    showTabs,
    showBoostFarmPresentation,
    previousHarvestDate,
    nextHarvestDate,
    showBoostWithdrawalConfirmation,
    startBoostWithdrawalConfirmation,
    cancelBoostWithdrawalConfirmation,
    rewardsInfo,
    losablePendingRewards,
    pendingRewardsInfo,
    isLoadingPendingRewards,
  };
};
