import {
  getBalance,
  getBalanceOf,
  getChainById,
  getCurrentChainId,
  getInterest,
  getPrice,
  getTotalAssets,
  getTotalAssetSupply,
  getValueOf1LPinUSDC
} from 'app/common/functions/web3Client';
import { isSafeApp, walletAccount, wantedChain } from 'app/common/state/atoms';
import { boostFarmOptions } from 'app/common/state/boostFarm';
import { farmOptions } from 'app/common/state/farm/useFarm';
import { TBoostFarmRewards, TFarm } from 'app/common/types/farm';
import { TAssetsInfo } from 'app/common/types/heading';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
  EEthereumAddresses,
  EOptimismAddresses,
  EPolygonAddresses
} from '../constants/addresses';
import { EChain } from '../constants/chains';
import {
  claimBoostFarmLPRewards,
  claimBoostFarmNonLPRewards,
  claimLockedBoostFarmRewards,
  getBoostFarmInterest,
  getBoostFarmRewards
} from '../functions/boostFarm';
import { fromLocaleString, toExactFixed } from '../functions/utils';
import { useNotification } from './useNotification';
import { optimisedFarmOptions } from './optimisedFarm';

const possibleStableTokens = [
  'DAI',
  // 'agEUR',
  // 'EURS',
  'EURT',
  'jEUR',
  'PAR',
  'USDC',
  'USDT',
];
const possibleNonStableTokens = ['CRV', 'CVX', 'FRAX', 'WBTC', 'WETH'];
const possibleNetworks = ['Polygon', 'Ethereum', 'Optimism'];
const possibleTypes = ['Fixed-rate farms', 'Boost farms', 'Optimised farms', 'Newest farms'];
const possibleViewTypes = ['View my farms only', 'View all farms'];

export const useMain = () => {
  // react
  const location = useLocation();

  // atoms
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // other state control files
  const { setNotification } = useNotification();

  // farms
  const [availableFarms, setAvailableFarms] = useState<TFarm[]>([
    ...optimisedFarmOptions,
    ...boostFarmOptions,
    ...farmOptions,
  ]);
  const [filteredFarms, setFilteredFarms] = useState<TFarm[]>([
    ...optimisedFarmOptions,
    ...boostFarmOptions,
    ...farmOptions,
  ]);
  const [filteredBoostFarms, setFilteredBoostFarms] = useState<TFarm[]>();
  const [filteredOptimisedFarms, setFilteredOptimisedFarms] = useState<TFarm[]>();
  const [totalDepositedAmountInUsd, setTotalDepositedAmountInUsd] =
    useState<string>();
  const [rewardsInfo, setRewardsInfo] = useState<TBoostFarmRewards[]>([]);

  // filters
  const shouldFilter = useRef(true);
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

  useEffect(() => {
    setWantedChainAtom(undefined);
    fetchFarmsInfo();
    const today = new Date();
    if (today.getDay() === 0) {
      setNotification(
        '🔒 Boost farm deposits and withdrawals will be actioned today ⏰',
        'warning',
        undefined,
        undefined,
        true,
      );
    }
  }, [walletAccountAtom]);

  useEffect(() => {
    //if (shouldFilter.current == true) {
    filterFarms();
    //}
  }, [
    availableFarms,
    viewType,
    sortField,
    sortDirectionIsAsc,
    isSafeAppAtom,
    networkFilter,
    typeFilter,
    tokenFilter,
  ]);

  const fetchFarmsInfo = async () => {
    setIsLoading(true);
    try {
      const supportedTokensWithBalance = new Array<any>();

      await Promise.all(
        [...boostFarmOptions, ...optimisedFarmOptions, ...farmOptions].map(async availableFarm => {
          const {
            interest,
            totalAssetSupply,
            supportedTokens,
            depositedAmount,
            depositedAmountInLP,
            depositedAmountInUSD,
            poolShare,
          } = availableFarm.isBoost
              ? await fetchBoostFarmInfo(availableFarm)
              : (availableFarm.isOptimised ? await fetchOptimisedFarmInfo(availableFarm) : await fetchFarmInfo(availableFarm));

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
          availableFarm.depositedAmountInLP = depositedAmountInLP;
          availableFarm.depositedAmountInUSD = depositedAmountInUSD;
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

    if (walletAccountAtom) {
      if (location.search.includes('view_type=my_farms')) {
        setViewType('View my farms only');
      }
      // We can probably get away with calculating total value invested in usd after showing the first screen
      let tdaiu = 0;
      const farmsWithDepositedAmount = availableFarms.filter(
        farm => +farm.depositedAmount > 0,
      );
      for (let index = 0; index < farmsWithDepositedAmount.length; index++) {
        const farm = farmsWithDepositedAmount[index];

        if (farm.isBoost) {
          tdaiu = tdaiu + +farm.depositedAmount;
        } else {
          tdaiu = tdaiu + +farm.depositedAmountInUSD;
        }
      }
      setTotalDepositedAmountInUsd(toExactFixed(tdaiu, 2));

      // Also, check each boost farm rewards to show on the "view your farms" page
      const CVXETHInUSDC = await getValueOf1LPinUSDC(
        EEthereumAddresses.CVXETH,
        EChain.ETHEREUM,
      );

      let ri = [];
      for (let index = 0; index < availableFarms.length; index++) {
        const farm = availableFarms[index];
        if (farm.isBoost) {
          const updatedRewards = {
            ...(await getBoostFarmRewards(
              farm.farmAddress,
              CVXETHInUSDC,
              EChain.ETHEREUM,
            )),
          };
          const rewardsAsNumber = fromLocaleString(updatedRewards.value);
          if (rewardsAsNumber > 0.00001) {
            const rewardsInUSD = rewardsAsNumber * CVXETHInUSDC;

            const monthProjection =
              (Number(farm.depositedAmount) *
                (Math.pow(1 + Number(farm.interest) / 100, 1 / 12) - 1) +
                rewardsInUSD) /
              CVXETHInUSDC;

            const yearProjection =
              (Number(farm.depositedAmount) *
                (Math.pow(1 + Number(farm.interest) / 100, 1) - 1) +
                rewardsInUSD) /
              CVXETHInUSDC;

            ri.push({
              farmAddress: farm.farmAddress,
              name: farm.name,
              isBoost: farm.isBoost,
              isLocked: farm.isLocked,
              ...updatedRewards,
              interest: farm.interest,
              monthProjection: toExactFixed(monthProjection, 8),
              yearProjection: toExactFixed(yearProjection, 8),
              stableMonthProjection: toExactFixed(
                monthProjection * CVXETHInUSDC,
                2,
              ),
              stableYearProjection: toExactFixed(
                yearProjection * CVXETHInUSDC,
                2,
              ),
            });
          }
        }
        setRewardsInfo(ri);
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
      const depositedAmount = await getBalance(
        farm.farmAddress,
        farm.chain,
      );
      farmInfo.depositedAmount = depositedAmount;

      let valueOfAssetInUSDC;
      // if the underlying is usdc no need for price
      if (
        farm.underlyingTokenAddress == EPolygonAddresses.USDC ||
        farm.underlyingTokenAddress == EEthereumAddresses.USDC ||
        farm.underlyingTokenAddress == EOptimismAddresses.USDC
      ) {
        valueOfAssetInUSDC = 1;
      } else {
        let tokenPriceAddress;
        let tokenDecimals = 18;
        // for polygon and OP underlying tokens just use the equivalent ethereum addresses to get the price. It should always be equal.
        switch (farm.underlyingTokenAddress) {
          case EPolygonAddresses.WBTC:
            tokenPriceAddress = EEthereumAddresses.WBTC;
            tokenDecimals = 8;
            break;
          case EPolygonAddresses.WETH:
            tokenPriceAddress = EEthereumAddresses.WETH;
            break;
          case EOptimismAddresses.WBTC:
            tokenPriceAddress = EEthereumAddresses.WBTC;
            tokenDecimals = 8;
            break;
          case EOptimismAddresses.WETH:
            tokenPriceAddress = EEthereumAddresses.WETH;
            break;
          case EEthereumAddresses.EURT:
            tokenPriceAddress = EEthereumAddresses.EURT;
            tokenDecimals = 6;
            break;
          default:
            tokenPriceAddress = farm.underlyingTokenAddress;
            break;
        }
        valueOfAssetInUSDC = await getPrice(
          tokenPriceAddress,
          EEthereumAddresses.USDC,
          tokenDecimals,
          6,
        );
      }

      farmInfo.depositedAmountInUSD =
        +farmInfo.depositedAmount * valueOfAssetInUSDC;

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
      interest: farm.forcedInterest
        ? farm.forcedInterest
        : await getBoostFarmInterest(
          farm.farmAddress,
          farm.apyFarmAddresses,
          farm.chain,
        ),
      totalAssetSupply:
        +(await getTotalAssets(farm.farmAddress, farm.chain)) *
        valueOf1LPinUSDC,
      supportedTokens: farm.supportedTokens,
      valueOf1LPinUSDC: valueOf1LPinUSDC,
    };
    if (walletAccountAtom) {
      const depositedAmountInLP = await getBalanceOf(
        farm.farmAddress,
        undefined,
        farm.chain,
      );
      farmInfo.depositedAmountInLP = depositedAmountInLP;
      // Let's use the depositedAmount to store the deposited amount in USD(C)
      // The amount deposited is (the amount deposited in LP) * (LP to USDC conversion rate)
      farmInfo.depositedAmount = +depositedAmountInLP * valueOf1LPinUSDC;

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

  const fetchOptimisedFarmInfo = async farm => {
    let farmInfo;
    farmInfo = {
      interest: await getInterest(farm.farmAddress, farm.chain),
      totalAssetSupply: await getTotalAssetSupply(farm.farmAddress, farm.chain),
      supportedTokens: farm.supportedTokens,
      depositedAmount: 0,
    };
    if (walletAccountAtom) {
      const depositedAmount = await getBalanceOf(
        farm.farmAddress,
        undefined,
        farm.chain,
      );
      farmInfo.depositedAmount = depositedAmount;

      let valueOfAssetInUSDC;
      // if the underlying is usdc no need for price
      if (
        farm.underlyingTokenAddress == EPolygonAddresses.USDC ||
        farm.underlyingTokenAddress == EEthereumAddresses.USDC ||
        farm.underlyingTokenAddress == EOptimismAddresses.USDC
      ) {
        valueOfAssetInUSDC = 1;
      } else {
        let tokenPriceAddress;
        let tokenDecimals = 18;
        // for polygon and OP underlying tokens just use the equivalent ethereum addresses to get the price. It should always be equal.
        switch (farm.underlyingTokenAddress) {
          case EPolygonAddresses.WBTC:
            tokenPriceAddress = EEthereumAddresses.WBTC;
            tokenDecimals = 8;
            break;
          case EPolygonAddresses.WETH:
            tokenPriceAddress = EEthereumAddresses.WETH;
            break;
          case EOptimismAddresses.WBTC:
            tokenPriceAddress = EEthereumAddresses.WBTC;
            tokenDecimals = 8;
            break;
          case EOptimismAddresses.WETH:
            tokenPriceAddress = EEthereumAddresses.WETH;
            break;
          case EEthereumAddresses.EURT:
            tokenPriceAddress = EEthereumAddresses.EURT;
            tokenDecimals = 6;
            break;
          default:
            tokenPriceAddress = farm.underlyingTokenAddress;
            break;
        }
        valueOfAssetInUSDC = await getPrice(
          tokenPriceAddress,
          EEthereumAddresses.USDC,
          tokenDecimals,
          6,
        );
      }

      farmInfo.depositedAmountInUSD =
        +farmInfo.depositedAmount * valueOfAssetInUSDC;

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

  const updateNetworkFilter = (values, filter: boolean = true) => {
    if (filter) {
      shouldFilter.current = true;
    } else {
      shouldFilter.current = false;
    }
    setNetworkFilter(values);
  };

  const updateTokenFilter = (values, filter: boolean = true) => {
    if (filter) {
      shouldFilter.current = true;
    } else {
      shouldFilter.current = false;
    }
    setTokenFilter(values);
  };

  const updateTypeFilter = (values, filter: boolean = true) => {
    if (filter) {
      shouldFilter.current = true;
    } else {
      shouldFilter.current = false;
    }
    setTypeFilter(values);
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
        farm.chain == EChain.ETHEREUM
          ? 'Ethereum'
          : farm.chain == EChain.POLYGON
            ? 'Polygon'
            : farm.chain == EChain.OPTIMISM
              ? 'Optimism'
              : '',
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
      if (typeFilter.includes('Optimised farms')) {
        result = result || farm.isOptimised;
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

    setFilteredFarms(filteredFarms.filter(farm => !farm.isBoost && !farm.isOptimised));
    setFilteredOptimisedFarms(filteredFarms.filter(farm => farm.isOptimised));
    setFilteredBoostFarms(filteredFarms.filter(farm => farm.isBoost));
  };

  const claimRewards = async (farmAddress, seeRewardsAsStable) => {
    const farm = availableFarms.find(
      availableFarm => availableFarm.farmAddress == farmAddress,
    );

    try {
      const tx = farm.isLocked
        ? await claimLockedBoostFarmRewards(
          farmAddress,
          seeRewardsAsStable
            ? farm.rewards.stableAddress
            : farm.rewards.address,
          farm.chain,
        )
        : seeRewardsAsStable
          ? await claimBoostFarmNonLPRewards(
            farm.farmAddress,
            farm.rewards.stableAddress,
            farm.chain,
          )
          : await claimBoostFarmLPRewards(farm.farmAddress, farm.chain);
    } catch (error) {
      throw error;
    }
  };

  return {
    isLoading,
    error,
    filteredFarms,
    filteredBoostFarms,
    filteredOptimisedFarms,
    assetsInfo,
    viewType,
    tokenFilter,
    updateTokenFilter,
    networkFilter,
    updateNetworkFilter,
    walletAccountAtom,
    sortBy,
    sortDirectionIsAsc,
    typeFilter,
    updateTypeFilter,
    possibleStableTokens,
    possibleNonStableTokens,
    possibleNetworks,
    possibleTypes,
    possibleViewTypes,
    setViewType,
    totalDepositedAmountInUsd,
    isFarming:
      availableFarms.filter(farm => +farm.depositedAmount > 0.00001).length > 0,
    rewardsInfo,
    claimRewards,
  };
};
