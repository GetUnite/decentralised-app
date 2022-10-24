import {
  getBalanceOf,
  getBoosterFarmInterest,
  getChainById,
  getCurrentChainId,
  getInterest,
  getSupportedTokensBasicInfo,
  getSupportedTokensList,
  getTotalAssets,
  getTotalAssetSupply,
  getUserDepositedAmount,
  getUserDepositedLPAmount
} from 'app/common/functions/web3Client';
import { isSafeApp, walletAccount } from 'app/common/state/atoms';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { EChain } from '../constants/chains';
import { getValueOf1LPinUSDC } from '../functions/farm';
import { roundNumberDown, toExactFixed } from '../functions/utils';
import { TFarm } from '../types/farm';
import { TAssetsInfo } from '../types/heading';
import { initialAvailableFarmsState } from './farm/useFarm';
import { useNotification } from './useNotification';

export const useMain = () => {
  // atoms
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
  const [walletAccountAtom] = useRecoilState(walletAccount);

  const { resetNotification } = useNotification();

  const [availableFarms, setAvailableFarms] = useState<TFarm[]>(
    initialAvailableFarmsState,
  );
  const [networkFilter, setNetworkFilter] = useState<string>();
  const [tokenFilter, setTokenFilter] = useState<string>();
  const [viewType, setViewType] = useState<string>(null);
  const [sortField, setSortField] = useState<string>(null);
  const [sortDirectionIsAsc, setSortDirectionIsAsc] = useState<boolean>(null);
  const [allSupportedTokens, setAllSupportedTokens] = useState<string[]>([]);
  const [filteredFarms, setFilteredFarms] = useState<TFarm>();

  const [assetsInfo, setAssetsInfo] = useState<TAssetsInfo>();

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
      let supportedTokensWithBalance = new Array<any>();
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
              allSupportedTokens.add(supportedToken);
            });

            if (walletAccountAtom) {
              for (const supportedToken of supportedTokens) {
                supportedTokensWithBalance.push({
                  ...supportedToken,
                  chain: availableFarm.chain,
                });
              }
            }

            availableFarm.interest = interest;
            availableFarm.totalAssetSupply = totalAssetSupply;
            availableFarm.supportedTokens = supportedTokens;
            availableFarm.depositedAmount = depositedAmount;
            availableFarm.poolShare = poolShare;
          }),
      ).then(async () => {
        let numberOfAssets = 0;
        let chainsWithAssets = new Set();

        if (walletAccountAtom) {
          const uniqueSupportedTokensWithBalance =
            supportedTokensWithBalance.filter(
              (value, index, self) =>
                index ===
                self.findIndex(
                  t =>
                    t.tokenAddress === value.tokenAddress &&
                    t.chain === value.chain,
                ),
            );

          await Promise.all(
            uniqueSupportedTokensWithBalance.map(
              async supportedTokenWithBalance => {
                const balance = await getBalanceOf(
                  supportedTokenWithBalance.tokenAddress,
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
              (+farmInfo.depositedAmount / +farmInfo.totalAssetSupply) * 100,
              2,
            )
          : 0;
    }

    return farmInfo;
  };

  const fetchBoosterFarmInfo = async farm => {
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
      supportedTokens: await Promise.all(
        farm.supportedTokensAddresses.map(async supportedtoken => {
          return await getSupportedTokensBasicInfo(
            supportedtoken.address,
            farm.chain,
          );
        }),
      ),
      depositedAmount: 0,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmountInLP = await getUserDepositedLPAmount(
        farm.farmAddress,
        farm.chain,
      );
      // Let's use the depositedAmount to store the deposited amount in USD(C)
      // The amount deposited is (the amount deposited in LP) * (LP to USDC conversion rate)
      farmInfo.depositedAmount = roundNumberDown(
        farmInfo.depositedAmountInLP * valueOf1LPinUSDC,
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
      console.log({ chain: chain, chainId: chainId });

      filteredFarms = filteredFarms.filter(farm => farm.chain == chain);
    }

    setFilteredFarms(filteredFarms);
  };

  return {
    isLoading,
    error,
    filteredFarms,
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
