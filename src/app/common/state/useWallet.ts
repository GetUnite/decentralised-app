import {
  changeNetwork,
  getChainNameById,
  getCurrentChainId,
  onWalletUpdated,
  tryAutoWalletConnection,
} from 'app/common/functions/web3Client';
import { useNotification } from 'app/common/state';
import {
  isCorrectNetwork,
  isSafeApp,
  walletAccount,
  wantedChain,
} from 'app/common/state/atoms';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { EChain, EChainId } from '../constants/chains';

export const useWallet = () => {
  const { resetNotification, setNotification } = useNotification();
  const [walletAccountAtom, setWalletAccountAtom] =
    useRecoilState(walletAccount);
  const [wantedChainAtom] = useRecoilState(wantedChain);
  const [, setIsCorrectNetworkAtom] = useRecoilState(isCorrectNetwork);
  const [, setSafeAppAtom] = useRecoilState(isSafeApp);
  const [wantedChainId, setWantedChainId] = useState<EChainId>();
  const [currentChainId, setCurrentChainId] = useState<EChain>();

  const handleSafeAppConnection = (
    walletAddress: string,
    isGnosisSafe: boolean,
  ) => {
    setWalletAccountAtom(walletAddress);
    if (isGnosisSafe) {
      setSafeAppAtom(true);
    }
  };

  useEffect(() => {
    tryAutoWalletConnection(handleSafeAppConnection);
  }, []);

  const handleWalletChanged = (chainId: EChain, walletAddress: string) => {
    setCurrentChainId(chainId);
    setWalletAccountAtom(walletAddress);
  };

  useEffect(() => {
    if (walletAccountAtom) {
      onWalletUpdated(handleWalletChanged);
    }
  }, [walletAccountAtom]);

  useEffect(() => {
    if (walletAccountAtom) {
      networkChange();
    }
  }, [wantedChainAtom]);

  useEffect(() => {
    if (walletAccountAtom) {
      checkCurrentChain();
    }
  }, [currentChainId, wantedChainId]);

  const networkChange = async () => {
    if (wantedChainAtom != undefined) {
      const chainId = await changeNetwork(wantedChainAtom);
      if (chainId == wantedChainId) {
        checkCurrentChain(chainId);
      } else {
        setWantedChainId(chainId);
      }
    } else {
      setWantedChainId(undefined);
    }
  };

  const checkCurrentChain = async (chainId?: EChainId) => {
    const chainToUse = chainId != undefined ? chainId : wantedChainId;
    if (chainToUse != undefined) {
      const isCorrectNetwork = (await getCurrentChainId()) == chainToUse;
      setIsCorrectNetworkAtom(isCorrectNetwork);
      if (!isCorrectNetwork) {
        setNotification(
          `Please change your wallet network to ${getChainNameById(
            wantedChainId,
          )}`,
          'info',
          null,
          null,
          true,
        );
      } else {
        resetNotification();
      }
    } else {
      resetNotification();
    }
  };

  return {};
};
