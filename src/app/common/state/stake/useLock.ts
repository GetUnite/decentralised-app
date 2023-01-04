import { EChain } from 'app/common/constants/chains';
import { heapTrack } from 'app/common/functions/heapClient';
import { approveAlluoStaking, lockAlluo } from 'app/common/functions/stake';
import { isNumeric } from 'app/common/functions/utils';
import { useNotification } from 'app/common/state';
import { useState } from 'react';

export const useLock = ({ alluoInfo, updateAlluoInfo }) => {
  // other state control files
  const { setNotification, resetNotification } = useNotification();

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
    } else if (+value > +alluoInfo?.balance) {
      setLockValueError('Insufficient balance');
    }
    setLockValue(value);
  };

  const handleApprove = async () => {
    resetState();
    setIsApproving(true);

    try {
      const tx = await approveAlluoStaking();
      setNotification(
        'Successfully approved',
        'success',
        tx.transactionHash,
        EChain.ETHEREUM,
      );
      await updateAlluoInfo();
    } catch (error) {
      setNotification(error, 'error');
    }

    setIsApproving(false);
  };

  const handleLock = async () => {
    resetState();
    setIsLocking(true);

    try {
      heapTrack('stakeLockAmount', { amount: lockValue });
      heapTrack('stakeLockButtonClicked');
      const tx = await lockAlluo(lockValue);
      setNotification(
        'Successfully locked',
        'success',
        tx.transactionHash,
        EChain.ETHEREUM,
      );
      await updateAlluoInfo();
      setLockValue(null);
    } catch (error) {
      setNotification(error, 'error');
    }

    setIsLocking(false);
  };

  return {
    lockValue,
    isApproving,
    isLocking,
    handleLockValueChange,
    handleApprove,
    handleLock,
    lockValueError,
    hasErrors: lockValueError != '',
  };
};
