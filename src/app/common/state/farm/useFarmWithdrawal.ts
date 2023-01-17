import { getIfUserHasWithdrawalRequest } from 'app/common/functions/farm';
import { useState } from 'react';
import { useNotification } from '../useNotification';

export const useFarmWithdrawal = ({ selectedFarm, setWithdrawValue }) => {
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
        selectedFarm.farmAddress,
        selectedFarm.chain,
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

  const handleWithdrawalFieldChange = value => {
    setWithdrawValueError('');
    if (+value > +selectedFarm?.depositedAmount) {
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
