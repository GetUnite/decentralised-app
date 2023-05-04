import { TPossibleStep } from 'app/common/types/global';
import openVault from 'app/modernUI/animations/openVault.svg';
import vaultUnlocking from 'app/modernUI/animations/vaultUnlocking.svg';
import { useEffect, useState } from 'react';

export const possibleWithdrawSteps: TPossibleStep[] = [
  {
    id: 2,
    label: '',
    errorLabel: 'Failed to withdraw tokens',
    successLabel: '',
    image: vaultUnlocking,
    successImage: openVault,
  },
];

export const useOptimisedFarmWithdrawal = ({
  selectedFarmInfo,
  selectedSupportedToken,
  withdrawValue,
  setWithdrawValue,
  steps,
}) => {
  // inputs
  const [withdrawValueError, setWithdrawValueError] = useState<string>('');

  // when the selected token changes, trigger balance update
  useEffect(() => {
    if (selectedFarmInfo) {
      updateSteps();
    }
  }, [withdrawValue]);

  // function that updates the balance of the selected token on change
  const updateSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    // Withdraw step is always there
    neededSteps.push({
      ...possibleWithdrawSteps[0],
      label: `Withdrawing ${withdrawValue} ${selectedSupportedToken.label}`,
      successLabel: `${withdrawValue} ${selectedSupportedToken.label} withdrawn`,
    });

    steps.current = neededSteps;
  };

  const handleWithdrawalFieldChange = value => {
    setWithdrawValueError('');
    if (+value > +selectedFarmInfo?.depositedAmount) {
      setWithdrawValueError('Insufficient balance');
    }
    setWithdrawValue(value);
  };

  return {
    withdrawValueError,
    handleWithdrawalFieldChange,
    hasErrors: withdrawValueError != '',
  };
};
