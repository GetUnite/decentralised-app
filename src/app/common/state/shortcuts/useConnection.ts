import { useState, useEffect } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import WalletConnectProvider from '@walletconnect/ethereum-provider';

import { walletAccount, tokenInfo } from 'app/common/state/atoms';
import { EWallets } from 'app/common/constants';
import {
  getTokenInfo,
  connectToMetamask,
  connectToWalletconnect,
} from 'app/common/functions/Web3Client';

declare let window: any;

export const useConnection = setIsModalOpen => {
  const [walletAccountAtom, setWalletAccountAtom] =
    useRecoilState(walletAccount);
  const [, setTokenInfoAtom] = useRecoilState(tokenInfo);
  const resetTokenInfo = useResetRecoilState(tokenInfo);

  const [walletName, setWalletName] = useState<EWallets | null>();
  const [walletConnectProvider, setWalletConnectProvider] =
    useState<WalletConnectProvider>();

  const setAccountInformation = async () => {
    setTokenInfoAtom({
      isLoading: true,
    });
    const tokenInfoData = await getTokenInfo(walletAccountAtom);
    setTokenInfoAtom(tokenInfoData);
  };

  const handleConnectMetamask = async () => {
    try {
      if (window.ethereum) {
        const account = await connectToMetamask();

        setWalletAccountAtom(account);

        setWalletName(EWallets.METAMASK);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    window.ethereum?.on('accountsChanged', handleConnectMetamask);
  }, []);

  useEffect(() => {
    if (walletAccountAtom) setAccountInformation();
  }, [walletAccountAtom]);

  const handleConnectWaletConnect = async () => {
    try {
      const { walletAddress, provider } = await connectToWalletconnect();
      setWalletConnectProvider(provider);
      setWalletAccountAtom(walletAddress);
      setWalletName(EWallets.WALLETCONNECT);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err.message);
    }
  };
  const disconnectWalletconnect = () => {
    walletConnectProvider?.disconnect();
    setWalletConnectProvider(null);
  };
  const resetAccountInfo = () => {
    setWalletName(null);
    setWalletAccountAtom(null);
    // setIsModalOpen(true);

    resetTokenInfo();
  };
  const resetAndChangeWallet = async () => {
    disconnectWalletconnect();

    resetAccountInfo();
  };

  return {
    walletName,
    handleConnectMetamask,
    handleConnectWaletConnect,
    resetAndChangeWallet,
  };
};
