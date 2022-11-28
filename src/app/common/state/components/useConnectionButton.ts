import { connectToWallet } from 'app/common/functions/web3Client';
import { walletAccount, walletDomain } from 'app/common/state/atoms';
import CryptoJs from 'crypto-js';
import { useIntercom } from 'react-use-intercom';
import { useRecoilState } from 'recoil';

export const useConnectionButton = () => {
  const [, setWalletAccountAtom] = useRecoilState(walletAccount);
  const [, setWalletDomainAtom] = useRecoilState(walletDomain);
  const { trackEvent, update } = useIntercom();

  const handleConnectWallet = async () => {
    const walletAddress = await connectToWallet();
    setWalletAccountAtom(walletAddress?.address);
    setWalletDomainAtom(walletAddress?.domain);
    const userHash = CryptoJs.HmacSHA256(
      walletAddress,
      process.env.REACT_APP_INTERCOM_SECRET_KEY,
    );
    var userHashInHex = CryptoJs.enc.Hex.stringify(userHash);
    update({ userId: walletAddress?.address, userHash: userHashInHex });
    trackEvent('connected-wallet');
  };

  return {
    handleConnectWallet,
  };
};
