import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { walletAccount } from 'app/common/state/atoms';
import {
  changeNetwork,
  EChain,
  registerChainChanged,
  unregisterChainChanged,
  getCurrentChain,
  getChainById,
} from 'app/common/functions/Web3Client';
import { useNotification } from 'app/common/state';

export const useChain = () => {
  const { resetNotification, setNotificationt } = useNotification();
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [currentChain, setCurrentChain] = useState<EChain>();
  const [wantedChain, setWantedChain] = useState<EChain>();

  const handleChainChanged = chainId => {
    setCurrentChain(getChainById(chainId));
  };

  useEffect(() => {
    registerChainChanged(handleChainChanged);

    return function cleanup() {
      unregisterChainChanged(handleChainChanged);
    };
  }, []);

  useEffect(() => {
    if (walletAccountAtom) {
      checkCurrentChain();
    }
  }, [currentChain, wantedChain]);

  const changeChainTo = async chain => {
    setWantedChain(chain);
    try {
      await changeNetwork(chain);
    } catch (error) {
      console.log(error);
    }
  };

  const checkCurrentChain = async () => {
    const currentWalletChain = await getCurrentChain();
    if (currentWalletChain !== wantedChain) {
      setNotificationt(
        `Please change your wallet network to ${
          wantedChain === EChain.ETHEREUM ? 'Ethereum' : 'Polygon'
        }`,
        'info',
      );
    } else {
      resetNotification();
    }
  };

  return {
    changeChainTo,
  };
};
