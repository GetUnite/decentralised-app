import {
  getBalanceOf,
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
import { TFarm } from 'app/common/types/farm';
import { TAssetsInfo } from 'app/common/types/heading';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { EChain } from '../constants/chains';
import { getBoostFarmInterest } from '../functions/boostFarm';
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
const possibleViewTypes = ['View my farms only', 'View all farms'];

export const useMain = () => {
  // atoms
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
  const [walletAccountAtom] = useRecoilState(walletAccount);

  // farms
  const [availableFarms, setAvailableFarms] = useState<TFarm[]>([
    ...boostFarmOptions,
    ...farmOptions,
  ]);
  const [filteredFarms, setFilteredFarms] = useState<TFarm[]>([
    ...boostFarmOptions,
    ...farmOptions,
  ]);
  const [filteredBoostFarms, setFilteredBoostFarms] = useState<TFarm[]>();

  // filters
  const [networkFilter, setNetworkFilter] = useState<any>(possibleNetworks);
  const [tokenFilter, setTokenFilter] = useState<any>([
    ...possibleStableTokens,
    ...possibleNonStableTokens,
  ]);
  const [typeFilter, setTypeFilter] = useState<any>(possibleTypes);
  const [viewType, setViewType] = useState<string>('View all farms');
  const [sortField, setSortField] = useState<string>(null);
  const [sortDirectionIsAsc, setSortDirectionIsAsc] = useState<boolean>(null);

  // header info
  const [assetsInfo, setAssetsInfo] = useState<TAssetsInfo>();

  // loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const location = useLocation();

  useEffect(() => {
    fetchFarmsInfo();
    if (walletAccountAtom && location.search.includes('view_type=my_farms')) {
      setViewType('View my farms only');
    }
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
          } = availableFarm.isBoost
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
                if (+balance > 0) {
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
    // We can probably get away with calculating total value invested in usd after showing the first screen
    let totalDepositedAmountInUsd = 0;
    const farmsWithDepositedAmount = availableFarms.filter(
      farm => +farm.depositedAmount > 0,
    );
    for (let index = 0; index < farmsWithDepositedAmount.length; index++) {
      const farm = farmsWithDepositedAmount[index];

      if (farm.isBoost) {
        totalDepositedAmountInUsd =
          totalDepositedAmountInUsd + +farm.depositedAmount;
      } else {
        //const assetValue = await converToAssetValue(farm.farmAddress, farm.depositedAmount, farm.chain);
        //const valueOfAssetInUSDC = getPrice(farm.underlyingTokenAddress, farm.chain == EChain.ETHEREUM ? EEthereumAddresses.USDC : EPolygonAddresses. USDC)
      }
    }
  };

  const fetchFarmInfo = async farm => {
    let farmInfo;
    farmInfo = {
      interest: await getInterest(farm.farmAddress, farm.chain),
      totalAssetSupply: await getTotalAssetSupply(farm.farmAddress, farm.chain),
      supportedTokens: farm.supportedTokens,
      depositedAmount: 0,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmount = await getUserDepositedAmount(
        farm.farmAddress,
        farm.chain,
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
      interest: await getBoostFarmInterest(
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

  const sortBy = (field, isAsc) => {
    setSortField(field);
    setSortDirectionIsAsc(isAsc);
  };

  const filterFarms = async () => {
    let filteredFarms;

    filteredFarms =
      viewType == 'View my farms only'
        ? availableFarms.filter(farm => +farm.depositedAmount > 0.00001)
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
        result = result || !farm.isBoost;
      }
      if (typeFilter.includes('Boost farms')) {
        result = result || farm.isBoost;
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
              ? +b.depositedAmount > +a.depositedAmount
                ? 1
                : -1
              : +a.depositedAmount > +b.depositedAmount
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

    setFilteredFarms(filteredFarms.filter(farm => !farm.isBoost));
    setFilteredBoostFarms(filteredFarms.filter(farm => farm.isBoost));
  };

  return {
    isLoading,
    error,
    filteredFarms,
    filteredBoostFarms,
    assetsInfo,
    viewType,
    tokenFilter,
    setTokenFilter,
    networkFilter,
    setNetworkFilter,
    walletAccountAtom,
    sortBy,
    sortDirectionIsAsc,
    typeFilter,
    setTypeFilter,
    possibleStableTokens,
    possibleNonStableTokens,
    possibleNetworks,
    possibleTypes,
    possibleViewTypes,
    setViewType,
  };
};
