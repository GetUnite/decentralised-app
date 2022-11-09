import { connectToWallet } from 'app/common/functions/web3Client';
import { walletAccount } from 'app/common/state/atoms';
import CryptoJs from 'crypto-js';
import { useIntercom } from 'react-use-intercom';
import { useRecoilState } from 'recoil';

export const useConnectionButton = () => {
  const [, setWalletAccountAtom] = useRecoilState(walletAccount);
  const { trackEvent, update } = useIntercom();

  const handleConnectWallet = async () => {
    const walletAddress = await connectToWallet();
    setWalletAccountAtom(walletAddress);
    const userHash = CryptoJs.HmacSHA256(
      walletAddress,
      process.env.REACT_APP_INTERCOM_SECRET_KEY,
    );
    var userHashInHex = CryptoJs.enc.Hex.stringify(userHash);
    update({ userId: walletAddress, userHash: userHashInHex });
    trackEvent('connected-wallet');
  };

  return {
    handleConnectWallet,
  };
};
