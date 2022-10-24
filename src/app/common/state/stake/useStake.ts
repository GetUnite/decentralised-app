import { EChain } from 'app/common/constants/chains';
import {
  approveAlluoStaking,
  getAlluoBalance,
  getAlluoStakingAllowance,
  getAlluoStakingAPR,
  getAlluoStakingWalletAddressInfo,
  getEarnedAlluo,
  getTotalAlluoLocked,
  getUnlockedAlluo,
  lockAlluo,
  unlockAllAlluo,
  unlockAlluo,
  withdrawAlluo
} from 'app/common/functions/stake';
import { toExactFixed } from 'app/common/functions/utils';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { TTokenInfo } from 'app/common/types/global';
import { TAlluoStakingInfo } from 'app/common/types/stake';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useNotification } from '../useNotification';

export const useStake = () => {
  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // other state control files
  const { setNotificationt, resetNotification } = useNotification();

  // staking and alluo token info
  const [alluoTokenInfo, setAlluoTokenInfo] = useState<TTokenInfo>();
  const [alluoStakingInfo, setAlluoStakingInfo] = useState<TAlluoStakingInfo>();

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);

  // confirmation/information control
  const [showReunlockConfirmation, setShowReunlockConfirmation] =
    useState<boolean>(false);
  const showTabs = !showReunlockConfirmation;

  useEffect(() => {
    const fetchRequiredData = async () => {
      const tokenInfo: TTokenInfo = {
        balance: toExactFixed(await getAlluoBalance(), 2),
        allowance: await getAlluoStakingAllowance(),
      };
      setAlluoTokenInfo(tokenInfo);

      const totalAlluoLocked = await getTotalAlluoLocked();
      const alluoStakingWalletAddressInfo =
        await getAlluoStakingWalletAddressInfo();
      const stakingInfo: TAlluoStakingInfo = {
        apr: toExactFixed(await getAlluoStakingAPR(totalAlluoLocked), 2),
        totalLocked: toExactFixed(totalAlluoLocked, 2),
        earned: toExactFixed(await getEarnedAlluo(), 2),
        unlocked: toExactFixed(await getUnlockedAlluo(), 2),
        locked: toExactFixed(alluoStakingWalletAddressInfo.locked, 2),
        lockedInLp: toExactFixed(alluoStakingWalletAddressInfo.lockedInLp, 2),
        depositUnlockTime: toExactFixed(
          alluoStakingWalletAddressInfo.depositUnlockTime,
          2,
        ),
        withdrawUnlockTime: toExactFixed(
          alluoStakingWalletAddressInfo.withdrawUnlockTime,
          2,
        ),
      };

      setAlluoStakingInfo(stakingInfo);

      setIsLoading(false);
    };
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.ETHEREUM);
      fetchRequiredData();
    }
  }, [walletAccountAtom]);

  // lock functions
  const updateAlluoTokenInfoAfterApprove = async () => {
    setAlluoTokenInfo({
      ...alluoTokenInfo,
      allowance: await getAlluoStakingAllowance(),
    });
  };
  const handleApprove = async () => {
    try {
      const tx = await approveAlluoStaking();
      await updateAlluoTokenInfoAfterApprove();
    } catch (err) {
      console.error('Error', err.message);
      setNotificationt(err.message, 'error');
    }
  };

  const updateInfoAfterLock = async () => {
    setAlluoTokenInfo({ ...alluoTokenInfo, balance: await getAlluoBalance() });
  };
  const handleLock = async lockValue => {
    try {
      const tx = await lockAlluo(lockValue);
      await updateInfoAfterLock();
      setNotificationt('Successfully locked', 'success');
    } catch (error) {
      setNotificationt(error, 'error');
    }
  };

  // unlock functions
  const updateAlluoStakingInfoAfterUnlock = async () => {
    
  };
  const handleUnlock = async (unlockValue) => {
    try {
      if (+unlockValue === 100) {
        await unlockAllAlluo();
      } else {
        await unlockAlluo(+alluoStakingInfo.lockedInLp * (+unlockValue / 100));
      }
      await updateAlluoStakingInfoAfterUnlock();
      setNotificationt('Successfully unlocked', 'success');
    } catch (error) {
      setNotificationt(error, 'error');
    }
  }
  
  // rewards withdraw functions
  const updateAlluoStakingInfoAfterWithdraw = async () => {
    setAlluoStakingInfo({ ...alluoStakingInfo, earned: '0' });
  };
  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    try {
      const tx = await withdrawAlluo();
      await updateAlluoStakingInfoAfterWithdraw();
      setNotificationt('Successfully withdrew', 'success');
    } catch (error) {
      console.error('Error', error);
      setNotificationt(error, 'error');
    }
    setIsWithdrawing(false);
  };

  // confirmation/information control functions
  const startReunlockConfirmation = () => {
    setShowReunlockConfirmation(true);
  };

  const cancelReunlockConfirmation = () => {
    setShowReunlockConfirmation(false);
  };

  return {
    // info
    alluoTokenInfo,
    alluoStakingInfo,
    walletAccountAtom,
    // loading control
    isLoading,
    isWithdrawing,
    // lock functions
    handleApprove,
    handleLock,
    //unlock functions
    handleUnlock,
    // withdraw functions
    handleWithdraw,
    // information/confirmation control
    startReunlockConfirmation,
    showReunlockConfirmation,
    cancelReunlockConfirmation,
    showTabs,
  };
};
