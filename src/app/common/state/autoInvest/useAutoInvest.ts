import { EPolygonAddresses } from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import {
  getStreamEndDate,
  getStreamFlow,
  stopStream
} from 'app/common/functions/autoInvest';
import { toExactFixed } from 'app/common/functions/utils';
import {
  getBalance,
  getBalanceOf,
  getSupportedTokensBasicInfo,
  getSupportedTokensList
} from 'app/common/functions/web3Client';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { initialAvailableFarmsState } from 'app/common/state/farm';
import { TStreamOption } from 'app/common/types/autoInvest';
import { TAssetsInfo } from 'app/common/types/heading';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useNotification } from '../useNotification';

const streamOptions: TStreamOption[] = [
  // from USD options
  {
    // USD Farm to ETH
    fromLabel: 'USD',
    fromSign: '$',
    toLabel: 'ETH',
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOETH,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOETH,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDETH,
    underlyingTokenAddress: EPolygonAddresses.USDC,
  },
  {
    // USD Farm to BTC
    fromLabel: 'USD',
    fromSign: '$',
    toLabel: 'BTC',
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOBTC,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOBTC,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDBTC,
    underlyingTokenAddress: EPolygonAddresses.USDC,
  },
  // from BTC options
  {
    // WBTC to USD
    fromLabel: 'BTC',
    fromSign: '₿',
    toLabel: 'USD',
    fromAddress: EPolygonAddresses.WBTC,
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOBTC,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOBTC,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDBTC,
    underlyingTokenAddress: EPolygonAddresses.WBTC,
  },
  // from ETH options
  {
    // WETH to USD
    fromLabel: 'BTC',
    fromSign: 'Ξ',
    toLabel: 'USD',
    fromAddress: EPolygonAddresses.WETH,
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOETH,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOETH,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDETH,
    underlyingTokenAddress: EPolygonAddresses.WETH,
  },
];

export const useAutoInvest = () => {
  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // other state control files
  const { setNotification } = useNotification();

  // assets info
  const [assetsInfo, setAssetsInfo] = useState<TAssetsInfo>();

  // streams
  const [streams, setStreams] = useState<any>([]);
  const [fundedUntilByStreamOptions, setFundedUntilByStreamOptions] =
    useState<any>();

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStoppingStream, setIsStoppingStream] = useState<boolean>(false);

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

  // update tvs every second
  useEffect(() => {
    if (walletAccountAtom) {
      const interval = setInterval(() => {
        const streamsArray = [];
        for (const streamOption of streams) {
          const tvs = +streamOption.tvs;
          const fps = +streamOption.flowPerSecond * 3;
          streamsArray.push({
            ...streamOption,
            tvs: toExactFixed(tvs + fps, 6),
          });
        }
        setStreams(streamsArray);
      }, 3000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [streams]);

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
    let streamsArray = [];

    for (let index = 0; index < streamOptions.length; index++) {
      const element = streamOptions[index];
      const streamFlow = await getStreamFlow(
        element.fromStIbAlluoAddress,
        element.ricochetMarketAddress,
      );
      if (+streamFlow.flowPerSecond > 0) {
        const ibAlluoBalance = await getBalance(
          element.fromIbAlluoAddress,
          18,
          EChain.POLYGON,
        );
        const flowPerSecond = +streamFlow.flowPerSecond;
        const flowPerMonth = (flowPerSecond * 60 * 60 * 24 * 365) / 12;
        const tvs = toExactFixed(
          (currentTime / 1000 - streamFlow.timestamp) * flowPerSecond,
          6,
        );
        const endDateTimestamp = await getStreamEndDate(
          element.fromIbAlluoAddress,
          element.ricochetMarketAddress,
          streamFlow.timestamp,
        );
        console.log(endDateTimestamp);
        streamsArray.push({
          from: element.fromLabel,
          fromAddress: element.fromIbAlluoAddress,
          to: element.toLabel,
          toAddress: element.ricochetMarketAddress,
          flowPerSecond: flowPerSecond,
          flowPerMonth: toExactFixed(flowPerMonth, 6),
          startDate: new Date(streamFlow.timestamp * 1000).toLocaleDateString(),
          endDate: endDateTimestamp
            ? new Date(endDateTimestamp).toLocaleDateString()
            : null,
          tvs: tvs,
          sign: element.fromSign,
        });

        let fundedUntil = fundedUntilArray.find(
          fundedUntil => fundedUntil.from == element.fromLabel,
        );

        if (fundedUntil) {
          fundedUntil.flowPerSecond = fundedUntil.flowPerSecond + flowPerSecond;
          const remainingFundedMiliseconds =
            (+ibAlluoBalance / fundedUntil.flowPerSecond) * 1000;
          fundedUntil.fundedUntilDate = new Date(
            currentTime + remainingFundedMiliseconds,
          ).toLocaleDateString();
        } else {
          const remainingFundedMiliseconds =
            (+ibAlluoBalance / flowPerSecond) * 1000;

          fundedUntilArray.push({
            from: element.fromLabel,
            flowPerSecond: flowPerSecond,
            fundedUntilDate: new Date(
              currentTime + remainingFundedMiliseconds,
            ).toLocaleDateString(),
          });
        }
      }
    }

    setFundedUntilByStreamOptions(fundedUntilArray);
    setStreams(streamsArray);
  };

  const handleStopStream = async (fromAddress, toAddress) => {
    setIsStoppingStream(true);
    const streamOption = streamOptions.find(
      so =>
        so.fromIbAlluoAddress == fromAddress &&
        so.ricochetMarketAddress == toAddress,
    );
    if (streamOption) {
      try {
        const tx = await stopStream(
          fromAddress,
          toAddress,
          false, // use biconomy here
        );
        setNotification('Steam was stopped successfully', 'success');
        // remove stream from the list
        await updateAutoInvestInfo();
      } catch (err) {
        setNotification(err, 'error');
      }
    } else {
      setNotification(
        'There was a problem while finding the stream to stop. Please try again',
        'error',
      );
    }
    setIsStoppingStream(false);
  };
  return {
    walletAccountAtom,
    isLoading,
    isStoppingStream,
    streams,
    assetsInfo,
    fundedUntilByStreamOptions,
    handleStopStream,
  };
};
