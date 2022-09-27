import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { walletAccount, tokenInfo } from 'app/common/state/atoms';
import { getTokenInfo } from 'app/common/functions/w';

export const useAccountInfo = () => {
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setTokenInfoAtom] = useRecoilState(tokenInfo);

  const setAccountInformation = async () => {
    setTokenInfoAtom({
      isLoading: true,
    });

    const tokenInfoData = await getTokenInfo(walletAccountAtom);

    setTokenInfoAtom(tokenInfoData);
  };

  useEffect(() => {
    if (walletAccountAtom) setAccountInformation();
  }, [walletAccountAtom]);
};
