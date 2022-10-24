import { isNumeric } from 'app/common/functions/utils';
import { useNotification } from 'app/common/state';
import { useState } from 'react';

export const useLock = ({ alluoStakingInfo, handleApprove, handleLock }) => {
  // other state control files
  const { resetNotification } = useNotification();

  // inputs
  const [lockValue, setLockValue] = useState<string>();
  const [lockValueError, setLockValueError] = useState<string>();

  // loading control
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isLocking, setIsLocking] = useState<boolean>(false);

  const resetState = () => {
    resetNotification();
    setLockValueError('');
    setIsApproving(false);
    setIsLocking(false);
  };

  const handleLockValueChange = value => {
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setLockValueError('Write a valid number');
    } else if (+value > +alluoStakingInfo?.balance) {
      setLockValueError('Insufficient balance');
    }
    setLockValue(value);
  };

  const startApprove = async () => {
    setIsApproving(true);
    await handleApprove()
    setIsApproving(false);
  };

  const startLock = async () => {
    setIsLocking(true);
    await handleLock(lockValue)
    setLockValue(null);
    setIsLocking(false);
  };


  return {
    // info
    lockValue,
    // loading control
    isApproving,
    isLocking,
    // lock functions
    startApprove,
    startLock,
    // input validations
    handleLockValueChange,
    lockValueError,
    hasErrors: lockValueError != '',
  };
};
