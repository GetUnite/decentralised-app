import {
  EEthereumAddresses,
  EPolygonAddresses
} from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import { depositDivided } from 'app/common/functions/utils';
import {
  getInterest,
  getSupportedTokensAdvancedInfo, getSupportedTokensList, getTotalAssetSupply,
  getUserDepositedAmount
} from 'app/common/functions/web3Client';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { TFarm } from 'app/common/types/farm';
import { TSupportedToken } from 'app/common/types/global';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

export const farmOptions: Array<TFarm> = [
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

  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // other state control files
  const { setNotification } = useNotification();

  // selected farm control
  const [availableFarms] = useState<TFarm[]>(farmOptions);
  const [selectedFarm, setSelectedFarm] = useState<TFarm>();
  const [selectedSupportedToken, setSelectedsupportedToken] =
    useState<TSupportedToken>();

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (walletAccountAtom && selectedFarm) {
      setWantedChainAtom(selectedFarm.chain);
    }
  }, [walletAccountAtom, selectedFarm]);

  useEffect(() => {
    selectFarm(id);
  }, [walletAccountAtom]);

  useEffect(() => {
    if (walletAccountAtom && selectedFarm) {
      //here update the actual selected token.
    }
  }, [selectedSupportedToken]);

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
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  const selectSupportedToken = supportedToken => {
    setSelectedsupportedToken(supportedToken);
  };

  return {
    isLoading,
    availableFarms,
    selectedFarm,
    updateFarmInfo,
    selectedSupportedToken,
    selectSupportedToken,
  };
};
