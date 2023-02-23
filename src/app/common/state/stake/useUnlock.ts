import { isNumeric, toExactFixed } from 'app/common/functions/utils';
import { TPossibleStep } from 'app/common/types/global';
import vaultUnlocking from 'app/modernUI/animations/vaultUnlocking.svg';
import { useEffect, useState } from 'react';

export const possibleUnlockSteps: TPossibleStep[] = [
  {
    id: 2,
    label: 'Unlock',
    errorLabel: 'Failed to unlock tokens',
    successLabel: '',
    image: vaultUnlocking
  },
];

export const useUnlock = ({
  alluoInfo,
  unlockValue,
  setUnlockValue,
  steps,
}) => {
  // inputs
  const [unlockValueError, setUnlockValueError] = useState<string>();

  // calculated data
  const [projectedUnlockValue, setProjectedUnlockValue] = useState<string>('0');

  // when the selected token changes, trigger balance update
  useEffect(() => {
    updateSteps();
  }, [unlockValue]);

  // function that updates the balance of the selected token on change
  const updateSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    // Withdraw step is always there
    neededSteps.push({
      ...possibleUnlockSteps[0],
      label: `Unlocking ${+alluoInfo.lockedInLp * (+unlockValue / 100)} $ALLUO`,
      successLabel: `${+alluoInfo.lockedInLp * (+unlockValue / 100)} $ALLUO unlocked`,
    });

    steps.current = neededSteps;
  };

  const handleUnlockValueChange = value => {
    setUnlockValueError('');
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setUnlockValueError('Write a valid number');
    }
    setUnlockValue(value);
    setProjectedUnlockValue(toExactFixed((value / 100) * +alluoInfo.locked, 2));
  };

  return {
    unlockValueError,
    projectedUnlockValue,
    hasErrors: unlockValueError != '',
    handleUnlockValueChange,
  };
};
