import {
  getBalance,
  getBalanceOf,
  getChainById,
  getCurrentChainId,
  getInterest,
  getNativeTokenBalance,
  getTokenValueUsingPriceFeedRouter,
  getTokenValueUsingUniswap,
  getTotalAssets,
  getTotalAssetSupply,
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
  EPolygonAddresses,
} from '../constants/addresses';
import { EChain } from '../constants/chains';
import {
  claimAllBoostFarmRewards,
  claimBoostFarmLPRewards,
  claimBoostFarmNonLPRewards,
  claimLockedBoostFarmRewards,
  getBoostFarmInterest,
  getBoostFarmRewards,
} from '../functions/boostFarm';
import { fromLocaleString, toExactFixed } from '../functions/utils';
import { useNotification } from './useNotification';
import { optimisedFarmOptions } from './optimisedFarm';
import {
  getOptimisedFarmInterest,
  getOptimisedTotalAssetSupply,
  getUserOptimisedFarmDepositedAmount,
} from '../functions/optimisedFarm';
import { EFiatId } from '../constants/utils';

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
const possibleTypes = [
  'Fixed-rate farms',
  'Boost farms',
  'Optimised farms',
  'Newest farms',
];
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
  const [filteredOptimisedFarms, setFilteredOptimisedFarms] =
    useState<TFarm[]>();
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
  const [viewType, setViewType] = useState<string>(
    location.search.includes('view_type=my_farms')
      ? 'View my farms only'
      : 'View all farms',
  );
  const [sortField, setSortField] = useState<string>(null);
  const [sortDirectionIsAsc, setSortDirectionIsAsc] = useState<boolean>(null);

  // header info
  const [assetsInfo, setAssetsInfo] = useState<TAssetsInfo>();

  // loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConnectedLoading, setIsConnectedLoading] = useState<boolean>(false);
  const [isLoadingTotalAmountInUSD, setIsLoadingTotalAmountInUSD] =
    useState<boolean>(true);
  const [isLoadingRewards, setIsLoadingRewards] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // claim all rewards
  const [isClaimingAllRewards, setIsClaimingAllRewards] =
    useState<boolean>(false);
  const [claimAllRewardsError, setClaimAllRewardsError] = useState<string>('');

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
  }, []);

  useEffect(() => {
    if (walletAccountAtom) {
      // enable connected loading
      setIsConnectedLoading(true);
      // it needs to wait for normal data to load first tho so lets do it like this
      if (!isLoading) {
        fetchConnectedFarmsInfo();
      }
    }
  }, [walletAccountAtom, isLoading]);

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
    isConnectedLoading,
  ]);

  const fetchFarmsInfo = async () => {
    setIsLoading(true);
    try {
      const mappedFarms = await Promise.all(
        [...boostFarmOptions, ...optimisedFarmOptions, ...farmOptions].map(
          async availableFarm => {
            try {
              const { supportedTokens, interest, totalAssetSupply } =
                availableFarm.isBoost
                  ? await fetchBoostFarmInfo(availableFarm)
                  : availableFarm.isOptimised
                  ? await fetchOptimisedFarmInfo(availableFarm)
                  : await fetchFarmInfo(availableFarm);

              availableFarm.supportedTokens = supportedTokens;
              availableFarm.interest = interest;
              availableFarm.totalAssetSupply = totalAssetSupply;

              return availableFarm;
            } catch (err) {
              console.log('Failed fetching farm info', err);
            }
          },
        ),
      );

      // normal data for farms is loaded
      // farms that failed to load will just not appear till it's fixed
      setAvailableFarms(mappedFarms.filter(mf => mf != undefined));
      setIsLoading(false);

      return mappedFarms;
    } catch (error) {
      setError(error);
      console.log(error);
    }
  };

  const fetchConnectedFarmsInfo = async () => {
    setIsConnectedLoading(true);

    try {
      const supportedTokensWithBalance = new Array<any>();

      await Promise.all(
        availableFarms.map(async availableFarm => {
          const {
            depositedAmount,
            depositedAmountInUSD,
            depositedAmountInLP,
            poolShare,
          } = availableFarm.isBoost
            ? await fetchConnectedBoostFarmInfo(availableFarm)
            : availableFarm.isOptimised
            ? await fetchConnectedOptimisedFarmInfo(availableFarm)
            : await fetchConnectedFarmInfo(availableFarm);

          availableFarm.depositedAmount = depositedAmount;
          availableFarm.depositedAmountInLP = depositedAmountInLP;
          availableFarm.depositedAmountInUSD = depositedAmountInUSD;
          availableFarm.poolShare = poolShare;

          for (
            let index = 0;
            index < availableFarm.supportedTokens.length;
            index++
          ) {
            supportedTokensWithBalance.push({
              ...availableFarm.supportedTokens[index],
              chain: availableFarm.chain,
            });
          }

          return availableFarm;
        }),
      ).then(async mappedFarms => {
        // sets it once with the rest of the data
        setAvailableFarms(mappedFarms);

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
                const balance =
                  supportedTokenWithBalance.address == EOptimismAddresses.ETH
                    ? await getNativeTokenBalance(
                        supportedTokenWithBalance.decimals,
                        EChain.OPTIMISM, // only optimism uses native for now
                      )
                    : await getBalanceOf(
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

        // connected basic info loaded
        setIsConnectedLoading(false);

        // calculate the total amount in usd
        setIsLoadingTotalAmountInUSD(true);
        let totalDepositedAmountInUsd = mappedFarms.reduce(
          (accumulator, farm) => {
            return (
              accumulator +
              +(farm.isBoost ? farm.depositedAmount : farm.depositedAmountInUSD)
            );
          },
          0,
        );

        setTotalDepositedAmountInUsd(
          toExactFixed(totalDepositedAmountInUsd, 2),
        );
        setIsLoadingTotalAmountInUSD(false);

        // load the rewards
        setIsLoadingRewards(true);

        // Also, check each boost farm rewards to show on the "view your farms" page
        const CVXETHInUSDC = await getTokenValueUsingPriceFeedRouter(
          EEthereumAddresses.CVXETH,
          EFiatId.USD,
          EChain.ETHEREUM,
        );

        let ri = [];
        await Promise.all(
          mappedFarms.map(async farm => {
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
          }),
        );

        setIsLoadingRewards(false);
      });
    } catch (error) {
      setError(error);
      console.log(error);
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

    return farmInfo;
  };

  const fetchConnectedFarmInfo = async farm => {
    const depositedAmount = await getBalance(
      farm.farmAddress,
      undefined,
      farm.chain,
    );

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
        case EOptimismAddresses.WBTC:
        case EEthereumAddresses.WBTC:
          tokenPriceAddress = EEthereumAddresses.WBTC;
          tokenDecimals = 8;
          break;
        case EPolygonAddresses.WETH:
        case EOptimismAddresses.WETH:
          tokenPriceAddress = EEthereumAddresses.WETH;
          break;
        case EPolygonAddresses.EURT:
          tokenPriceAddress = EEthereumAddresses.EURT;
          tokenDecimals = 6;
          break;
        default:
          tokenPriceAddress = farm.underlyingTokenAddress;
          break;
      }
      valueOfAssetInUSDC = await getTokenValueUsingUniswap(
        tokenPriceAddress,
        EEthereumAddresses.USDC,
        tokenDecimals,
        6,
      );
      //this will work if every price route is setuped for all chains
      /*valueOfAssetInUSDC = await getTokenValueUsingPriceFeedRouter(
          farm.underlyingTokenAddress,
          EFiatId.USD,
          farm.chain,
        );*/
    }

    return {
      depositedAmount: depositedAmount,
      depositedAmountInUSD: +depositedAmount * valueOfAssetInUSDC,
      depositedAmountInLP: undefined,
      poolShare:
        +depositedAmount > 0
          ? toExactFixed((+depositedAmount / +farm.totalAssetSupply) * 100, 2)
          : '0',
    };
  };

  const fetchBoostFarmInfo = async farm => {
    let farmInfo;

    const valueOf1LPinUSDC = await getTokenValueUsingPriceFeedRouter(
      farm.lPTokenAddress,
      EFiatId.USD,
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
    };

    return farmInfo;
  };

  const fetchConnectedBoostFarmInfo = async farm => {
    const depositedAmountInLP = await getBalanceOf(
      farm.farmAddress,
      undefined,
      farm.chain,
    );

    const valueOf1LPinUSDC = await getTokenValueUsingPriceFeedRouter(
      farm.lPTokenAddress,
      EFiatId.USD,
      farm.chain,
    );

    const depositedAmount = +depositedAmountInLP * valueOf1LPinUSDC;

    return {
      // Let's use the depositedAmount to store the deposited amount in USD(C)
      // The amount deposited is (the amount deposited in LP) * (LP to USDC conversion rate)
      depositedAmount: depositedAmount,
      depositedAmountInUSD: undefined,
      depositedAmountInLP: depositedAmountInLP,
      poolShare:
        +depositedAmount > 0
          ? toExactFixed((+depositedAmount / +farm.totalAssetSupply) * 100, 2)
          : '0',
    };
  };

  const fetchOptimisedFarmInfo = async farm => {
    let farmInfo;

    farmInfo = {
      interest: await getOptimisedFarmInterest(farm.farmAddress, farm.type),
      totalAssetSupply: await getOptimisedTotalAssetSupply(
        farm.farmAddress,
        EFiatId.USD,
        farm.chain,
      ),
      supportedTokens: farm.supportedTokens,
    };

    return farmInfo;
  };

  const fetchConnectedOptimisedFarmInfo = async farm => {
    const depositedAmount = await getUserOptimisedFarmDepositedAmount(
      farm.farmAddress,
      farm.underlyingTokenAddress,
      farm.chain,
    );
    let depositedAmountInUSD = depositedAmount;

    // if the underlying is eth get the usdc value aswell to show
    if (farm.underlyingTokenAddress == EOptimismAddresses.WETH) {
      const valueOfETHinUSDC = await getTokenValueUsingUniswap(
        EEthereumAddresses.WETH,
        EEthereumAddresses.USDC,
        18,
        6,
      );

      depositedAmountInUSD = depositedAmount * valueOfETHinUSDC;
    }

    return {
      depositedAmount: depositedAmount,
      depositedAmountInUSD: depositedAmountInUSD,
      depositedAmountInLP: undefined,
      poolShare:
        +depositedAmount > 0
          ? toExactFixed(
              (depositedAmountInUSD / +farm.totalAssetSupply) * 100,
              2,
            )
          : '0',
    };
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
      viewType == 'View my farms only' && !isConnectedLoading && !isLoading
        ? availableFarms.filter(
            farm => farm != undefined && +farm.depositedAmount > 0.00001,
          )
        : availableFarms;

    filteredFarms = filteredFarms.filter(farm => {
      if (farm != undefined) {
        const supportedTokensLabels =
          farm.supportedTokens != undefined &&
          Array.isArray(farm.supportedTokens)
            ? farm.supportedTokens.map(supportedToken => supportedToken.label)
            : [];

        for (let index = 0; index < supportedTokensLabels.length; index++) {
          const label = supportedTokensLabels[index];

          if (tokenFilter.includes(label)) {
            return true;
          }
        }
        return false;
      }
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
        result = result || (!farm.isBoost && !farm.isOptimised);
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

    setFilteredFarms(
      filteredFarms.filter(farm => !farm.isBoost && !farm.isOptimised),
    );
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

  const claimAllRewards = async seeRewardsAsStable => {
    setIsClaimingAllRewards(true);
    setWantedChainAtom(EChain.ETHEREUM);
    try {
      // rewards only exist in ethereum boost farms
      // the stable option is always usdc
      // the other option is CVX/ETH since is the "normal" reward token for locked boost pools.
      const tx = await claimAllBoostFarmRewards(
        seeRewardsAsStable
          ? EEthereumAddresses.USDC
          : EEthereumAddresses.CVXETH,
      );
    } catch (error) {
      setClaimAllRewardsError(
        'An error occured while trying to claim all the rewards. Please try again',
      );
    }
    setIsClaimingAllRewards(false);
  };

  return {
    isLoading,
    isLoadingTotalAmountInUSD,
    isConnectedLoading,
    isLoadingRewards,
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
      availableFarms?.filter(farm => +farm?.depositedAmount > 0.00001).length >
      0,
    rewardsInfo,
    claimRewards,
    // claim all rewards
    claimAllRewards,
    isClaimingAllRewards,
    claimAllRewardsError,
  };
};
