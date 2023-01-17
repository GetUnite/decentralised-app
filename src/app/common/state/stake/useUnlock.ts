import { isNumeric, toExactFixed } from 'app/common/functions/utils';
import { useState } from 'react';

export const useUnlock = ({ alluoInfo, setUnlockValue }) => {
  // inputs
  const [unlockValueError, setUnlockValueError] = useState<string>();

  // calculated data
  const [projectedUnlockValue, setProjectedUnlockValue] = useState<string>('0');

  const handleUnlockValueChange = value => {
    setUnlockValueError('');
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setUnlockValueError('Write a valid number');
    }
    setUnlockValue(value);
    setProjectedUnlockValue(
      toExactFixed((value / 100) * +alluoInfo.locked, 2),
    );
  };

  return {
    unlockValueError,
    projectedUnlockValue,
    hasErrors: unlockValueError != '',
    handleUnlockValueChange,
  };
};
