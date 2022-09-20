import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  EChain,
  getListSupportedTokens,
  getInterest,
  getTotalAssetSupply,
  getUserDepositedAmount,
  getSupportedTokensBasicInfo,
  getSupportedTokensAdvancedInfo,
  getBoosterFarmRewards,
  claimBoosterFarmRewards,
} from 'app/common/functions/Web3Client';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { useNavigate } from 'react-router-dom';

import dai from 'app/modernUI/images/dai.svg';
import usdc from 'app/modernUI/images/usdc.svg';
import usdt from 'app/modernUI/images/usdt.svg';

import ageur from 'app/modernUI/images/ageur.png';
import eurs from 'app/modernUI/images/eurs.png';
import eurt from 'app/modernUI/images/eurt.svg';
import jeur from 'app/modernUI/images/jeur.svg';

import weth from 'app/modernUI/images/weth.png';

import wbtc from 'app/modernUI/images/wbtc.png';

import crv from 'app/modernUI/images/crv.svg';
import eth from 'app/modernUI/images/eth.svg';
import steth from 'app/modernUI/images/steth.svg';
import { EEthereumAddresses } from 'app/common/constants/addresses';
import { useNotification } from '../useNotification';

export type TSelect = {
  label?: string;
  value?: string;
  decimals?: number;
  balance?: string;
  allowance?: string;
};

export type TBoostFarmRewards = {
  icon?: any;
  label?: string;
  value?: number;
  stableLabel?:string;
  stableValue?: number;
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
};

export const initialAvailableFarmsState: Array<TFarm> = [
  {
    id: 0,
    type: 'usd',
    chain: EChain.POLYGON,
    name: 'US Dollar',
    sign: '$',
    icons: [{ src: usdc }, { src: usdt }, { src: dai }],
  },
  {
    id: 1,
    type: 'eur',
    chain: EChain.POLYGON,
    name: 'Euro',
    sign: '€',
    icons: [{ src: eurt }, { src: eurs }, { src: jeur }],
  },
  {
    id: 2,
    type: 'eth',
    chain: EChain.POLYGON,
    name: 'Ethereum',
    sign: 'Ξ',
    icons: [{ src: weth }],
  },
  {
    id: 3,
    type: 'btc',
    chain: EChain.POLYGON,
    name: 'Bitcoin',
    sign: '₿',
    icons: [{ src: wbtc }],
  },
  {
    id: 4,
    type: 'usd',
    chain: EChain.ETHEREUM,
    name: 'US Dollar',
    sign: '$',
    icons: [{ src: usdc }, { src: usdt }, { src: dai }],
  },
  {
    id: 5,
    type: 'eur',
    chain: EChain.ETHEREUM,
    name: 'Euro',
    sign: '€',
    icons: [{ src: eurt }, { src: eurs }, { src: ageur }],
  },
  {
    id: 6,
    type: 'eth',
    chain: EChain.ETHEREUM,
    name: 'Ethereum',
    sign: 'Ξ',
    icons: [{ src: weth }],
  },
  {
    id: 7,
    type: 'btc',
    chain: EChain.ETHEREUM,
    name: 'Bitcoin',
    sign: '₿',
    icons: [{ src: wbtc }],
  },
  /*{
    id: 8,
    type: 'eth',
    chain: EChain.ETHEREUM,
    name: 'ETH/StETH',
    sign: '',
    icons: [{ src: eth }, { src: steth }],
    isBooster: true,
    rewards: { label: 'CVX-ETH' },
    farmAddress: EEthereumAddresses.FRAXUSDCVAULT,
    supportedTokensAddresses: [
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', //WETH
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', //USDC
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
    try {
      farm.interest = await getInterest(farm.type, farm.chain);
      farm.totalAssetSupply = await getTotalAssetSupply(farm.type, farm.chain);
      if (walletAccountAtom) {
        farm.supportedTokens = (
          Array.isArray(farm.supportedTokensAddresses) &&
          farm.supportedTokensAddresses.length > 0
            ? await Promise.all(
                farm.supportedTokensAddresses.map(async supportedtoken => {
                  const supportedTokenBasicInfo =
                    await getSupportedTokensBasicInfo(
                      supportedtoken,
                      farm.chain,
                    );
                  const supportedTokenAdvancedInfo =
                    await getSupportedTokensAdvancedInfo(
                      supportedTokenBasicInfo,
                      farm.type,
                      farm.chain,
                    );

                  return {
                    ...supportedTokenBasicInfo,
                    ...supportedTokenAdvancedInfo,
                  };
                }),
              )
            : await getListSupportedTokens(farm.type, farm.chain)
        ).map(supportedToken => {
          return {
            label: supportedToken.symbol,
            value: supportedToken.tokenAddress,
            balance: supportedToken.balance,
            allowance: supportedToken.allowance,
            decimals: supportedToken.decimals,
          };
        });
        farm.depositedAmount = await getUserDepositedAmount(
          farm.type,
          farm.chain,
        );
        farm.depositDividedAmount = depositDivided(farm.depositedAmount);
        if (farm.isBooster) {
          //farm.rewards = getBoosterFarmRewards(farm.farmAddress);
          farm.rewards = {
            label: "CVX-ETH",
            stableLabel: "USDC",
            stableValue: 150,
            value: 10,
          }
        }
      }
    } catch (error) {
      setError(error);
      console.log(error);
    }
    return farm;
  };

  const updateFarmInfo = async () => {
    try {
      const farm = await fetchFarmInfo(selectedFarm);
      setSelectedsupportedToken(
        farm.supportedTokens?.find(
          supportedToken =>
            supportedToken?.value == selectedSupportedToken?.value,
        ),
      );
      setSelectedFarm(farm);
    } catch (error) {
      console.log(error);
    }
  };

  const selectFarm = async id => {
    setIsLoading(true);
    try {
      const farm = await fetchFarmInfo(
        availableFarms.find(availableFarm => availableFarm.id == id),
      );
      if (!farm) {
        navigate('/');
      }
      setSelectedFarm(farm);
      selectSupportedToken(
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

  const claimRewards = async () => {
    setError('');
    try {
      if (selectedFarm?.isBooster) {
        await claimBoosterFarmRewards(
          selectedFarm.farmAddress,
          selectedSupportedToken.value,
          selectedFarm,
          selectedSupportedToken.decimals,
          selectedFarm.chain,
        );
      }
      await updateFarmInfo();
      setNotificationt('Deposit successfully', 'success');
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
    claimRewards
  };
};
