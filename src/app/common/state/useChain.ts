import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import {
  changeNetwork,
  EChain,
  getCurrentChainOnWalletUpdated,
  getChainById,
} from 'app/common/functions/Web3Client';
import { useNotification } from 'app/common/state';

export const useChain = () => {
  const { resetNotification, setNotificationt } = useNotification();
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [wantedChainAtom] = useRecoilState(wantedChain);
  const [currentChain, setCurrentChain] = useState<EChain>();

  const handleChainChanged = chainId => {
    setCurrentChain(getChainById(chainId));
  };

  useEffect(() => {
    if (walletAccountAtom) {
      getCurrentChainOnWalletUpdated(handleChainChanged);
    }
  }, [walletAccountAtom]);

  useEffect(() => {
    if (walletAccountAtom) {
      checkCurrentChain();
    }
  }, [currentChain]);

  useEffect(() => {
    if (walletAccountAtom) {
      try {
        changeNetwork(wantedChainAtom);
      } catch (error) {
        console.log(error);
      }
      checkCurrentChain();
    }
  }, [wantedChainAtom]);

  const checkCurrentChain = async () => {
    if (currentChain !== wantedChainAtom) {
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
