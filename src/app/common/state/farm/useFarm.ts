import {
  EEthereumAddresses,
  EPolygonAddresses
} from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import {
  convertFromUSDC,
  getBoosterFarmPendingRewards,
  getBoosterFarmRewards,
  getValueOf1LPinUSDC
} from 'app/common/functions/farm';
import {
  claimBoosterFarmLPRewards,
  claimBoosterFarmNonLPRewards,
  getBoosterFarmInterest,
  getInterest,
  getSupportedTokensAdvancedInfo,
  getSupportedTokensBasicInfo,
  getSupportedTokensList,
  getTotalAssets,
  getTotalAssetSupply,
  getUserDepositedAmount,
  getUserDepositedLPAmount
} from 'app/common/functions/web3Client';
import { isSafeApp, walletAccount, wantedChain } from 'app/common/state/atoms';
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
    sign: '$',
    icons: ['FRAX', 'USDC'],
    isBooster: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['FRAX', 'USDC'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    lPTokenAddress: EEthereumAddresses.FRAXUSDC,
    supportedTokensAddresses: [
      { address: EEthereumAddresses.AGEUR, label: 'agEUR', sign: '€' },
      { address: EEthereumAddresses.CRV, label: 'CRV', sign: '' },
      { address: EEthereumAddresses.CVX, label: 'CVX', sign: '' },
      { address: EEthereumAddresses.DAI, label: 'DAI', sign: '$' },
      { address: EEthereumAddresses.EURS, label: 'EURS', sign: '€' },
      { address: EEthereumAddresses.EURT, label: 'EURT', sign: '€' },
      { address: EEthereumAddresses.FRAX, label: 'FRAX', sign: '$' },
      //{ address: EEthereumAddresses.STETHETH, label: 'stETH', sign: 'Ξ' },
      { address: EEthereumAddresses.USDC, label: 'USDC', sign: '$' },
      { address: EEthereumAddresses.WETH, label: 'WETH', sign: 'Ξ' },
      { address: EEthereumAddresses.WBTC, label: 'WTBC', sign: '₿' },
    ],
    lowSlippageTokenLabels: ['FRAX', 'USDC'],
    apyFarmAddresses: { baseApyAddress: "bd072651-d99c-4154-aeae-51f12109c054", boostApyAddress :"25d9dc49-3182-493a-bda4-0db53b25f457" },
  },
  {
    id: 9,
    farmAddress: EEthereumAddresses.CVXETHVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'CVX/ETH',
    sign: '$',
    icons: ['CVX', 'ETH'],
    isBooster: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['CVX', 'ETH'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    lPTokenAddress: EEthereumAddresses.CVXETH,
    supportedTokensAddresses: [
      { address: EEthereumAddresses.AGEUR, label: 'agEUR', sign: '€' },
      { address: EEthereumAddresses.CRV, label: 'CRV', sign: '' },
      { address: EEthereumAddresses.CVX, label: 'CVX', sign: '' },
      { address: EEthereumAddresses.DAI, label: 'DAI', sign: '$' },
      { address: EEthereumAddresses.EURS, label: 'EURS', sign: '€' },
      { address: EEthereumAddresses.EURT, label: 'EURT', sign: '€' },
      { address: EEthereumAddresses.FRAX, label: 'FRAX', sign: '$' },
      //{ address: EEthereumAddresses.STETHETH, label: 'stETH', sign: 'Ξ' },
      { address: EEthereumAddresses.USDC, label: 'USDC', sign: '$' },
      { address: EEthereumAddresses.WETH, label: 'WETH', sign: 'Ξ' },
      { address: EEthereumAddresses.WBTC, label: 'WTBC', sign: '₿' },
    ],
    lowSlippageTokenLabels: ['CVX', 'WETH'],
    apyFarmAddresses: { baseApyAddress: "25d9dc49-3182-493a-bda4-0db53b25f457", boostApyAddress :"25d9dc49-3182-493a-bda4-0db53b25f457" },
  },
  {
    id: 10,
    farmAddress: EEthereumAddresses.STETHETHVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'stETH/ETH',
    sign: '$',
    icons: ['stETH', 'ETH'],
    isBooster: true,
    rewards: {
      label: 'CVX-ETH',
      icons: ['stETH', 'ETH'],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
    },
    lPTokenAddress: EEthereumAddresses.STETHETH,
    supportedTokensAddresses: [
      { address: EEthereumAddresses.AGEUR, label: 'agEUR', sign: '€' },
      { address: EEthereumAddresses.CRV, label: 'CRV', sign: '' },
      { address: EEthereumAddresses.CVX, label: 'CVX', sign: '' },
      { address: EEthereumAddresses.DAI, label: 'DAI', sign: '$' },
      { address: EEthereumAddresses.EURS, label: 'EURS', sign: '€' },
      { address: EEthereumAddresses.EURT, label: 'EURT', sign: '€' },
      { address: EEthereumAddresses.FRAX, label: 'FRAX', sign: '$' },
      //{ address: EEthereumAddresses.STETHETH, label: 'stETH', sign: 'Ξ' },
      { address: EEthereumAddresses.USDC, label: 'USDC', sign: '$' },
      { address: EEthereumAddresses.WETH, label: 'WETH', sign: 'Ξ' },
      { address: EEthereumAddresses.WBTC, label: 'WTBC', sign: '₿' },
    ],
    lowSlippageTokenLabels: [//'stETH', 
    'wETH'],
    apyFarmAddresses: { baseApyAddress: "5ce23e7e-3800-4c9c-ad30-6db3db0515a1", boostApyAddress :"25d9dc49-3182-493a-bda4-0db53b25f457" },
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
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
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
  const showBoosterFarmPresentation = !isSafeAppAtom && selectedFarm?.isBooster && !cookies.has_seen_boost_farms;

  const previousHarvestDate = moment().day('Monday');
  const nextHarvestDate = moment().add(1, 'week').day('Monday');
  const [
    showBoosterWithdrawalConfirmation,
    setShowBoosterWithdrawalConfirmation,
  ] = useState<boolean>(false);
  const [pendingRewards, setPendingRewards] = useState<number>();
  const [losablePendingRewards, setLosablePendingRewards] = useState<number>();

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

    const valueOf1LPinUSDC = await getValueOf1LPinUSDC(
      farm.lPTokenAddress,
      farm.chain,
    );

    farmInfo = {
      interest: await getBoosterFarmInterest(
        farm.farmAddress,
        farm.apyFarmAddress,
        farm.chain,
      ),
      totalAssetSupply:
        +(await getTotalAssets(farm.farmAddress, farm.chain)) *
        valueOf1LPinUSDC,
      supportedTokensList: await Promise.all(
        farm.supportedTokensAddresses.map(async supportedtoken => {
          return {
            ...(await getSupportedTokensBasicInfo(
              supportedtoken.address,
              farm.chain,
            )),
            sign: supportedtoken.sign,
          };
        }),
      ),
      depositedAmount: 0,
      valueOf1LPinUSDC: valueOf1LPinUSDC,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmountInLP = await getUserDepositedLPAmount(
        farm.farmAddress,
        farm.chain,
      );
      // Let's use the depositedAmount to store the deposited amount in USD(C)
      // The amount deposited is (the amount deposited in LP) * (LP to USDC conversion rate)
      farmInfo.depositedAmount =
        +farmInfo.depositedAmountInLP * valueOf1LPinUSDC;
      farmInfo.depositDividedAmount = depositDivided(farmInfo.depositedAmount);
      farmInfo.rewards = {
        ...farm.rewards,
        ...(await getBoosterFarmRewards(
          farm.farmAddress,
          farmInfo.valueOf1LPinUSDC,
          farm.chain,
        )),
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
      if (farm.isBooster) {
        setPendingRewards(farm.rewards.pendingValue);
      }
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
              sign: supportedToken.sign,
              // For booster farm withdrawals
              // The balance of the farm is returned in LP which is converted into USDC and needs to be converted to each supported token for withdrawal
              // ex: wETH is selected => depositedAmount = 1500 USDC = 1 wETH => Max withdraw value is 1
              boosterDepositedAmount: farm.isBooster
                ? await convertFromUSDC(
                    supportedToken.tokenAddress,
                    supportedToken.decimals,
                    // here the deposited amount is in USDC
                    farmInfo.depositedAmount,
                  )
                : 0,
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
      if (farm.isBooster) {
        setPendingRewards(farm.rewards.pendingValue);
      }
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  const selectSupportedToken = supportedToken => {
    setSelectedsupportedToken(supportedToken);
  };

  const depositDivided = depositedAmount => {
    if (depositedAmount == 0) return { first: '0.0', second: '0' };
    const depositedAmountString = depositedAmount.toString();
    const dotIndex = depositedAmountString.indexOf('.');
    const balanceFirstPart = depositedAmountString.substring(0, dotIndex + 3);
    const balanceSecondPart = depositedAmountString.substring(
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
          selectedFarm.valueOf1LPinUSDC,
          selectedFarm.chain,
        )),
        pendingValue:
          selectedFarm.totalAssetSupply > 0
            ? await getBoosterFarmPendingRewards(
                selectedFarm.farmAddress,
                selectedFarm.chain,
              )
            : 0,
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

  const startBoosterWithdrawalConfirmation = async withdrawValue => {
    setShowBoosterWithdrawalConfirmation(true);
    // Losable rewards will be the pending value * % of shares to withdraw
    const projectedLosableRewards =
      selectedFarm.rewards.pendingValue *
      (+withdrawValue / +selectedSupportedToken.boosterDepositedAmount);
    setPendingRewards(
      selectedFarm.rewards.pendingValue - projectedLosableRewards,
    );
    setLosablePendingRewards(projectedLosableRewards);
  };

  const cancelBoosterWithdrawalConfirmation = async () => {
    setShowBoosterWithdrawalConfirmation(false);
    setPendingRewards(selectedFarm.rewards.pendingValue);
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
    pendingRewards,
    losablePendingRewards,
  };
};
