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
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { EChain } from '../constants/chains';
import { toExactFixed } from '../functions/utils';

const possibleStableTokens = [
  'agEUR',
  'DAI',
  'EURS',
  'EURT',
  'jEUR',
  'PAR',
  'USDC',
  'USDT',
];
const possibleNonStableTokens = ['CRV', 'CVX', 'FRAX', 'WBTC', 'WETH'];
const possibleNetworks = ['Polygon', 'Ethereum'];
const possibleTypes = ['Fixed-rate farms', 'Boost farms', 'Newest farms'];

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
  const [networkFilter, setNetworkFilter] = useState<any>(possibleNetworks);
  const [tokenFilter, setTokenFilter] = useState<any>([
    ...possibleStableTokens,
    ...possibleNonStableTokens,
  ]);
  const [typeFilter, setTypeFilter] = useState<any>(possibleTypes);
  const [viewType, setViewType] = useState<string>(null);
  const [sortField, setSortField] = useState<string>(null);
  const [sortDirectionIsAsc, setSortDirectionIsAsc] = useState<boolean>(null);

  // header info
  const [assetsInfo, setAssetsInfo] = useState<TAssetsInfo>();

  // loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // misc
  const [nextVoteDay, setNextVoteDay] = useState<any>();

  useEffect(() => {
    resetNotification();
    const confirmedVoteDay = moment('2022/11/28/');

    let voteDay = confirmedVoteDay.add(2, 'weeks');
    while (voteDay < moment()) {
      voteDay.add(2, 'weeks');
    }
    setNextVoteDay(voteDay);
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
    typeFilter,
  ]);

  const fetchFarmsInfo = async () => {
    setIsLoading(true);
    try {
      const supportedTokensWithBalance = new Array<any>();

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

    filteredFarms = filteredFarms.filter(farm => {
      const supportedTokensLabels = farm.supportedTokens.map(
        supportedToken => supportedToken.label,
      );

      for (let index = 0; index < supportedTokensLabels.length; index++) {
        const label = supportedTokensLabels[index];

        if (tokenFilter.includes(label)) {
          return true;
        }
      }
      return false;
    });

    filteredFarms = filteredFarms.filter(farm => {
      return networkFilter.includes(
        farm.chain == EChain.ETHEREUM ? 'Ethereum' : 'Polygon',
      );
    });

    filteredFarms = filteredFarms.filter(farm => {
      let result = false;
      if (typeFilter.includes('Fixed-rate farms')) {
        result = result || !farm.isBooster;
      }
      if (typeFilter.includes('Boost farms')) {
        result = result || farm.isBooster;
      }
      if (typeFilter.includes('Newest farms')) {
        result = result || farm.isNewest;
      }
      return result;
    });

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
    setFilteredBoostFarms(filteredFarms.filter(farm => farm.isBooster));
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
    tokenFilter,
    setTokenFilter,
    networkFilter,
    setNetworkFilter,
    walletAccountAtom,
    sortBy,
    sortDirectionIsAsc,
    nextVoteDay,
    typeFilter,
    setTypeFilter,
    possibleStableTokens,
    possibleNonStableTokens,
    possibleNetworks,
    possibleTypes,
  };
};
