import { isNumeric, toExactFixed } from 'app/common/functions/utils';
import {
  getIfUserHasWithdrawalRequest,
  getUserDepositedTransferAmount,
  isExpectedPolygonEvent,
  listenToHandler,
  withdrawStableCoin,
} from 'app/common/functions/Web3Client';
import { walletAccount } from 'app/common/state/atoms';
import { ENotificationId, useNotification } from 'app/common/state';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

export const useWithdrawalForm = ({
  selectedFarm,
  selectedSupportedToken,
  updateFarmInfo,
}) => {
  const [walletAccountAtom] = useRecoilState(walletAccount);

  const { setNotificationt } = useNotification();
  const [isWithdrawalRequestsLoading, setIsWithdrawalRequestsLoading] =
    useState<boolean>(false);
  const [withdrawValue, setWithdrawValue] = useState<string>();
  const [blockNumber, setBlockNumber] = useState<number>();
  const [error, setError] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [biconomyStatus, setBiconomyStatus] = useState<boolean>(true);

  useEffect(() => {
    if (walletAccountAtom) {
      fetchIfUserHasWithdrawalRequest();
    }
  }, [walletAccountAtom]);

  const fetchIfUserHasWithdrawalRequest = async () => {
    resetState();
    setIsWithdrawalRequestsLoading(true);
    try {
      const userRequests = await getIfUserHasWithdrawalRequest(
        walletAccountAtom,
        selectedFarm.type,
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
        setNotificationt(message, 'success');
      }
    } catch (err) {
      setError(err.message);
    }
    setIsWithdrawalRequestsLoading(false);
  };

  useEffect(() => {
    let bufferListener;
    if (blockNumber) {
      bufferListener = listenToHandler(blockNumber);
      bufferListener.WithdrawalSatisfied(
        { fromBlock: blockNumber },
        async function (error, event) {
          if (error) console.error(error);
          if (
            event.blockNumber === blockNumber &&
            isExpectedPolygonEvent(selectedFarm.type, event.returnValues?.[0])
          ) {
            resetState();
            setWithdrawValue(null);
            setIsWithdrawing(false);
            setNotificationt('Withdrew successfully', 'success');
          }
        },
      );
      bufferListener.AddedToQueue(
        { fromBlock: blockNumber },
        function (error, event) {
          if (error) console.error(error);
          if (
            event.blockNumber === blockNumber &&
            isExpectedPolygonEvent(selectedFarm.type, event.returnValues?.[0])
          ) {
            resetState();
            setWithdrawValue(null);
            setIsWithdrawing(false);
            setNotificationt(
              'Request accepted and will be processed within 24 hours',
              'success',
            );
          }
        },
      );
    }
    return () => {};
  }, [blockNumber]);

  const handleWithdrawalFieldChange = e => {
    const { value } = e.target;
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setError('Write a valid number');
    } else if (+value > +selectedFarm?.depositedAmount) {
      setError('Not enough balance');
    }
    setWithdrawValue(value);
  };

  const resetState = () => {
    setError('');
    setIsWithdrawing(false);
  };

  const handleWithdraw = async () => {
    setError('');
    setIsWithdrawing(true);
    try {
      const res = await withdrawStableCoin(
        selectedSupportedToken.value,
        withdrawValue,
        selectedFarm.type,
        selectedFarm.chain,
        biconomyStatus,
      );
      await updateFarmInfo();
      resetState();
      setBlockNumber(res);
    } catch (err) {
      resetState();
      setNotificationt(err.message, 'error');
    }
  };

  const setToMax = async () => {
    try {
      const res = await getUserDepositedTransferAmount(selectedFarm.type);
      setWithdrawValue(toExactFixed(res, selectedSupportedToken.decimals));
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    notificationId: ENotificationId.WITHDRAWAL,
    error,
    withdrawValue,
    handleWithdrawalFieldChange,
    setToMax,
    isWithdrawalRequestsLoading,
    isWithdrawing,
    handleWithdraw,
    resetState,
    setBiconomyStatus,
    biconomyStatus,
  };
};
