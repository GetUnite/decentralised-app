import { EChain } from 'app/common/constants/chains';
import {
    getAlluoBalance,
    getAlluoStakingAllowance,
    getAlluoStakingAPR,
    getAlluoStakingWalletAddressInfo,
    getEarnedAlluo,
    getTotalAlluoStakedInUsd
} from 'app/common/functions/stake';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

export type TAlluoStakingInfo = {
  balance?: string;
  allowance?: string;
  stakedInUsd?: string;
  apr?: number;
  totalStakedInUsd?: string;
  earned?: string;
};

export const useStake = () => {
  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // alluo info
  const [alluoInfo, setAlluoInfo] = useState<TAlluoStakingInfo>();

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.ETHEREUM);
      updateAlluoInfo();
    }
  }, [walletAccountAtom]);

  const updateAlluoInfo = async () => {
    setIsLoading(true);
    try {
      let info: TAlluoStakingInfo = {
        balance: await getAlluoBalance(),
        allowance: await getAlluoStakingAllowance(),
        apr: await getAlluoStakingAPR(),
        totalStakedInUsd: await getTotalAlluoStakedInUsd(),
        earned: await getEarnedAlluo(),
      };
      const alluoStakingWalletAddressInfo =
        await getAlluoStakingWalletAddressInfo();
      info.stakedInUsd = (
        await alluoStakingWalletAddressInfo.stakedInUsd
      ).toString();

      setAlluoInfo(info);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  return {
    isLoading,
    alluoInfo,
    updateAlluoInfo,
  };
};
