import { getIfUserHasWithdrawalRequest } from 'app/common/functions/farm';
import { TPossibleStep } from 'app/common/types/global';
import openVault from 'app/modernUI/animations/openVault.svg';
import vaultUnlocking from 'app/modernUI/animations/vaultUnlocking.svg';
import { useEffect, useState } from 'react';
import { useNotification } from '../useNotification';

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

export const useFarmWithdrawal = ({
  selectedFarmInfo,
  selectedSupportedToken,
  withdrawValue,
  setWithdrawValue,
  steps,
}) => {
  // other control files
  const { setNotification } = useNotification();

  // inputs
  const [withdrawValueError, setWithdrawValueError] = useState<string>('');

  // loading control
  const [isWithdrawalRequestsLoading, setIsWithdrawalRequestsLoading] =
    useState<boolean>(false);

  const fetchIfUserHasWithdrawalRequest = async () => {
    setIsWithdrawalRequestsLoading(true);
    try {
      const userRequests = await getIfUserHasWithdrawalRequest(
        selectedFarmInfo.farmAddress,
        selectedFarmInfo.chain,
      );
      const userRequestslength = userRequests.length;
      if (userRequestslength > 0) {
        const FULL_DAY_IN_HOURS = 86400;
        const lastRequest = userRequests[userRequestslength - 1];
        const remainingSeconds =
          Math.trunc(new Date().getTime() / 1000) - +lastRequest.time;
        const remainingTime = new Date(
          (FULL_DAY_IN_HOURS - remainingSeconds) * 1000,
        )
          .toISOString()
          .substr(11, 8);
        const message = `You have ${userRequestslength} ${
          userRequestslength === 1 ? 'request' : 'requests'
        } accepted, will be processed within ${remainingTime}`;
        // TODO: this message needs to be shown somewhere or input needs to be blocked if the value didnt update
      }
    } catch (error) {
      setNotification(error, 'error');
    }
    setIsWithdrawalRequestsLoading(false);
  };

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
    isWithdrawalRequestsLoading,
    hasErrors: withdrawValueError != '',
  };
};
