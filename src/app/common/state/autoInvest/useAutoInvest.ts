import { EPolygonAddresses } from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import { getStreamFlow } from 'app/common/functions/autoInvest';
import { toExactFixed } from 'app/common/functions/utils';
import {
  getBalanceOf, getSupportedTokensBasicInfo,
  getSupportedTokensList
} from 'app/common/functions/web3Client';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { initialAvailableFarmsState } from 'app/common/state/farm';
import { TSupportedToken } from 'app/common/types/form';
import { TAssetsInfo } from 'app/common/types/heading';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

export const streamOptions: any = [
  {
    label: 'USD',
    stIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    ibAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    from: [
      { address: EPolygonAddresses.USDC, label: 'USDC', sign: '$' },
      { address: EPolygonAddresses.DAI, label: 'DAI', sign: '$' },
      { address: EPolygonAddresses.USDT, label: 'USDT', sign: '$' },
    ],
    to: [
      {
        ibAlluoAddress: EPolygonAddresses.IBALLUOETH,
        stIbAlluoAddress: EPolygonAddresses.STIBALLUOETH,
        ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDETH,
        label: 'ETH',
      },
      {
        ibAlluoAddress: EPolygonAddresses.IBALLUOBTC,
        stIbAlluoAddress: EPolygonAddresses.STIBALLUOBTC,
        ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDBTC,
        label: 'BTC',
      },
    ],
  },
  {
    label: 'BTC',
    ibAlluoAddress: EPolygonAddresses.IBALLUOBTC,
    stIbAlluoAddress: EPolygonAddresses.STIBALLUOBTC,
    from: [{ address: EPolygonAddresses.WBTC, label: 'WBTC', sign: '₿' }],
    to: [
      {
        ibAlluoAddress: EPolygonAddresses.IBALLUOUSD,
        stIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
        ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDBTC,
        label: 'USD',
      },
    ],
  },
  {
    label: 'ETH',
    ibAlluoAddress: EPolygonAddresses.IBALLUOETH,
    stIbAlluoAddress: EPolygonAddresses.STIBALLUOETH,
    from: [{ address: EPolygonAddresses.WETH, label: 'WETH', sign: 'Ξ' }],
    to: [
      {
        ibAlluoAddress: EPolygonAddresses.IBALLUOUSD,
        stIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
        ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDETH,
        label: 'USD',
      },
    ],
  },
];

export const streamToOptions: TSupportedToken[] = [
  { address: EPolygonAddresses.IBALLUOUSD, label: 'USD', sign: '$' },
  { address: EPolygonAddresses.IBALLUOBTC, label: 'BTC', sign: '₿' },
  { address: EPolygonAddresses.IBALLUOETH, label: 'ETH', sign: 'Ξ' },
];

export const useAutoInvest = () => {
  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // assets info
  const [assetsInfo, setAssetsInfo] = useState<TAssetsInfo>();

  // streams
  const [streams, setStreams] = useState<any>();

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.POLYGON);
      updateAutoInvestInfo();
    }
  }, [walletAccountAtom]);

  const updateAutoInvestInfo = async () => {
    setIsLoading(true);
    await fetchStreamsInfo();
    await fetchAssetsInfo();
    setIsLoading(false);
  };

  const fetchAssetsInfo = async () => {
    try {
      let supportedTokensWithBalance = new Array<any>();

      await Promise.all(
        initialAvailableFarmsState
          .filter(x => true)
          .map(async farm => {
            const supportedTokens = farm.isBooster
              ? await Promise.all(
                  farm.supportedTokensAddresses.map(async supportedtoken => {
                    return await getSupportedTokensBasicInfo(
                      supportedtoken,
                      farm.chain,
                    );
                  }),
                )
              : await getSupportedTokensList(farm.type, farm.chain);

            if (walletAccountAtom) {
              for (const supportedToken of supportedTokens) {
                supportedTokensWithBalance.push({
                  ...supportedToken,
                  chain: farm.chain,
                });
              }
            }
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
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStreamsInfo = async () => {
    const streamPromise = new Promise(resolve => {
      let streamsArray = [];

      streamOptions.forEach(async streamOption => {
        await streamOption.to
          .map(so => {
            return { address: so.ricochetMarketAddress, label: so.label };
          })
          .forEach(async ricochetMarket => {
            const streamFlow = await getStreamFlow(
              streamOption.stIbAlluoAddress,
              ricochetMarket.address,
            );
            if (streamFlow.flowPerSecond > 0) {
              const ibAlluoBalance = await getBalanceOf(
                streamOption.ibAlluoAddress,
                18,
                EChain.POLYGON,
              );
              const remainingFundedMiliseconds =
                (+ibAlluoBalance / streamFlow.flowPerSecond) * 1000;
              streamsArray.push({
                from: streamOption.label,
                to: ricochetMarket.label,
                flow: streamFlow.flowPerMinute,
                start: new Date(
                  streamFlow.timestamp * 1000,
                ).toLocaleDateString(),
                fundedUntil: new Date(
                  new Date().getTime() + remainingFundedMiliseconds,
                ).toLocaleDateString(),
              });
            }
          });
      });

      resolve(streamsArray);
    });
    setStreams(await streamPromise);
  };

  return {
    walletAccountAtom,
    isLoading,
    streams,
    assetsInfo,
  };
};
