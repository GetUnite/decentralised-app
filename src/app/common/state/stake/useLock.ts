import { TPossibleStep } from 'app/common/types/global';
import { useEffect, useState } from 'react';

export const possibleLockSteps: TPossibleStep[] = [
  {
    id: 0,
    label: 'Approve lock',
    successLabel: 'Lock approved',
    errorLabel: 'Approval failed',
  },
  {
    id: 1,
    label: 'Lock',
    successLabel: '',
    errorLabel: 'Failed to lock tokens',
  },
];

export const useLock = ({
  alluoInfo,
  lockValue,
  setLockValue,
  steps
}) => {
  // inputs
  const [lockValueError, setLockValueError] = useState<string>();

  // loading control
  const [isLoadingRequiredSteps, setIsLoadingRequiredSteps] = useState(true);

  useEffect(() => {
    if (alluoInfo?.allowance != undefined) {
      updateSteps();
    }
  }, [alluoInfo, lockValue]);

  const updateSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    // If the allowance is not higher than 0 ask for approval
    if (!(+alluoInfo?.allowance > 0)) {
      neededSteps.push(possibleLockSteps[0]);
    }

    // Lock step is always there
    neededSteps.push({
      ...possibleLockSteps[1],
      label: `Lock ${lockValue} $ALLUO`,
      successLabel: `${lockValue} $ALLUO locked`,
    });

    steps.current = neededSteps;

    setIsLoadingRequiredSteps(false);
  };

  const handleLockValueChange = value => {
    setLockValueError('');
    if (+value > +alluoInfo?.balance) {
      setLockValueError('Insufficient balance');
    }
    setLockValue(value);
  };

  return {
    handleLockValueChange,
    lockValueError,
    hasErrors: lockValueError != '',
    isLoadingRequiredSteps,
  };
};
