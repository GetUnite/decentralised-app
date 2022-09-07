import { isNumeric } from 'app/common/functions/utils';
import {
  approveStableCoin,
  depositStableCoin,
} from 'app/common/functions/Web3Client';
import { ENotificationId, useNotification } from 'app/common/state';
import { useState } from 'react';

export const useDepositForm = ({
  selectedFarm,
  selectedStableCoin,
  updateFarmInfo,
}) => {
  const { setNotificationt } = useNotification();
  const [depositValue, setDepositValue] = useState<string>();
  const [error, setError] = useState<string>('');
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [biconomyStatus, setBiconomyStatus] = useState<boolean>(true);

  const resetState = () => {
    setError('');
    setIsApproving(false);
    setIsDepositing(false);
  };

  const handleApprove = async () => {
    setError('');
    setIsApproving(true);
    try {
      const res = await approveStableCoin(
        selectedStableCoin.value,
        selectedStableCoin.decimals,
        selectedFarm.type,
        selectedFarm.chain,
      );
      await updateFarmInfo();
      setNotificationt('Approved successfully', 'success');
    } catch (err) {
      setError(err.message);
    }
    setIsApproving(false);
  };

  const handleDepositFieldChange = e => {
    const { value } = e.target;
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setError('Write a valid number');
    } else if (+value > +selectedStableCoin?.balance) {
      setError('Not enough balance');
    }
    setDepositValue(value);
  };

  const setToMax = () => {
    setError('');
    setDepositValue(selectedStableCoin?.balance);
  };

  const handleDeposit = async () => {
    setError('');
    setIsDepositing(true);
    try {
      const res = await depositStableCoin(
        selectedStableCoin.value,
        depositValue,
        selectedStableCoin.decimals,
        selectedFarm.type,
        selectedFarm.chain,
        biconomyStatus,
      );
      await updateFarmInfo();
      resetState();
      setDepositValue(null);
      setNotificationt('Deposit successfully', 'success');
    } catch (err) {
      console.error('Error', err.message);
      resetState();
      setError(err.message);
    }
    setIsDepositing(false);
  };

  return {
    error,
    depositValue,
    handleDepositFieldChange,
    setToMax,
    isApproving,
    handleApprove,
    isDepositing,
    handleDeposit,
    setBiconomyStatus,
    biconomyStatus,
    resetState,
  };
};
