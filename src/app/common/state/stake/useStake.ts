import { EChain } from 'app/common/constants/chains';
import { heapTrack } from 'app/common/functions/heapClient';
import {
  getAlluoBalance,
  getAlluoStakingAllowance,
  getAlluoStakingAPR,
  getAlluoStakingWalletAddressInfo,
  getEarnedAlluo,
  getTotalAlluoLocked,
  getUnlockedAlluo,
  withdrawAlluo
} from 'app/common/functions/stake';
import { roundNumberDown } from 'app/common/functions/utils';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useNotification } from '../useNotification';

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

  // other state control files
  const { setNotification, resetNotification } = useNotification();

  // alluo info
  const [alluoInfo, setAlluoInfo] = useState<TAlluoStakingInfo>();

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);

  // confirmation/information control
  const [showReunlockConfirmation, setShowReunlockConfirmation] =
    useState<boolean>(false);

  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.ETHEREUM);
      heapTrack('stake');
      updateAlluoInfo();
    }
  }, [walletAccountAtom]);

  const resetState = () => {
    resetNotification();
    setShowReunlockConfirmation(false);
    setIsWithdrawing(false);
  };

  const updateAlluoInfo = async () => {
    setShowReunlockConfirmation(false);
    setIsLoading(true);
    try {
      let info: TAlluoStakingInfo = {
        balance: await getAlluoBalance(),
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

  const handleWithdraw = async () => {
    resetState();
    setIsWithdrawing(true);
    try {
      await withdrawAlluo();
      await updateAlluoInfo();
      setNotification('Successfully withdrew', 'success');
    } catch (error) {
      console.error('Error', error);
      setNotification(error, 'error');
    }
    setIsWithdrawing(false);
  };

  const startReunlockConfirmation = () => {
    setShowReunlockConfirmation(true);
  };

  const cancelReunlockConfirmation = () => {
    setShowReunlockConfirmation(false);
  };

  return {
    walletAccountAtom,
    isLoading,
    alluoInfo,
    updateAlluoInfo,
    handleWithdraw,
    isWithdrawing,
    startReunlockConfirmation,
    showReunlockConfirmation,
    cancelReunlockConfirmation,
  };
};
