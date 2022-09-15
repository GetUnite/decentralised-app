import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  EChain,
  getListSupportedTokens,
  getInterest,
  getTotalAssetSupply,
  getUserDepositedAmount,
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
  rewards?: TBoostFarmRewards[];
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
  {
    id: 8,
    type: 'eth',
    chain: EChain.ETHEREUM,
    name: 'ETH/StETH',
    sign: '',
    icons: [{ src: eth }, { src: steth }],
    isBooster: true,
    rewards: [
      { label: 'ETH', icon: { src: eth } },
      { label: 'CURVE.FINANCE', icon: { src: crv } },
    ],
  },
];

export const useFarm = ({ id }) => {
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);
  const navigate = useNavigate();

  const [selectedFarm, setSelectedFarm] = useState<TFarm>();
  const [selectedSupportedToken, setSelectedsupportedToken] = useState<TSelect>();

  const [availableFarms] = useState<TFarm[]>(initialAvailableFarmsState);

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
        farm.supportedTokens = await (
          await getListSupportedTokens(farm.type, farm.chain)
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
          supportedToken => supportedToken?.value == selectedSupportedToken?.value,
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

  return {
    isLoading,
    error,
    availableFarms,
    selectedFarm,
    updateFarmInfo,
    selectedSupportedToken,
    selectSupportedToken,
  };
};
