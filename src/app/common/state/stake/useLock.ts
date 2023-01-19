import { TPossibleStep } from 'app/common/types/global';
import { useEffect, useState } from 'react';

const possibleLockSteps: TPossibleStep[] = [
  { id: 0, label: 'Approve' },
  { id: 1, label: 'Lock' },
];

export const useLock = ({
  alluoInfo,
  setLockValue,
  handleApprove,
  handleLock,
}) => {
  // inputs
  const [lockValueError, setLockValueError] = useState<string>();

  // lock steps
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [lockSteps, setLockSteps] = useState<TPossibleStep[]>();

  // loading control
  const [isLoadingRequiredSteps, setIsLoadingRequiredSteps] = useState(true);

  useEffect(() => {
    if (alluoInfo?.allowance != undefined) {
      loadRequiredSteps();
    }
  }, [alluoInfo]);

  const loadRequiredSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    // If the allowance is not higher than 0 ask for approval
    if (!(+alluoInfo?.allowance > 0)) {
      neededSteps.push(possibleLockSteps[0]);
    }

    // Lock step is always there
    neededSteps.push(possibleLockSteps[1]);

    setLockSteps(neededSteps);

    setIsLoadingRequiredSteps(false);
  };

  const handleLockValueChange = value => {
    setLockValueError('');
    if (+value > +alluoInfo?.balance) {
      setLockValueError('Insufficient balance');
    }
    setLockValue(value);
  };

  // executes the handle for the current step
  const handleCurrentStep = async () => {
    const possibleDepositStep = possibleLockSteps.find(
      possibleDepositStep =>
        possibleDepositStep.id == lockSteps[currentStep].id,
    );

    switch (possibleDepositStep.id) {
      case 0:
        await handleApprove();
        // Next step
        setCurrentStep(currentStep + 1);
        break;

      case 1:
        await handleLock();
        break;
    }
  };

  return {
    currentStep,
    lockSteps,
    handleCurrentStep,
    handleLockValueChange,
    lockValueError,
    hasErrors: lockValueError != '',
    isLoadingRequiredSteps,
  };
};
