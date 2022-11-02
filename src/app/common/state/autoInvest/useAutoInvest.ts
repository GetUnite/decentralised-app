import { EPolygonAddresses } from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import { getStreamFlow, stopStream } from 'app/common/functions/autoInvest';
import { fromDecimals, toExactFixed } from 'app/common/functions/utils';
import {
  getBalance,
  getBalanceOf,
  getSupportedTokensBasicInfo,
  getSupportedTokensList
} from 'app/common/functions/web3Client';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { initialAvailableFarmsState } from 'app/common/state/farm';
import { TSupportedToken } from 'app/common/types/form';
import { TAssetsInfo } from 'app/common/types/heading';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useNotification } from '../useNotification';

export const streamOptions: any = [
  {
    id: 0,
    label: 'USD',
    stIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    ibAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    from: [
      {
        address: EPolygonAddresses.IBALLUOUSD,
        label: 'Your USD farm',
        sign: '$',
        isStreamable: true,
      },
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
    id: 1,
    label: 'BTC',
    ibAlluoAddress: EPolygonAddresses.IBALLUOBTC,
    stIbAlluoAddress: EPolygonAddresses.STIBALLUOBTC,
    from: [
      {
        address: EPolygonAddresses.IBALLUOBTC,
        label: 'Your BTC farm',
        sign: '₿',
        isStreamable: true,
      },
      { address: EPolygonAddresses.WBTC, label: 'WBTC', sign: '₿' },
    ],
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
    id: 2,
    label: 'ETH',
    ibAlluoAddress: EPolygonAddresses.IBALLUOETH,
    stIbAlluoAddress: EPolygonAddresses.STIBALLUOETH,
    from: [
      {
        address: EPolygonAddresses.IBALLUOETH,
        label: 'Your ETH farm',
        sign: 'Ξ',
        isStreamable: true,
      },
      { address: EPolygonAddresses.WETH, label: 'WETH', sign: 'Ξ' },
    ],
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

  // other state control files
  const { setNotificationt } = useNotification();

  // assets info
  const [assetsInfo, setAssetsInfo] = useState<TAssetsInfo>();

  // streams
  const [streams, setStreams] = useState<any>();
  const [fundedUntilByStreamOptions, setFundedUntilByStreamOptions] =
    useState<any>();

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
                      supportedtoken.address,
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
    const currentTime = new Date().getTime();
    let fundedUntilArray = [];
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
              const ibAlluoBalance = await getBalance(
                streamOption.ibAlluoAddress,
                18,
                EChain.POLYGON,
              );
              const flowPerSecond = +fromDecimals(streamFlow.flowPerSecond, 18);

              streamsArray.push({
                id: streamOption.id,
                from: streamOption.label,
                fromAddress: streamOption.ibAlluoAddress,
                to: ricochetMarket.label,
                toAddress: ricochetMarket.address,
                flowPerMinute: fromDecimals(streamFlow.flowPerMinute, 18),
                startDate: new Date(
                  streamFlow.timestamp * 1000,
                ).toLocaleDateString(),
                tvs: toExactFixed(
                  (currentTime / 1000 - streamFlow.timestamp) * flowPerSecond,
                  6,
                ),
              });

              let fundedUntil = fundedUntilArray.find(
                fundedUntil => fundedUntil.from == streamOption.label,
              );

              if (fundedUntil) {
                fundedUntil.flowPerSecond =
                  fundedUntil.flowPerSecond + flowPerSecond;
                const remainingFundedMiliseconds =
                  (+ibAlluoBalance / fundedUntil.flowPerSecond) * 1000;
                fundedUntil.fundedUntilDate = new Date(
                  currentTime + remainingFundedMiliseconds,
                ).toLocaleDateString();
              } else {
                const remainingFundedMiliseconds =
                  (+ibAlluoBalance / flowPerSecond) * 1000;

                fundedUntilArray.push({
                  from: streamOption.label,
                  flowPerSecond: flowPerSecond,
                  fundedUntilDate: new Date(
                    currentTime + remainingFundedMiliseconds,
                  ).toLocaleDateString(),
                });
              }
            }
          });
      });

      resolve(streamsArray);
    });

    setFundedUntilByStreamOptions(fundedUntilArray);
    setStreams(await streamPromise);
  };

  const handleStopStream = async (fromAddress, toAddress) => {
    const streamOption = streamOptions.find(
      so =>
        so.ibAlluoAddress == fromAddress &&
        so.to.find(to => to.ricochetMarketAddress == toAddress) != undefined,
    );
    if (streamOption) {
      try {
        const tx = await stopStream(
          fromAddress,
          toAddress,
          false, // use biconomy here
        );
        setNotificationt('Steam was stopped successfully', 'success');
      } catch (err) {
        setNotificationt(err, 'error');
      }
    } else {
      setNotificationt(
        'There was a problem while finding the stream to stop. Please try again',
        'error',
      );
    }
  };
  return {
    walletAccountAtom,
    isLoading,
    streams,
    assetsInfo,
    fundedUntilByStreamOptions,
    handleStopStream,
  };
};
