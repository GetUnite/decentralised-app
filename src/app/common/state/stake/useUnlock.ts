import { isNumeric, roundNumberDown } from 'app/common/functions/utils';
import {
  unlockAllAlluo,
  unlockAlluo,
  withdrawAlluo
} from 'app/common/functions/web3Client';
import { useNotification } from 'app/common/state';
import { useState } from 'react';

export const useUnlock = ({ alluoInfo, updateAlluoInfo }) => {
  // other state control files
  const { setNotificationt, resetNotification } = useNotification();

  // inputs
  const [unlockValue, setUnlockValue] = useState<number>(0);
  const [unlockValueError, setUnlockValueError] = useState<string>();

  // calculated data
  const [projectedUnlockValue, setProjectedUnlockValue] = useState<string>('0');

  // loading control
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);

  const resetState = () => {
    resetNotification();
    setIsUnlocking(false);
    setIsWithdrawing(false);
    setUnlockValueError('');
  };

  const handleUnlockValueChange = value => {
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setUnlockValueError('Write a valid number');
    }
    setUnlockValue(value);
    setProjectedUnlockValue(
      roundNumberDown(((value / 100) * +alluoInfo.locked), 2),
    );
  };

  const handleUnlock = async () => {
    resetState();
    setIsUnlocking(true);
    try {
      if (+unlockValue === 100) {
        await unlockAllAlluo();
      } else {
        await unlockAlluo(+alluoInfo.lockedInLp * (+unlockValue / 100));
      }
      await updateAlluoInfo();
      setNotificationt('Successfully unlocked', 'success');
    } catch (error) {
      setNotificationt(error, 'error');
    }
    setIsUnlocking(false);
  };

  const handleWithdraw = async () => {
    resetState();
    setIsWithdrawing(true);
    try {
      await withdrawAlluo();
      await updateAlluoInfo();
      setNotificationt('Successfully withdrew', 'success');
    } catch (error) {
      console.error('Error', error);
      setNotificationt(error, 'error');
    }
    setIsWithdrawing(false);
  };

  return {
    unlockValue,
    unlockValueError,
    projectedUnlockValue,
    hasErrors: unlockValueError != '',
    isUnlocking,
    isWithdrawing,
    handleUnlockValueChange,
    handleUnlock,
    handleWithdraw,
  };
};
