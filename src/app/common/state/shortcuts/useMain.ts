import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { tokenInfo, walletAccount } from 'app/common/state/atoms';
import { initialAvailableFarmsState, TFarm } from '../farm/useFarm';
import {
  getTotalAssetSupply,
  getTokenInfo,
  getInterest,
  getListSupportedTokens,
  getUserDepositedAmount,
} from 'app/common/functions/Web3Client';
import { useNotification } from '../useNotification';
import { useCookies } from 'react-cookie';

export type Tbalance = {
  balance: number;
  type: string;
  sign: string;
};

export const useMain = () => {
  const [cookies] = useCookies(['has_seen_boost_farms']);
  const { resetNotification } = useNotification();
  const [walletAccountAtom, setWalletAccountAtom] =
    useRecoilState(walletAccount);
  const [tokenInfoAtom, setTokenInfoAtom] = useRecoilState(tokenInfo);

  const [availableFarms, setAvailableFarms] = useState<TFarm[]>(
    initialAvailableFarmsState,
  );
  const [filter, setFilter] = useState<any>();

  const [stablesBalances, setStablesBalances] = useState<Tbalance[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    resetNotification();
  }, []);

  useEffect(() => {
    fetchFarmsInfo();
    setAccountInformation();
  }, [walletAccountAtom]);

  const fetchFarmsInfo = async () => {
    setIsLoading(true);
    try {
      let stablesBalancesArray = [];
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
              let balance = (
                await getListSupportedTokens(
                  availableFarm.type,
                  availableFarm.chain,
                )
              ).reduce((accumulator, stable) => {
                return accumulator + Number(stable.balance);
              }, 0);
              let typeBalance = stablesBalancesArray.find(
                stable => stable.type == availableFarm.type,
              );
              if (!typeBalance) {
                typeBalance = {
                  type: availableFarm.type,
                  balance: 0,
                  sign: availableFarm.sign,
                };
                stablesBalancesArray.push(typeBalance);
              }
              typeBalance.balance += balance;
            }
          }),
      ).then(() => {
        setStablesBalances(stablesBalancesArray);
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

  const setAccountInformation = async () => {
    setTokenInfoAtom({
      isLoading: true,
    });

    const tokenInfoData = await getTokenInfo(walletAccountAtom);

    setTokenInfoAtom(tokenInfoData);
  };

  const resetFilters = () => {
    setFilter(null);
  };

  const filterToOwnFarms = () => {
    setFilter(() => farm => farm.depositedAmount > 0);
  };

  return {
    isLoading,
    error,
    availableFarms: filter ? availableFarms.filter(filter) : availableFarms,
    stablesBalances,
    resetFilters,
    filterToOwnFarms,
  };
};
