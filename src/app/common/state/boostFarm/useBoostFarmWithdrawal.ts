import { EChain } from 'app/common/constants/chains';
import { convertToLP, withdrawFromBoosterFarm } from 'app/common/functions/farm';
import { isNumeric } from 'app/common/functions/utils';
import {
  getIfUserHasWithdrawalRequest,
  isExpectedPolygonEvent,
  listenToHandler,
  withdrawStableCoin
} from 'app/common/functions/web3Client';
import { useNotification } from 'app/common/state';
import { isSafeApp, walletAccount } from 'app/common/state/atoms';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

export const useBoostFarmWithdrawal = ({
  selectedFarm,
  selectedSupportedToken,
  updateFarmInfo,
}) => {
  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [isSafeAppAtom] = useRecoilState(isSafeApp);

  // other state control files
  const { setNotification } = useNotification();

  // biconomy
  const [useBiconomy, setUseBiconomy] = useState(
    isSafeAppAtom || EChain.POLYGON != selectedFarm?.chain ? false : true,
  );

  // inputs
  const [withdrawValue, setWithdrawValue] = useState<string>();
  const [withdrawValueError, setWithdrawValueError] = useState<string>('');

  // loading control
  const [isWithdrawalRequestsLoading, setIsWithdrawalRequestsLoading] =
    useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [blockNumber, setBlockNumber] = useState<number>();

  useEffect(() => {
    if (walletAccountAtom && selectedFarm) {
      fetchIfUserHasWithdrawalRequest();
    }
  }, [walletAccountAtom]);

  const fetchIfUserHasWithdrawalRequest = async () => {
    // This method of getting if the user already has an withdraw request only works for iballuo farms which are now not the only ones....
    if (selectedFarm.type == 'booster') return;
    resetState();
    setIsWithdrawalRequestsLoading(true);
    try {
      const userRequests = await getIfUserHasWithdrawalRequest(
        walletAccountAtom,
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
        setNotification(message, 'success');
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
            setNotification('Withdrew successfully', 'success');
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
            setNotification(
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
    } else if (+value > (selectedFarm.isBooster ? selectedSupportedToken.boosterDepositedAmount : +selectedFarm?.depositedAmount)) {
      setWithdrawValueError('Insufficient balance');
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
          // The withdraw value is always referent to the selected supported token
          // But the contract for booster farm withdrawal expects the value as LP/Shares
          // Thus, convert the value into LP
          await convertToLP(withdrawValue, selectedSupportedToken.address, selectedSupportedToken.decimals, selectedFarm.valueOf1LPinUSDC),
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
      setNotification(error, 'error');
    }

    setIsWithdrawing(false);
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
