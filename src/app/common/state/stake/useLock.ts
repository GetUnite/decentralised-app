import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import {
  approveAlluoTransaction,
  lockAlluoToken,
  getTokenInfo,
  EChain,
} from 'app/common/functions/Web3Client';
import { tokenInfo, walletAccount, wantedChain } from 'app/common/state/atoms';
import { useNotification, ENotificationId } from 'app/common/state';
import { isNumeric, maximumUint256Value } from 'app/common/functions/utils';

export const useLock = () => {
  const { setNotificationt, resetNotification } = useNotification();
  const [tokenInfoAtom, setTokenInfoAtom] = useRecoilState(tokenInfo);
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  const [lockValue, setLockValue] = useState<string>();
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.ETHEREUM);
      setAccountInformation();
    }
  }, [walletAccountAtom]);

  const resetState = () => {
    setError('');
    resetNotification();
    setIsLocking(false);
    setIsApproving(false);
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
    resetNotification();
    setIsApproving(true);

    try {
      await approveAlluoTransaction(maximumUint256Value);
      setAccountInformation();
    } catch (err) {
      console.error('Error', err.message);
      setNotificationt(err.message, 'error');
    }
    
    setIsApproving(false);
  };
  const handleLockAction = async () => {
    resetNotification();
    setIsLocking(true);

    try {
      await lockAlluoToken(lockValue);
      setAccountInformation();
      setLockValue(null);
      setNotificationt('Successfully locked', 'success');
    } catch (err) {
      console.error('Error', err.message);
      setNotificationt(err.message, error);
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
