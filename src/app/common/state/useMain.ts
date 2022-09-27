import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { walletAccount } from 'app/common/state/atoms';
import { initialAvailableFarmsState, TFarm } from './farm/useFarm';
import {
  getTotalAssetSupply,
  getInterest,
  getSupportedTokensAdvancedInfo,
  getUserDepositedAmount,
  getSupportedTokensList,
  getSupportedTokensBasicInfo,
  getTotalAssets,
  getUserDepositedLPAmount,
  getBoosterFarmInterest,
} from 'app/common/functions/web3Client';
import { useNotification } from './useNotification';
import { useCookies } from 'react-cookie';
import { toExactFixed } from '../functions/utils';
import { EChain } from '../constants/chains';

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
  const [networkFilter, setNetworkFilter] = useState<string>();
  const [tokenFilter, setTokenFilter] = useState<string>();
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
      let allSupportedTokens = new Set<string>();

      await Promise.all(
        initialAvailableFarmsState
          .filter(x => true)
          .map(async availableFarm => {
            const {
              interest,
              totalAssetSupply,
              supportedTokens,
              depositedAmount,
              poolShare,
            } = availableFarm.isBooster
              ? await fetchBoosterFarmInfo(availableFarm)
              : await fetchFarmInfo(availableFarm);

            supportedTokens.map(async supportedToken => {
              allSupportedTokens.add(supportedToken.symbol);
            });

            if (walletAccountAtom) {
              supportedTokens.map(async supportedToken => {
                const advancedSupportedTokenInfo =
                  await getSupportedTokensAdvancedInfo(
                    availableFarm.farmAddress,
                    supportedToken,
                    availableFarm.chain,
                  );
                if (Number(advancedSupportedTokenInfo.balance) > 0) {
                  numberOfAssets++;
                  chainsWithAssets.add(availableFarm.chain);
                }
              });
            }

            availableFarm.interest = interest;
            availableFarm.totalAssetSupply = totalAssetSupply;
            availableFarm.supportedTokens = supportedTokens;
            availableFarm.depositedAmount = depositedAmount;
            availableFarm.poolShare = poolShare;
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
        setAllSupportedTokens(Array.from(allSupportedTokens));
      });
    } catch (error) {
      setError(error);
      console.log(error);
    }
    setIsLoading(false);
  };

  const fetchFarmInfo = async farm => {
    let farmInfo;
    farmInfo = {
      interest: await getInterest(farm.type, farm.chain),
      totalAssetSupply: await getTotalAssetSupply(farm.type, farm.chain),
      supportedTokens: await getSupportedTokensList(farm.type, farm.chain),
      depositedAmount: 0,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmount = toExactFixed(
        await getUserDepositedAmount(farm.type, farm.chain),
        4,
      );
      farmInfo.poolShare =
        farmInfo.depositedAmount > 0
          ? toExactFixed(
              Number(farmInfo.depositedAmount) /
                Number(farmInfo.totalAssetSupply),
              2,
            )
          : 0;
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
      supportedTokens: await Promise.all(
        farm.supportedTokensAddresses.map(async supportedtoken => {
          return await getSupportedTokensBasicInfo(supportedtoken, farm.chain);
        }),
      ),
      depositedAmount: 0,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmount = toExactFixed(
        await getUserDepositedLPAmount(farm.farmAddress, farm.chain),
        4,
      );
      farmInfo.poolShare =
        farmInfo.depositedAmount > 0
          ? toExactFixed(
              Number(farmInfo.depositedAmount) /
                Number(farmInfo.totalAssetSupply),
              2,
            )
          : 0;
    }

    return farmInfo;
  };

  const showAllFarms = () => {
    setNetworkFilter(null);
    setTokenFilter(null);
    setViewType(null);
  };

  const showYourFarms = () => {
    setViewType('your');
  };

  const filteredFarms = () => {
    let filteredFarms;

    filteredFarms =
      viewType == 'your'
        ? availableFarms.filter(farm => Number(farm.depositedAmount) > 0)
        : availableFarms;

    filteredFarms = tokenFilter
      ? filteredFarms.filter(farm =>
          farm.supportedTokens
            .map(supportedToken => supportedToken.symbol)
            .includes(tokenFilter),
        )
      : filteredFarms;

    filteredFarms = networkFilter
      ? filteredFarms.filter(
          farm =>
            farm.chain ==
            (networkFilter == 'Ethereum' ? EChain.ETHEREUM : EChain.POLYGON),
        )
      : filteredFarms;

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
    allSupportedTokens,
    tokenFilter,
    setTokenFilter,
    networkFilter,
    setNetworkFilter,
  };
};
