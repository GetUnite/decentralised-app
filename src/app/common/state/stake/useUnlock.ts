import { unlockAllAlluo, unlockAlluo } from 'app/common/functions/stake';
import { isNumeric, roundNumberDown } from 'app/common/functions/utils';
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

  const resetState = () => {
    resetNotification();
    setIsUnlocking(false);
    setUnlockValueError('');
  };

  const handleUnlockValueChange = value => {
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setUnlockValueError('Write a valid number');
    }
    setUnlockValue(value);
    setProjectedUnlockValue(
      roundNumberDown((value / 100) * +alluoInfo.locked, 2),
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
      setNotificationt('Successfully unlocked', 'success');
      await updateAlluoInfo();
    } catch (error) {
      setNotificationt(error, 'error');
    }
    setIsUnlocking(false);
  };

  return {
    unlockValue,
    unlockValueError,
    projectedUnlockValue,
    hasErrors: unlockValueError != '',
    isUnlocking,
    handleUnlockValueChange,
    handleUnlock,
  };
};
