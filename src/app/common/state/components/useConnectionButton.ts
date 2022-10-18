import { useRecoilState } from 'recoil';
import { walletAccount } from 'app/common/state/atoms';
import { connectToWallet } from 'app/common/functions/web3Client';
import { useIntercom } from 'react-use-intercom';
import CryptoJs from 'crypto-js';

export const useConnectionButton = () => {
  const [, setWalletAccountAtom] = useRecoilState(walletAccount);
  const { trackEvent, update } = useIntercom();

  const handleConnectWallet = async () => {
    const walletAddress = await connectToWallet();
    setWalletAccountAtom(walletAddress);
    const userHash = CryptoJs.HmacSHA256(walletAddress, process.env.REACT_APP_INTERCOM_SECRET_KEY);
    update({ userId: walletAddress, userHash: userHash });
    trackEvent('connected-wallet');
  };

  return {
    handleConnectWallet,
  };
};
