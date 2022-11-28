import {
  getBalanceOf,
  getBoosterFarmInterest,
  getChainById,
  getCurrentChainId,
  getInterest,
  getTotalAssets,
  getTotalAssetSupply,
  getUserDepositedAmount,
  getUserDepositedLPAmount,
  getValueOf1LPinUSDC
} from 'app/common/functions/web3Client';
import { isSafeApp, walletAccount } from 'app/common/state/atoms';
import { boostFarmOptions } from 'app/common/state/boostFarm';
import { farmOptions } from 'app/common/state/farm/useFarm';
import { useNotification } from 'app/common/state/useNotification';
import { TFarm } from 'app/common/types/farm';
import { TAssetsInfo } from 'app/common/types/heading';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { EChain } from '../constants/chains';
import { toExactFixed } from '../functions/utils';

export const useMain = () => {
  // atoms
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
  const [walletAccountAtom] = useRecoilState(walletAccount);

  // other state control files
  const { resetNotification } = useNotification();

  // farms
  const [availableFarms, setAvailableFarms] = useState<TFarm[]>([]);
  const [filteredFarms, setFilteredFarms] = useState<TFarm[]>();
  const [filteredBoostFarms, setFilteredBoostFarms] = useState<TFarm[]>();

  // filters
  const [networkFilter, setNetworkFilter] = useState<string>();
  const [tokenFilter, setTokenFilter] = useState<string>();
  const [viewType, setViewType] = useState<string>(null);
  const [sortField, setSortField] = useState<string>(null);
  const [sortDirectionIsAsc, setSortDirectionIsAsc] = useState<boolean>(null);
  const [allSupportedTokens, setAllSupportedTokens] = useState<string[]>([]);
  

  // header info
  const [assetsInfo, setAssetsInfo] = useState<TAssetsInfo>();

  // loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    resetNotification();
  }, []);

  useEffect(() => {
    fetchFarmsInfo();
  }, [walletAccountAtom]);

  useEffect(() => {
    filterFarms();
  }, [
    availableFarms,
    viewType,
    sortField,
    sortDirectionIsAsc,
    isSafeAppAtom,
    tokenFilter,
    networkFilter,
  ]);

  const fetchFarmsInfo = async () => {
    setIsLoading(true);
    try {
      const supportedTokensWithBalance = new Array<any>();
      const allSupportedTokens = new Set<string>();

      await Promise.all(
        [...boostFarmOptions, ...farmOptions].map(async availableFarm => {
          const {
            interest,
            totalAssetSupply,
            supportedTokens,
            depositedAmount,
            poolShare,
          } = availableFarm.isBooster
            ? await fetchBoostFarmInfo(availableFarm)
            : await fetchFarmInfo(availableFarm);

          supportedTokens.map(async supportedToken => {
            allSupportedTokens.add(supportedToken.label);
          });

          if (walletAccountAtom) {
            for (let index = 0; index < supportedTokens.length; index++) {
              supportedTokensWithBalance.push({
                ...supportedTokens[index],
                chain: availableFarm.chain,
              });
            }
          }

          availableFarm.interest = interest;
          availableFarm.totalAssetSupply = totalAssetSupply;
          availableFarm.supportedTokens = supportedTokens;
          availableFarm.depositedAmount = depositedAmount;
          availableFarm.poolShare = poolShare;

          return availableFarm;
        }),
      ).then(async mappedFarms => {
        let numberOfAssets = 0;
        let chainsWithAssets = new Set();

        if (walletAccountAtom) {
          const uniqueSupportedTokensWithBalance =
            supportedTokensWithBalance.filter(
              (value, index, self) =>
                index ===
                self.findIndex(
                  t => t.address === value.address && t.chain === value.chain,
                ),
            );

          await Promise.all(
            uniqueSupportedTokensWithBalance.map(
              async supportedTokenWithBalance => {
                const balance = await getBalanceOf(
                  supportedTokenWithBalance.address,
                  supportedTokenWithBalance.decimals,
                  supportedTokenWithBalance.chain,
                );
                if (+toExactFixed(balance, 2) > 0) {
                  numberOfAssets++;
                  chainsWithAssets.add(supportedTokenWithBalance.chain);
                }
              },
            ),
          );
        }
        setAssetsInfo({
          numberOfAssets: numberOfAssets,
          numberOfChainsWithAssets: chainsWithAssets.size,
        });
        setAvailableFarms(mappedFarms);
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
      supportedTokens: farm.supportedTokens,
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
              (+farmInfo.depositedAmount / +farmInfo.totalAssetSupply) * 100,
              2,
            )
          : 0;
    }

    return farmInfo;
  };

  const fetchBoostFarmInfo = async farm => {
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
      supportedTokens: farm.supportedTokens,
      depositedAmount: 0,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmountInLP = await getUserDepositedLPAmount(
        farm.farmAddress,
        farm.chain,
      );
      // Let's use the depositedAmount to store the deposited amount in USD(C)
      // The amount deposited is (the amount deposited in LP) * (LP to USDC conversion rate)
      farmInfo.depositedAmount = toExactFixed(
        farmInfo.depositedAmountInLP * valueOf1LPinUSDC,
        2,
      );

      farmInfo.poolShare =
        farmInfo.depositedAmount > 0
          ? toExactFixed(
              (+farmInfo.depositedAmount / +farmInfo.totalAssetSupply) * 100,
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

  const sortBy = (field, isAsc) => {
    setSortField(field);
    setSortDirectionIsAsc(isAsc);
  };

  const filterFarms = async () => {
    let filteredFarms;

    filteredFarms =
      viewType == 'your'
        ? availableFarms.filter(farm => +farm.depositedAmount > 0)
        : availableFarms;

    filteredFarms = tokenFilter
      ? filteredFarms.filter(farm =>
          farm.supportedTokens
            .map(supportedToken => supportedToken.label)
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

    if (sortField) {
      switch (sortField) {
        case 'apy':
          filteredFarms = filteredFarms.sort(function (a, b) {
            return sortDirectionIsAsc
              ? +b.interest > +a.interest
                ? 1
                : -1
              : +a.interest > +b.interest
              ? 1
              : -1;
          });
          break;

        case 'pool share':
          filteredFarms = filteredFarms.sort(function (a, b) {
            return sortDirectionIsAsc
              ? +b.poolShare > +a.poolShare
                ? 1
                : -1
              : +a.poolShare > +b.poolShare
              ? 1
              : -1;
          });
          break;

        case 'balance':
          filteredFarms = filteredFarms.sort(function (a, b) {
            return sortDirectionIsAsc
              ? +b.balance > +a.balance
                ? 1
                : -1
              : +a.balance > +b.balance
              ? 1
              : -1;
          });
          break;

        default:
          break;
      }
    }

    if (isSafeAppAtom && walletAccountAtom) {
      const chainId = await getCurrentChainId();
      const chain = await getChainById(chainId);

      filteredFarms = filteredFarms.filter(farm => farm.chain == chain);
    }

    setFilteredFarms(filteredFarms.filter(farm => !farm.isBooster));
    setFilteredBoostFarms(filteredFarms.filter(farm => farm.isBooster))
  };

  return {
    isLoading,
    error,
    filteredFarms,
    filteredBoostFarms,
    assetsInfo,
    showAllFarms,
    showYourFarms,
    viewType,
    allSupportedTokens,
    tokenFilter,
    setTokenFilter,
    networkFilter,
    setNetworkFilter,
    walletAccountAtom,
    sortBy,
    sortDirectionIsAsc,
  };
};
