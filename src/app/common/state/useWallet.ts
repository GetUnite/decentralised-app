import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  isCorrectNetwork,
  isSafeApp,
  walletAccount,
  wantedChain,
} from 'app/common/state/atoms';
import {
  changeNetwork,
  EChain,
  onWalletUpdated,
  getCurrentChainId,
  EChainId,
  getChainNameById,
  trySafeAppConnection,
} from 'app/common/functions/Web3Client';
import { useNotification } from 'app/common/state';

export const useWallet = () => {
  const { resetNotification, setNotificationt } = useNotification();
  const [walletAccountAtom, setWalletAccountAtom] =
    useRecoilState(walletAccount);
  const [wantedChainAtom] = useRecoilState(wantedChain);
  const [, setIsCorrectNetworkAtom] = useRecoilState(isCorrectNetwork);
  const [, setSafeAppAtom] = useRecoilState(isSafeApp);
  const [wantedChainId, setWantedChainId] = useState<EChainId>();
  const [currentChainId, setCurrentChain] = useState<EChain>();

  const handleSafeAppConnection = walletAddress => {
    setWalletAccountAtom(walletAddress);
    setSafeAppAtom(true);
  };

  useEffect(() => {
    trySafeAppConnection(handleSafeAppConnection);
  }, []);

  const handleWalletChanged = (chainId, walletAddress) => {
    setCurrentChain(chainId);
    setWalletAccountAtom(walletAddress);
  };

  useEffect(() => {
    onWalletUpdated(handleWalletChanged);
  }, [walletAccountAtom]);

  useEffect(() => {
    if (walletAccountAtom) {
      checkCurrentChain();
    }
  }, [currentChainId]);

  useEffect(() => {
    if (walletAccountAtom) {
      networkChange();
    }
  }, [wantedChainAtom]);

  const networkChange = async () => {
    const { success, chainId } = await changeNetwork(wantedChainAtom);
    setWantedChainId(chainId);
    if (!success) {
      checkCurrentChain(chainId);
    } else {
      resetNotification();
    }
  };

  const checkCurrentChain = async (chainId?) => {
    const chainIdToUse = chainId != undefined ? chainId : wantedChainId;
    const isCorrectNetwork = (await getCurrentChainId()) == chainIdToUse;
    setIsCorrectNetworkAtom(isCorrectNetwork);
    if (!isCorrectNetwork) {
      setNotificationt(
        `Please change your wallet network to ${getChainNameById(
          chainIdToUse,
        )}`,
        'info',
      );
    } else {
      resetNotification();
    }
  };

  return {};
};
