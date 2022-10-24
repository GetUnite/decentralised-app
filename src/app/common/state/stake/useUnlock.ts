import { isNumeric, roundNumberDown } from 'app/common/functions/utils';
import { useState } from 'react';

export const useUnlock = ({ alluoStakingInfo, handleUnlock }) => {
  // inputs
  const [unlockValue, setUnlockValue] = useState<number>(0);
  const [unlockValueError, setUnlockValueError] = useState<string>();

  // calculated data
  const [projectedUnlockValue, setProjectedUnlockValue] = useState<string>('0');

  // loading control
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);

  const handleUnlockValueChange = value => {
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setUnlockValueError('Write a valid number');
    }
    setUnlockValue(value);
    setProjectedUnlockValue(
      roundNumberDown((value / 100) * +alluoStakingInfo.locked, 2),
    );
  };

  const startUnlock = async () => {
    setIsUnlocking(true);
    await handleUnlock(unlockValue);
    setIsUnlocking(false);
  };

  return {
    unlockValue,
    unlockValueError,
    projectedUnlockValue,
    hasErrors: unlockValueError != '',
    isUnlocking,
    startUnlock,
    handleUnlockValueChange,
    handleUnlock,
  };
};
