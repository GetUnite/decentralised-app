import { EChain } from 'app/common/constants/chains';
import { withdraw } from 'app/common/functions/farm';
import { isNumeric } from 'app/common/functions/utils';
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
  const [withdrawValue, setWithdrawValue] = useState<string>();
  const [withdrawValueError, setWithdrawValueError] = useState<string>('');

  // loading control
  const [isWithdrawalRequestsLoading, setIsWithdrawalRequestsLoading] =
    useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);

  useEffect(() => {
    if (selectedFarm) {
      setUseBiconomy(isSafeAppAtom || EChain.POLYGON != selectedFarm?.chain ? false : true)
    }
  }, [selectedFarm]);

  const handleWithdrawalFieldChange = value => {
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setWithdrawValueError('Write a valid number');
    } else if (
      +value >
      (selectedFarm.isBoost
        ? selectedSupportedToken.boosterDepositedAmount
        : +selectedFarm?.depositedAmount)
    ) {
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
      const tx = await withdraw(
        selectedSupportedToken.address,
        selectedFarm.farmAddress,
        withdrawValue,
        selectedFarm.chain,
        useBiconomy,
      );
      resetState();
      setNotification(
        'Successfully withdrew',
        'success',
        tx.transactionHash,
        selectedFarm.chain,
      );
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
