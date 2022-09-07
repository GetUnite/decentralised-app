import { useState, useEffect, useLayoutEffect } from 'react';
import { useRecoilState } from 'recoil';
import {
  approveAlluoTransaction,
  lockAlluoToken,
  getTokenInfo,
  EChain,
} from 'app/common/functions/Web3Client';
import { tokenInfo, walletAccount } from 'app/common/state/atoms';
import { useNotification, ENotificationId, useChain } from 'app/common/state';
import { isNumeric, maximumUint256Value } from 'app/common/functions/utils';

export const useLock = () => {
  const { notification, setNotification } = useNotification();
  const [tokenInfoAtom, setTokenInfoAtom] = useRecoilState(tokenInfo);
  const [walletAccountAtom, setWalletAccountAtom] = useRecoilState(
    walletAccount,
  );
  const { changeChainTo } = useChain();

  const [lockValue, setLockValue] = useState<string>();
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (walletAccountAtom) {
      changeChainTo(EChain.ETHEREUM);
    }
  }, [walletAccountAtom]);

  const resetState = () => {
    setError('');
    setSuccessNotification('');
    setIsLocking(false);
    setIsApproving(false);
  };

  const setSuccessNotification = message => {
    setNotification({
      id: ENotificationId.LOCK,
      type: 'success',
      message: message,
    });
  };
  const setErrorNotification = message => {
    setNotification({
      id: ENotificationId.LOCK,
      type: 'error',
      message: message,
    });
  };

  const handleLockValueChange = e => {
    const { value } = e.target;

    resetState();
    if (isNumeric(value) || value === '' || value === '.') setLockValue(value);
    else setError('Write a valid number');
  };

  const handleSetLockToMax = () => {
    resetState();
    setLockValue(tokenInfoAtom.alluoBalance + '');
  };

  const setAccountInformation = async () => {
    setTokenInfoAtom({
      isLoading: true,
    });

    const tokenInfoData = await getTokenInfo(walletAccountAtom);
    setTokenInfoAtom(tokenInfoData);
  };

  const handleApprove = async () => {
    setErrorNotification('');
    setSuccessNotification('');
    setIsApproving(true);
    try {
      const res = await approveAlluoTransaction(maximumUint256Value);

      setAccountInformation();
    } catch (err) {
      console.error('Error', err.message);
      resetState();
      setErrorNotification(err.message);
    }
    setIsApproving(false);
  };
  const handleLockAction = async () => {
    setErrorNotification('');
    setSuccessNotification('');
    setIsLocking(true);
    try {
      const res = await lockAlluoToken(lockValue);
      setAccountInformation();
      setErrorNotification('');
      setLockValue(null);
      setSuccessNotification('Successfully locked');
    } catch (err) {
      console.error('Error', err.message);
      resetState();
      setErrorNotification(err.message);
    }
    setIsLocking(false);
  };

  const setToMax = () => {
    setError('');
    setLockValue(tokenInfoAtom.alluoBalance);
  };

  return {
    notificationId: ENotificationId.LOCK,
    error,
    lockValue,
    isApproving,
    isLocking,
    handleLockValueChange,
    handleSetLockToMax,
    handleApprove,
    handleLockAction,

    setToMax,
  };
};
