import { useRecoilState } from 'recoil';
import { walletAccount } from 'app/common/state/atoms';
import { connectToWallet } from 'app/common/functions/Web3Client';

export const useConnection = () => {
  const [, setWalletAccountAtom] = useRecoilState(walletAccount);

  const handleConnectWallet = async () => {
    const walletAddress = await connectToWallet();
    setWalletAccountAtom(walletAddress);
  };

  return {
    handleConnectWallet,
  };
};
