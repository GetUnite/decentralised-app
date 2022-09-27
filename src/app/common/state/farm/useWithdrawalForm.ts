import { isNumeric } from 'app/common/functions/utils';
import {
  getIfUserHasWithdrawalRequest,
  isExpectedPolygonEvent,
  listenToHandler,
  withdrawStableCoin,
  withdrawFromBoosterFarm,
} from 'app/common/functions/w';
import { isSafeApp, walletAccount } from 'app/common/state/atoms';
import { useNotification } from 'app/common/state';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { EChain } from 'app/common/constants/chains';

export const useWithdrawalForm = ({
  selectedFarm,
  selectedSupportedToken,
  updateFarmInfo,
}) => {
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
  const { setNotificationt } = useNotification();
  const [isWithdrawalRequestsLoading, setIsWithdrawalRequestsLoading] =
    useState<boolean>(false);
  const [withdrawValue, setWithdrawValue] = useState<string>();
  const [blockNumber, setBlockNumber] = useState<number>();
  const [withdrawValueError, setWithdrawValueError] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [useBiconomy, setUseBiconomy] = useState(
    isSafeAppAtom || EChain.POLYGON != selectedFarm.chain ? false : true,
  );

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
      setWithdrawValueError(err.message);
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

  const handleWithdrawalFieldChange = value => {
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setWithdrawValueError('Write a valid number');
    } else if (+value > +selectedFarm?.depositedAmount) {
      setWithdrawValueError('Not enough balance');
    }
    setWithdrawValue(value);
  };

  const resetState = () => {
    setWithdrawValueError('');
    setIsWithdrawing(false);
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);

    try {
      let blockNumber;
      if (selectedFarm?.isBooster) {
        blockNumber = await withdrawFromBoosterFarm(
          selectedFarm.farmAddress,
          selectedSupportedToken.address,
          withdrawValue,
          selectedSupportedToken.decimals,
          selectedFarm.chain,
          useBiconomy,
        );
      } else {
        blockNumber = await withdrawStableCoin(
          selectedSupportedToken.address,
          withdrawValue,
          selectedFarm.type,
          selectedFarm.chain,
          useBiconomy,
        );
      }
      resetState();
      setBlockNumber(blockNumber);
      await updateFarmInfo();
    } catch (error) {
      resetState();
      setNotificationt(error, 'error');
    }
  };

  return {
    withdrawValueError,
    withdrawValue,
    handleWithdrawalFieldChange,
    isWithdrawalRequestsLoading,
    isWithdrawing,
    handleWithdraw,
    resetState,
    setUseBiconomy,
    useBiconomy,
    hasErrors: withdrawValueError != '',
  };
};
