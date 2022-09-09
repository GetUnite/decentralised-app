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
  const [filterType, setFilterType] = useState<string>(null);

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
      });
    } catch (error) {
      setError(error);
      console.log(error);
    }
    setIsLoading(false);
  };

  const resetFilters = () => {
    setFilter(null);
    setFilterType(null);
  };

  const filterToYourFarms = () => {
    setFilter(() => farm => farm.depositedAmount > 0);
    setFilterType('your');
  };

  return {
    isLoading,
    error,
    availableFarms: filter ? availableFarms.filter(filter) : availableFarms,
    headingData,
    resetFilters,
    filterToYourFarms,
    filterType,
  };
};
