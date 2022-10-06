import { EChain } from 'app/common/constants/chains';
import {
  getAlluoBalance,
  getAlluoStakingAllowance,
  getAlluoStakingAPR,
  getAlluoStakingWalletAddressInfo,
  getEarnedAlluo,
  getTotalAlluoLocked,
  getUnlockedAlluo
} from 'app/common/functions/stake';
import { roundNumberDown } from 'app/common/functions/utils';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

export type TAlluoStakingInfo = {
  balance?: string;
  allowance?: string;
  locked?: string;
  lockedInLp?: string;
  apr?: string;
  totalLocked?: string;
  earned?: string;
  unlocked?: string;
  depositUnlockTime?: string;
  withdrawUnlockTime?: string;
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
        balance: roundNumberDown(await getAlluoBalance(), 2),
        allowance: await getAlluoStakingAllowance(),
        apr: (await getAlluoStakingAPR()).toLocaleString(),
        totalLocked: roundNumberDown(await getTotalAlluoLocked(), 2),
        earned: roundNumberDown(await getEarnedAlluo(), 2),
        unlocked: await getUnlockedAlluo(),
      };
      const alluoStakingWalletAddressInfo =
        await getAlluoStakingWalletAddressInfo();
      info.locked = alluoStakingWalletAddressInfo.locked;
      info.lockedInLp = alluoStakingWalletAddressInfo.lockedInLp;
      info.depositUnlockTime =
        await alluoStakingWalletAddressInfo.depositUnlockTime;
      info.withdrawUnlockTime =
        await alluoStakingWalletAddressInfo.withdrawUnlockTime;

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
