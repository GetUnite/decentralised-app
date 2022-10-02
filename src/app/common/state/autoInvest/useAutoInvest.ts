import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  getAllowance,
  getDepositedAmount,
  getInterest,
  getTotalAssetSupply,
} from 'app/common/functions/autoInvest';
import { isSafeApp, walletAccount, wantedChain } from 'app/common/state/atoms';
import { useNotification } from '../useNotification';
import { TSupportedToken } from 'app/common/types/form';
import { isNumeric } from 'app/common/functions/utils';
import { EChain } from 'app/common/constants/chains';
import { TAssetsInfo } from 'app/common/types/heading';
import {
  getSupportedTokensAdvancedInfo,
  getSupportedTokensBasicInfo,
  getSupportedTokensList,
} from 'app/common/functions/web3Client';
import { initialAvailableFarmsState } from 'app/common/state/farm';

export const useAutoInvest = () => {
  // Atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // other state control files
  const { setNotificationt } = useNotification();

  // modal control
  const [isModalToggled, setIsModalToggled] = useState<boolean>(false);

  // assets info
  const [assetsInfo, setAssetsInfo] = useState<TAssetsInfo>();

  // streams
  const [streams, setStreams] = useState<string>();

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.POLYGON);
      fetchStreamsInfo();
      fetchAssetsInfo();
    }
  }, [walletAccountAtom]);

  const fetchAssetsInfo = async () => {
    setIsLoading(true);
    try {
      let numberOfAssets = 0;
      let chainsWithAssets = new Set();

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
    setIsLoading(false);
  };

  const fetchStreamsInfo = async () => {
    setStreams('lol');
  };

  return {
    isLoading,
    streams,
    isModalToggled,
    setIsModalToggled,
    assetsInfo,
  };
};
