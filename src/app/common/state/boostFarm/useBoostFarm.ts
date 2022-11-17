import { EEthereumAddresses } from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import {
  convertFromUSDC,
  getBoosterFarmPendingRewards,
  getBoosterFarmRewards,
  getValueOf1LPinUSDC
} from 'app/common/functions/farm';
import { depositDivided } from 'app/common/functions/utils';
import {
  claimBoosterFarmLPRewards,
  claimBoosterFarmNonLPRewards,
  getBoosterFarmInterest,
  getSupportedTokensAdvancedInfo,
  getSupportedTokensBasicInfo,
  getTotalAssets,
  getUserDepositedLPAmount
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
    apyFarmAddresses: {
      baseApyAddress: 'bd072651-d99c-4154-aeae-51f12109c054',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
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
    apyFarmAddresses: {
      baseApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
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
    lowSlippageTokenLabels: [
      //'stETH',
      'wETH',
    ],
    apyFarmAddresses: {
      baseApyAddress: '5ce23e7e-3800-4c9c-ad30-6db3db0515a1',
      boostApyAddress: '25d9dc49-3182-493a-bda4-0db53b25f457',
    },
  },
];

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
  const [seeRewardsAsStable, setSeeRewardsAsStable] = useState<boolean>(false);

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClamingRewards, setIsClamingRewards] = useState<boolean>(false);
  const [isLoadingRewards, setIsLoadingRewards] = useState<boolean>(false);

  // information/confirmation control
  const showBoosterFarmPresentation =
    selectedFarm?.isBooster && !cookies.has_seen_boost_farms;

  const previousHarvestDate = moment().subtract(1, 'days').day('Monday');
  const nextHarvestDate = moment()
    .subtract(1, 'days')
    .add(1, 'week')
    .day('Monday');
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

  const updateFarmInfo = async () => {
    setIsLoading(true);
    try {
      const farm = await getUpdatedFarmInfo(selectedFarm);
      setSelectedsupportedToken(
        farm.supportedTokens?.find(
          stableCoin => stableCoin?.address == selectedSupportedToken?.address,
        ),
      );
      setPendingRewards(farm.rewards.pendingValue);
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
        interest: await getBoosterFarmInterest(
          farm.farmAddress,
          farm.apyFarmAddresses,
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
        farmInfo.depositDividedAmount = depositDivided(
          farmInfo.depositedAmount,
        );
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
              boosterDepositedAmount: await convertFromUSDC(
                supportedToken.tokenAddress,
                supportedToken.decimals,
                // here the deposited amount is in USDC
                farmInfo.depositedAmount,
              ),
            } as TSupportedToken;
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
      setPendingRewards(farm.rewards.pendingValue);
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  const selectSupportedToken = supportedToken => {
    setSelectedsupportedToken(supportedToken);
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
      setNotification('Rewards claimed successfully', 'success');
    } catch (error) {
      setNotification(error, 'error');
    }
    setIsClamingRewards(false);
  };

  const startBoosterWithdrawalConfirmation = async withdrawValue => {
    setShowBoosterWithdrawalConfirmation(true);
    // Losable rewards will be the pending value * % of shares to withdraw
    const projectedLosableRewards =
      selectedFarm.rewards.pendingValue *
      (+withdrawValue / +selectedSupportedToken.boosterDepositedAmount);
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
