import { EChain } from 'app/common/constants/chains';
import {
  getIfUserHasWithdrawalRequest,
  withdraw
} from 'app/common/functions/farm';
import { useNotification } from 'app/common/state';
import { isSafeApp, walletAccount } from 'app/common/state/atoms';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

export const useFarmWithdrawal = ({
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
  const [useBiconomy, setUseBiconomy] = useState(true);

  // inputs
  const [withdrawValue, setWithdrawValue] = useState<string>('');
  const [withdrawValueError, setWithdrawValueError] = useState<string>('');

  // loading control
  const [isWithdrawalRequestsLoading, setIsWithdrawalRequestsLoading] =
    useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);

  useEffect(() => {
    if (selectedFarm) {
      setUseBiconomy(
        isSafeAppAtom || EChain.POLYGON != selectedFarm?.chain ? false : true,
      );
    }
  }, [selectedFarm]);

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

  const handleWithdraw = async () => {
    setIsWithdrawing(true);

    try {
      const tx = await withdraw(
        selectedSupportedToken.address,
        selectedFarm.farmAddress,
        +withdrawValue,
        selectedFarm.chain,
        useBiconomy,
      );
      setNotification(
        'Successfully withdrew',
        'success',
        tx.transactionHash,
        selectedFarm.chain,
      );
      await updateFarmInfo();
    } catch (error) {
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
    setUseBiconomy,
    useBiconomy,
    hasErrors: withdrawValueError != '',
  };
};
