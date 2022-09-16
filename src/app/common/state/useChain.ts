import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import {
  changeNetwork,
  EChain,
  onWalletUpdated,
  getChainById,
  getCurrentChain,
} from 'app/common/functions/Web3Client';
import { useNotification } from 'app/common/state';

export const useChain = () => {
  const { resetNotification, setNotificationt } = useNotification();
  const [walletAccountAtom, setWalletAccountAtom] = useRecoilState(walletAccount);
  const [wantedChainAtom] = useRecoilState(wantedChain);
  const [currentChain, setCurrentChain] = useState<EChain>();

  const handleWalletChanged = (chainId, walletAddress) => {
    setCurrentChain(getChainById(chainId));
    setWalletAccountAtom(walletAddress);
  };

  useEffect(() => {
    if (walletAccountAtom) {
      onWalletUpdated(handleWalletChanged);
    }
  }, [walletAccountAtom]);

  useEffect(() => {
    if (walletAccountAtom) {
      checkCurrentChain();
    }
  }, [currentChain]);

  useEffect(() => {
    if (walletAccountAtom) {
      changeNetwork(wantedChainAtom);
      checkCurrentChain();
    }
  }, [wantedChainAtom]);

  const checkCurrentChain = async () => {
    if ((await getCurrentChain()) !== wantedChainAtom) {
      setNotificationt(
        `Please change your wallet network to ${
          wantedChainAtom === EChain.ETHEREUM ? 'Ethereum' : 'Polygon'
        }`,
        'info',
      );
    } else {
      resetNotification();
    }
  };

  return {};
};
