import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { tokenInfo, walletAccount } from 'app/common/state/atoms';
import { initialAvailableFarmsState, TFarm } from '../farm/useFarm';
import {
  getTotalAssetSupply,
  getInterest,
  getListSupportedTokens,
  getUserDepositedAmount,
} from 'app/common/functions/Web3Client';
import { useNotification } from '../useNotification';
import { useCookies } from 'react-cookie';

export type THeadingData = {
  numberOfAssets: number;
  numberOfChainsWithAssets: number;
};

export const useMain = () => {
  const [cookies] = useCookies(['has_seen_boost_farms']);
  const { resetNotification } = useNotification();
  const [walletAccountAtom] = useRecoilState(walletAccount);

  const [availableFarms, setAvailableFarms] = useState<TFarm[]>(
    initialAvailableFarmsState,
  );
  const [filter, setFilter] = useState<any>();
  const [viewType, setViewType] = useState<string>(null);
  const [allSupportedTokens, setAllSupportedTokens] = useState<string[]>([]);

  const [headingData, setHeadingData] = useState<THeadingData>();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    resetNotification();
  }, []);

  useEffect(() => {
    fetchFarmsInfo();
  }, [walletAccountAtom]);

  const fetchFarmsInfo = async () => {
    setIsLoading(true);
    try {
      let numberOfAssets = 0;
      let chainsWithAssets = new Set();
      let allSupportedTokensList = new Set<string>();

      await Promise.all(
        initialAvailableFarmsState
          .filter(x => true)
          .map(async availableFarm => {
            availableFarm.interest = await getInterest(
              availableFarm.type,
              availableFarm.chain,
            );
            availableFarm.totalAssetSupply = await getTotalAssetSupply(
              availableFarm.type,
              availableFarm.chain,
            );

            if (walletAccountAtom) {
              availableFarm.depositedAmount = await getUserDepositedAmount(
                availableFarm.type,
                availableFarm.chain,
              );
              const supportedTokenList = await getListSupportedTokens(
                availableFarm.type,
                availableFarm.chain,
              );
              supportedTokenList.forEach(supportedToken => {
                if (supportedToken.balance > 0) {
                  numberOfAssets++;
                  chainsWithAssets.add(availableFarm.chain);
                }
                allSupportedTokensList.add(supportedToken.symbol);
              });
            }
          }),
      ).then(() => {
        setHeadingData({
          numberOfAssets: numberOfAssets,
          numberOfChainsWithAssets: chainsWithAssets.size,
        });
        if (!cookies.has_seen_boost_farms) {
          availableFarms.sort(function (a, b) {
            return a.isBooster ? -1 : 1;
          });
        }
        setAvailableFarms(availableFarms);
        setAllSupportedTokens(Array.from(allSupportedTokensList));
      });
    } catch (error) {
      setError(error);
      console.log(error);
    }
    setIsLoading(false);
  };

  const showAllFarms = () => {
    setFilter(null);
    setViewType(null);
  };

  const showYourFarms = () => {
    setViewType('your');
  };

  const filterByNetwork = chain => {
    setFilter(() => farm => farm.chain == chain);
  };

  const filteredFarms = () => {
    let filteredFarms;

    filteredFarms =
      viewType == 'your'
        ? availableFarms.filter(farm => Number(farm.depositedAmount) > 0)
        : availableFarms;

    filteredFarms = filter ? filteredFarms.filter(filter) : filteredFarms;

    return filteredFarms;
  };

  return {
    isLoading,
    error,
    availableFarms: filteredFarms(),
    headingData,
    showAllFarms,
    showYourFarms,
    viewType,
    filterByNetwork,
    allSupportedTokens
  };
};
