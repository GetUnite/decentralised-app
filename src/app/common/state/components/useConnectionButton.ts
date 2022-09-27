import { useRecoilState } from 'recoil';
import { walletAccount } from 'app/common/state/atoms';
import { connectToWallet } from 'app/common/functions/web3Client';

export const useConnectionButton = () => {
  const [, setWalletAccountAtom] = useRecoilState(walletAccount);

  const handleConnectWallet = async () => {
    const walletAddress = await connectToWallet();
    setWalletAccountAtom(walletAddress);
  };

  return {
    handleConnectWallet,
  };
};
