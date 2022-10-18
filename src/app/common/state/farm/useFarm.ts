import {
  EEthereumAddresses,
  EPolygonAddresses
} from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import { getBoosterFarmPendingRewards } from 'app/common/functions/farm';
import {
  claimBoosterFarmLPRewards,
  claimBoosterFarmNonLPRewards,
  getBoosterFarmInterest,
  getBoosterFarmRewards,
  getInterest,
  getSupportedTokensAdvancedInfo,
  getSupportedTokensBasicInfo,
  getSupportedTokensList,
  getTotalAssets,
  getTotalAssetSupply,
  getUserDepositedAmount,
  getUserDepositedLPAmount
} from 'app/common/functions/web3Client';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { TFarm } from 'app/common/types/farm';
import { TSupportedToken } from 'app/common/types/form';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useNotification } from '../useNotification';

export const initialAvailableFarmsState: Array<TFarm> = [
  {
    id: 8,
    farmAddress: EEthereumAddresses.FRAXUSDCVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'FRAX/USDC',
    sign: '',
    icons: ['FRAX', 'USDC'],
    isBooster: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['FRAX', 'USDC'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    supportedTokensAddresses: [
      { address: EEthereumAddresses.USDC, label: 'USDC' },
      { address: EEthereumAddresses.DAI, label: 'DAI' },
      { address: EEthereumAddresses.FRAX, label: 'FRAX' },
      { address: EEthereumAddresses.AGEUR, label: 'agEUR' },
      { address: EEthereumAddresses.EURS, label: 'EURS' },
      { address: EEthereumAddresses.EURT, label: 'EURT' },
      { address: EEthereumAddresses.WETH, label: 'WETH' },
      { address: EEthereumAddresses.WBTC, label: 'WTBC' },
      { address: EEthereumAddresses.CRV, label: 'CRV' },
      { address: EEthereumAddresses.CVX, label: 'CVX' },
    ],
    convexFarmIds: { A: 100, B: 64 },
  },
  {
    id: 9,
    farmAddress: EEthereumAddresses.CVXETHVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'CVX/ETH',
    sign: '',
    icons: ['CVX', 'ETH'],
    isBooster: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['CVX', 'ETH'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    supportedTokensAddresses: [
      { address: EEthereumAddresses.USDC, label: 'USDC' },
      { address: EEthereumAddresses.DAI, label: 'DAI' },
      { address: EEthereumAddresses.FRAX, label: 'FRAX' },
      { address: EEthereumAddresses.AGEUR, label: 'agEUR' },
      { address: EEthereumAddresses.EURS, label: 'EURS' },
      { address: EEthereumAddresses.EURT, label: 'EURT' },
      { address: EEthereumAddresses.WETH, label: 'WETH' },
      { address: EEthereumAddresses.WBTC, label: 'WTBC' },
      { address: EEthereumAddresses.CRV, label: 'CRV' },
      { address: EEthereumAddresses.CVX, label: 'CVX' },
    ],
    convexFarmIds: { A: 64, B: 64 },
  },
  {
    id: 10,
    farmAddress: EEthereumAddresses.STETHETHVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'stETH/ETH',
    sign: '',
    icons: ['stETH', 'ETH'],
    isBooster: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['stETH', 'ETH'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    supportedTokensAddresses: [
      { address: EEthereumAddresses.USDC, label: 'USDC' },
      { address: EEthereumAddresses.DAI, label: 'DAI' },
      { address: EEthereumAddresses.FRAX, label: 'FRAX' },
      { address: EEthereumAddresses.AGEUR, label: 'agEUR' },
      { address: EEthereumAddresses.EURS, label: 'EURS' },
      { address: EEthereumAddresses.EURT, label: 'EURT' },
      { address: EEthereumAddresses.WETH, label: 'WETH' },
      { address: EEthereumAddresses.WBTC, label: 'WTBC' },
      { address: EEthereumAddresses.CRV, label: 'CRV' },
      { address: EEthereumAddresses.CVX, label: 'CVX' },
    ],
    convexFarmIds: { A: 25, B: 64 },
  },
  {
    id: 0,
    farmAddress: EPolygonAddresses.IBALLUOUSD,
    type: 'usd',
    chain: EChain.POLYGON,
    name: 'US Dollar',
    sign: '$',
    icons: ['USDC', 'USDT', 'DAI'],
  },
  {
    id: 1,
    farmAddress: EPolygonAddresses.IBALLUOEUR,
    type: 'eur',
    chain: EChain.POLYGON,
    name: 'Euro',
    sign: '€',
    icons: ['EURT', 'EURS', 'jEUR'],
  },
  {
    id: 2,
    farmAddress: EPolygonAddresses.IBALLUOETH,
    type: 'eth',
    chain: EChain.POLYGON,
    name: 'Ethereum',
    sign: 'Ξ',
    icons: ['WETH'],
  },
  {
    id: 3,
    farmAddress: EPolygonAddresses.IBALLUOBTC,
    type: 'btc',
    chain: EChain.POLYGON,
    name: 'Bitcoin',
    sign: '₿',
    icons: ['WBTC'],
  },
  {
    id: 4,
    farmAddress: EEthereumAddresses.IBALLUOUSD,
    type: 'usd',
    chain: EChain.ETHEREUM,
    name: 'US Dollar',
    sign: '$',
    icons: ['USDC', 'USDT', 'DAI'],
  },
  {
    id: 5,
    farmAddress: EEthereumAddresses.IBALLUOEUR,
    type: 'eur',
    chain: EChain.ETHEREUM,
    name: 'Euro',
    sign: '€',
    icons: ['EURT', 'EURS', 'agEUR'],
  },
  {
    id: 6,
    farmAddress: EEthereumAddresses.IBALLUOETH,
    type: 'eth',
    chain: EChain.ETHEREUM,
    name: 'Ethereum',
    sign: 'Ξ',
    icons: ['WETH'],
  },
  {
    id: 7,
    farmAddress: EEthereumAddresses.IBALLUOBTC,
    type: 'btc',
    chain: EChain.ETHEREUM,
    name: 'Bitcoin',
    sign: '₿',
    icons: ['WBTC'],
  },
];

export const useFarm = ({ id }) => {
  // react
  const navigate = useNavigate();
  const [cookies] = useCookies(['has_seen_boost_farms']);

  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // other state control files
  const { setNotificationt } = useNotification();

  // selected farm control
  const [availableFarms] = useState<TFarm[]>(initialAvailableFarmsState);
  const [selectedFarm, setSelectedFarm] = useState<TFarm>();
  const [selectedSupportedToken, setSelectedsupportedToken] =
    useState<TSupportedToken>();

  // booster farm rewards control
  const [seeRewardsAsStable, setSeeRewardsAsStable] = useState<boolean>(false);

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClamingRewards, setIsClamingRewards] = useState<boolean>(false);
  const [isLoadingRewards, setIsLoadingRewards] = useState<boolean>(false);

  // information/confirmation control
  const showBoosterFarmPresentation =
    selectedFarm?.isBooster && !cookies.has_seen_boost_farms;

  const previousHarvestDate = moment().day('Monday');
  const nextHarvestDate = moment().add(1, 'week').day('Monday');
  const [
    showBoosterWithdrawalConfirmation,
    setShowBoosterWithdrawalConfirmation,
  ] = useState<boolean>(false);

  const showTabs = !showBoosterFarmPresentation;
  //&& !showBoosterWithdrawalConfirmation;

  useEffect(() => {
    if (walletAccountAtom && selectedFarm) {
      setWantedChainAtom(selectedFarm.chain);
    }
  }, [walletAccountAtom, selectedFarm]);

  useEffect(() => {
    selectFarm(id);
  }, [walletAccountAtom]);

  const fetchFarmInfo = async farm => {
    let farmInfo;
    farmInfo = {
      interest: await getInterest(farm.type, farm.chain),
      totalAssetSupply: await getTotalAssetSupply(farm.type, farm.chain),
      supportedTokensList: await getSupportedTokensList(farm.type, farm.chain),
      depositedAmount: 0,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmount = await getUserDepositedAmount(
        farm.type,
        farm.chain,
      );
      farmInfo.depositDividedAmount = depositDivided(farmInfo.depositedAmount);
    }

    return farmInfo;
  };

  const fetchBoosterFarmInfo = async farm => {
    let farmInfo;
    farmInfo = {
      interest: await getBoosterFarmInterest(
        farm.farmAddress,
        farm.convexFarmIds,
        farm.chain,
      ),
      totalAssetSupply: await getTotalAssets(farm.farmAddress, farm.chain),
      supportedTokensList: await Promise.all(
        farm.supportedTokensAddresses.map(async supportedtoken => {
          return await getSupportedTokensBasicInfo(
            supportedtoken.address,
            farm.chain,
          );
        }),
      ),
      depositedAmount: 0,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmount = await getUserDepositedLPAmount(
        farm.farmAddress,
        farm.chain,
      );
      farmInfo.depositDividedAmount = depositDivided(farmInfo.depositedAmount);
      farmInfo.rewards = {
        ...farm.rewards,
        ...(await getBoosterFarmRewards(farm.farmAddress, farm.chain)),
      };
      farmInfo.rewards.pendingValue =
        farmInfo.totalAssetSupply > 0
          ? await getBoosterFarmPendingRewards(farm.farmAddress, farm.chain)
          : 0;
    }

    return farmInfo;
  };

  const updateFarmInfo = async () => {
    setIsLoading(true);
    try {
      const farm = await getUpdatedFarmInfo(selectedFarm);
      setSelectedsupportedToken(
        farm.supportedTokens?.find(
          stableCoin => stableCoin?.address == selectedSupportedToken?.address,
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
      let farmInfo = farm?.isBooster
        ? await fetchBoosterFarmInfo(farm)
        : await fetchFarmInfo(farm);

      if (walletAccountAtom) {
        farmInfo.supportedTokens = await Promise.all(
          farmInfo.supportedTokensList.map(async supportedToken => {
            const advancedSupportedTokenInfo =
              await getSupportedTokensAdvancedInfo(
                farm.farmAddress,
                supportedToken,
                farm.chain,
              );
            return {
              label: supportedToken.symbol,
              address: supportedToken.tokenAddress,
              balance: advancedSupportedTokenInfo.balance,
              allowance: advancedSupportedTokenInfo.allowance,
              decimals: supportedToken.decimals,
            };
          }),
        );
      }

      return { ...farm, ...farmInfo };
    } catch (error) {
      console.log(error);
    }
  };

  const selectFarm = async id => {
    setIsLoading(true);

    try {
      const farm = await getUpdatedFarmInfo(
        availableFarms.find(availableFarm => availableFarm.id == id),
      );
      if (!farm) {
        navigate('/');
      }
      setSelectedFarm(farm);
      setSelectedsupportedToken(
        farm.supportedTokens?.length > 0 ? farm.supportedTokens[0] : undefined,
      );
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  const selectSupportedToken = supportedToken => {
    setSelectedsupportedToken(supportedToken);
  };

  const depositDivided = depositedAmount => {
    const dotIndex = depositedAmount.indexOf('.');
    const balanceFirstPart = depositedAmount.substring(0, dotIndex + 3);
    const balanceSecondPart = depositedAmount.substring(
      dotIndex + 3,
      dotIndex + 9,
    );
    return { first: balanceFirstPart, second: balanceSecondPart };
  };

  const updateRewardsInfo = async () => {
    setIsLoadingRewards(true);
    try {
      const updatedRewards = {
        ...selectedFarm.rewards,
        ...(await getBoosterFarmRewards(
          selectedFarm.farmAddress,
          selectedFarm.chain,
        )),
      };
      setSelectedFarm({ ...selectedFarm, rewards: updatedRewards });
    } catch (error) {
      console.log(error);
    }
    setIsLoadingRewards(false);
  };

  const claimRewards = async () => {
    setIsClamingRewards(true);
    try {
      if (selectedFarm?.isBooster) {
        seeRewardsAsStable
          ? await claimBoosterFarmNonLPRewards(
              selectedFarm.farmAddress,
              selectedFarm.rewards.stableAddress,
              selectedFarm.chain,
            )
          : await claimBoosterFarmLPRewards(
              selectedFarm.farmAddress,
              selectedFarm.chain,
            );
      }
      await updateRewardsInfo();
      setNotificationt('Rewards claimed successfully', 'success');
    } catch (error) {
      setNotificationt(error, 'error');
    }
    setIsClamingRewards(false);
  };

  const startBoosterWithdrawalConfirmation = async (
    withdrawValue,
    handleWithdraw,
  ) => {
    setShowBoosterWithdrawalConfirmation(true);
  };

  const cancelBoosterWithdrawalConfirmation = async () => {
    setShowBoosterWithdrawalConfirmation(false);
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
    showBoosterFarmPresentation,
    previousHarvestDate,
    nextHarvestDate,
    showBoosterWithdrawalConfirmation,
    startBoosterWithdrawalConfirmation,
    cancelBoosterWithdrawalConfirmation,
  };
};
