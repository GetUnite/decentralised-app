import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  EChain,
  getInterest,
  getTotalAssetSupply,
  getUserDepositedAmount,
  getSupportedTokensBasicInfo,
  getSupportedTokensAdvancedInfo,
  getBoosterFarmRewards,
  getUserDepositedLPAmount,
  getTotalAssets,
  getSupportedTokensList,
  claimBoosterFarmNonLPRewards,
  claimBoosterFarmLPRewards,
} from 'app/common/functions/Web3Client';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { useNavigate } from 'react-router-dom';
import {
  EEthereumAddresses,
  EPolygonAddresses,
} from 'app/common/constants/addresses';
import { useNotification } from '../useNotification';

import dai from 'app/modernUI/images/dai.svg';
import usdc from 'app/modernUI/images/usdc.svg';
import usdt from 'app/modernUI/images/usdt.svg';
import frax from 'app/modernUI/images/frax.svg';

import ageur from 'app/modernUI/images/ageur.png';
import eurs from 'app/modernUI/images/eurs.png';
import eurt from 'app/modernUI/images/eurt.svg';
import jeur from 'app/modernUI/images/jeur.svg';

import weth from 'app/modernUI/images/weth.png';

import wbtc from 'app/modernUI/images/wbtc.png';

export type TSelect = {
  label?: string;
  value?: string;
  decimals?: number;
  balance?: string;
  allowance?: string;
};

export type TBoostFarmRewards = {
  icons?: any[];
  label?: string;
  value?: number;
  stableLabel?: string;
  stableValue?: number;
  stableAddress?: string;
  curvePoolAddress?: string;
};

export type TFarm = {
  id: number;
  type: string;
  chain: EChain;
  name: string;
  sign: string;
  icons: any[];
  supportedTokens?: TSelect[];
  interest?: string;
  totalAssetSupply?: string | number;
  depositedAmount?: string;
  depositDividedAmount?: { first: any; second: any };
  isBooster?: boolean;
  rewards?: TBoostFarmRewards;
  farmAddress?: string;
  supportedTokensAddresses?: string[];
  poolShare?: number;
};

export const initialAvailableFarmsState: Array<TFarm> = [
  {
    id: 0,
    farmAddress: EPolygonAddresses.IBALLUOUSD,
    type: 'usd',
    chain: EChain.POLYGON,
    name: 'US Dollar',
    sign: '$',
    icons: [{ src: usdc }, { src: usdt }, { src: dai }],
  },
  {
    id: 1,
    farmAddress: EPolygonAddresses.IBALLUOEUR,
    type: 'eur',
    chain: EChain.POLYGON,
    name: 'Euro',
    sign: '€',
    icons: [{ src: eurt }, { src: eurs }, { src: jeur }],
  },
  {
    id: 2,
    farmAddress: EPolygonAddresses.IBALLUOETH,
    type: 'eth',
    chain: EChain.POLYGON,
    name: 'Ethereum',
    sign: 'Ξ',
    icons: [{ src: weth }],
  },
  {
    id: 3,
    farmAddress: EPolygonAddresses.IBALLUOBTC,
    type: 'btc',
    chain: EChain.POLYGON,
    name: 'Bitcoin',
    sign: '₿',
    icons: [{ src: wbtc }],
  },
  {
    id: 4,
    farmAddress: EEthereumAddresses.IBALLUOUSD,
    type: 'usd',
    chain: EChain.ETHEREUM,
    name: 'US Dollar',
    sign: '$',
    icons: [{ src: usdc }, { src: usdt }, { src: dai }],
  },
  {
    id: 5,
    farmAddress: EEthereumAddresses.IBALLUOEUR,
    type: 'eur',
    chain: EChain.ETHEREUM,
    name: 'Euro',
    sign: '€',
    icons: [{ src: eurt }, { src: eurs }, { src: ageur }],
  },
  {
    id: 6,
    farmAddress: EEthereumAddresses.IBALLUOETH,
    type: 'eth',
    chain: EChain.ETHEREUM,
    name: 'Ethereum',
    sign: 'Ξ',
    icons: [{ src: weth }],
  },
  {
    id: 7,
    farmAddress: EEthereumAddresses.IBALLUOBTC,
    type: 'btc',
    chain: EChain.ETHEREUM,
    name: 'Bitcoin',
    sign: '₿',
    icons: [{ src: wbtc }],
  },
  /*{
    id: 8,
    farmAddress: EEthereumAddresses.FRAXUSDCVAULT,
    type: 'booster',
    chain: EChain.ETHEREUM,
    name: 'FRAX/USDC',
    sign: '',
    icons: [{ src: frax }, { src: usdc }],
    isBooster: true,
    rewards: {
      label: 'CVX-ETH',
      icons: [{ src: frax }, { src: usdc }],
      stableLabel: 'USDC',
      stableAddress: EEthereumAddresses.USDC,
      curvePoolAddress: EEthereumAddresses.FRAXUSDCCURVEPOOL
    },
    supportedTokensAddresses: [
      EEthereumAddresses.USDC,
      EEthereumAddresses.USDT,
      EEthereumAddresses.DAI,
      EEthereumAddresses.FRAX,
      EEthereumAddresses.AGEUR,
      EEthereumAddresses.EURS,
      EEthereumAddresses.EURT,
    ],
  },*/
];

export const useFarm = ({ id }) => {
  const { setNotificationt } = useNotification();
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);
  const navigate = useNavigate();

  const [selectedFarm, setSelectedFarm] = useState<TFarm>();
  const [selectedSupportedToken, setSelectedsupportedToken] =
    useState<TSelect>();

  const [availableFarms] = useState<TFarm[]>(initialAvailableFarmsState);

  const [stableRewards, setStableRewards] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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
      interest: '10', //await getInterest(farm.type, farm.chain),
      totalAssetSupply: await getTotalAssets(farm.farmAddress, farm.chain),
      supportedTokensList: await Promise.all(
        farm.supportedTokensAddresses.map(async supportedtoken => {
          return await getSupportedTokensBasicInfo(supportedtoken, farm.chain);
        }),
      ),
      depositedAmount: 0,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmount = await getUserDepositedLPAmount(
        farm.farmAddress,
        farm.chain,
      );
      farmInfo.rewards = {
        ...farm.rewards,
        ...(await getBoosterFarmRewards(farm.farmAddress, farm.rewards.curvePoolAddress, farm.chain)),
      };
    }

    return farmInfo;
  };

  const updateFarmInfo = async farm => {
    setIsLoading(true);

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
              value: supportedToken.tokenAddress,
              balance: advancedSupportedTokenInfo.balance,
              allowance: advancedSupportedTokenInfo.allowance,
              decimals: supportedToken.decimals,
            };
          }),
        );
      }

      setSelectedsupportedToken(
        selectedSupportedToken
          ? farmInfo.supportedTokens?.find(
              supportedToken =>
                supportedToken?.value == selectedSupportedToken?.value,
            )
          : farmInfo.supportedTokens?.length > 0
          ? farmInfo.supportedTokens[0]
          : undefined,
      );

      setSelectedFarm({ ...farm, ...farmInfo });
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const selectFarm = async id => {
    try {
      const farm = availableFarms.find(availableFarm => availableFarm.id == id);
      if (!farm) {
        navigate('/');
      }
      updateFarmInfo(farm);
    } catch (error) {
      console.log(error);
    }
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

  const claimRewards = async () => {
    setError('');
    try {
      if (selectedFarm?.isBooster) {
        stableRewards
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
      setNotificationt('Rewards claimed successfully', 'success');
    } catch (err) {
      setNotificationt(err.message, 'error');
    }
  };

  return {
    isLoading,
    error,
    availableFarms,
    selectedFarm,
    updateFarmInfo,
    selectedSupportedToken,
    selectSupportedToken,
    stableRewards,
    setStableRewards,
    claimRewards,
  };
};
