import { EPolygonAddresses } from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import {
  getStreamEndDate,
  getStreamFlow,
  stopStream
} from 'app/common/functions/autoInvest';
import { fromLocaleString, toExactFixed } from 'app/common/functions/utils';
import { getBalance, getBalanceOf } from 'app/common/functions/web3Client';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import {
  TStreamOption,
  TSupportedStreamToken
} from 'app/common/types/autoInvest';
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

const streamFromOptions: TSupportedStreamToken[] = [
  {
    label: 'Your USD farm',
    address: EPolygonAddresses.IBALLUOUSD,
    decimals: 18,
    sign: '$',
    isStreamable: true,
  },
  {
    label: 'USDC',
    address: EPolygonAddresses.USDC,
    decimals: 6,
    sign: '$',
  },
  {
    label: 'DAI',
    address: EPolygonAddresses.DAI,
    decimals: 18,
    sign: '$',
  },
  {
    label: 'USDT',
    address: EPolygonAddresses.USDT,
    decimals: 6,
    sign: '$',
  },
  {
    label: 'Your ETH farm',
    address: EPolygonAddresses.IBALLUOETH,
    decimals: 18,
    sign: 'Ξ',
    isStreamable: true,
  },
  {
    label: 'WETH',
    address: EPolygonAddresses.WETH,
    decimals: 18,
    sign: 'Ξ',
  },
  {
    label: 'Your BTC farm',
    address: EPolygonAddresses.IBALLUOBTC,
    decimals: 18,
    sign: '₿',
    isStreamable: true,
  },
  {
    label: 'WBTC',
    address: EPolygonAddresses.WBTC,
    decimals: 18,
    sign: '₿',
  },
];

const ricochetMarketAddressOptions: string[] = [
  EPolygonAddresses.TWOWAYMARKETIBALLUOUSDETH,
  EPolygonAddresses.TWOWAYMARKETIBALLUOUSDBTC,
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

  // control actions
  const [canStartStreams, setCanStartStreams] = useState<boolean>(true);

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
    const numberOfStreams = await fetchStreamsInfo();
    // if all streams options are being used there is no need to get the assets
    if (!(numberOfStreams > 1)) {
      await fetchAssetsInfo();
    }

    setIsLoading(false);
  };

  // update tvs every second
  useEffect(() => {
    if (walletAccountAtom) {
      const interval = setInterval(() => {
        const streamsArray = [];
        for (const streamOption of streams) {
          const tvs = fromLocaleString(streamOption.tvs);
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
      let numberOfAssets = 0;

      for (let index = 0; index < streamFromOptions.length; index++) {
        const supportedToken = streamFromOptions[index];
        const balance = supportedToken.isStreamable
          ? await getBalance(supportedToken.address, supportedToken.decimals)
          : await getBalanceOf(supportedToken.address, supportedToken.decimals);
        if (+balance > 0) {
          numberOfAssets++;
        }
      }

      setAssetsInfo({
        numberOfAssets: numberOfAssets,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStreamsInfo = async () => {
    const currentTime = new Date().getTime();
    const ricochetMarketAddressesWithStreams = [];
    const fundedUntilArray = [];
    const streamsArray = [];

    for (let index = 0; index < streamOptions.length; index++) {
      const element = streamOptions[index];
      const streamFlow = await getStreamFlow(
        element.fromStIbAlluoAddress,
        element.ricochetMarketAddress,
      );
      if (+streamFlow.flowPerSecond > 0) {
        ricochetMarketAddressesWithStreams.push(element.ricochetMarketAddress);

        const ibAlluoBalance = await getBalance(
          element.fromIbAlluoAddress,
          18,
          EChain.POLYGON,
        );
        const flowPerSecond = +streamFlow.flowPerSecond;
        const flowPerMonth = (flowPerSecond * 60 * 60 * 24 * 365) / 12;
        const tvs = (currentTime / 1000 - streamFlow.timestamp) * flowPerSecond;

        const endDateTimestamp = await getStreamEndDate(
          element.fromIbAlluoAddress,
          element.ricochetMarketAddress,
          streamFlow.timestamp,
        );
        const endDate = new Date(0);
        endDate.setSeconds(endDateTimestamp);
        streamsArray.push({
          from: element.fromLabel,
          fromAddress: element.fromIbAlluoAddress,
          to: element.toLabel,
          toAddress: element.ricochetMarketAddress,
          flowPerSecond: flowPerSecond,
          flowPerMonth: toExactFixed(flowPerMonth, 6),
          startDate: new Date(streamFlow.timestamp * 1000).toLocaleDateString(),
          endDate: endDateTimestamp ? endDate.toLocaleDateString() : null,
          tvs: toExactFixed(tvs, 6),
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

    console.log(ricochetMarketAddressesWithStreams,ricochetMarketAddressOptions)
    if (
      ricochetMarketAddressesWithStreams.length >=
      ricochetMarketAddressOptions.length
    ) {
      setCanStartStreams(false);
    }else{
      setCanStartStreams(true);
    }
    setFundedUntilByStreamOptions(fundedUntilArray);
    setStreams(streamsArray);

    return ricochetMarketAddressesWithStreams.length;
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
        setNotification(
          'Steam was stopped successfully',
          'success',
          tx.transactionHash,
          EChain.POLYGON,
        );
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
    canStartStreams,
  };
};
