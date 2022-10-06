import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { useNotification } from '../useNotification';
import { EChain } from 'app/common/constants/chains';
import { TAssetsInfo } from 'app/common/types/heading';
import {
  getSupportedTokensAdvancedInfo,
  getSupportedTokensBasicInfo,
  getSupportedTokensList,
} from 'app/common/functions/web3Client';
import { initialAvailableFarmsState } from 'app/common/state/farm';
import { TSupportedToken } from 'app/common/types/form';
import { EPolygonAddresses } from 'app/common/constants/addresses';

export const streamFromOptions: TSupportedToken[] = [
  { address: EPolygonAddresses.USDC, sign: '$' },
  { address: EPolygonAddresses.USDT, sign: '$' },
  { address: EPolygonAddresses.DAI, sign: '$' },
];

export const streamToOptions: TSupportedToken[] = [
  { address: EPolygonAddresses.IBALLUOETH, label: 'ETH', sign: 'Ξ' },
];

export const useAutoInvest = () => {
  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // modal control
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // assets info
  const [assetsInfo, setAssetsInfo] = useState<TAssetsInfo>();

  // streams
  const [streams, setStreams] = useState<string[]>();

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.POLYGON);
    }
    updateAutoInvestInfo();
  }, [walletAccountAtom]);

  const updateAutoInvestInfo = async () => {
    setIsLoading(true);
    await fetchStreamsInfo();
    await fetchAssetsInfo();
    setIsLoading(false);
  };

  const fetchAssetsInfo = async () => {
    try {
      let numberOfAssets = 0;
      let chainsWithAssets = new Set();

      await Promise.all(
        initialAvailableFarmsState
          .filter(x => true)
          .map(async farm => {
            console.log("entra aqui sem stress")
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

            console.log(supportedTokens);
            if (walletAccountAtom) {
              supportedTokens.map(async supportedToken => {
                const advancedSupportedTokenInfo =
                  await getSupportedTokensAdvancedInfo(
                    farm.farmAddress,
                    supportedToken,
                    farm.chain,
                  );
                if (Number(advancedSupportedTokenInfo.balance) > 0) {
                  numberOfAssets++;
                  chainsWithAssets.add(farm.chain);
                }
              });
            }
          }),
      ).then(() => {
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
    setStreams([]);
  };

  return {
    walletAccountAtom,
    isLoading,
    streams,
    isModalVisible,
    setIsModalVisible,
    assetsInfo,
  };
};
