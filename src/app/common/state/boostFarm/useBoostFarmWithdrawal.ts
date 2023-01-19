import { getMaximumWithdrawAmount } from 'app/common/functions/boostFarm';
import { useEffect, useRef, useState } from 'react';

export const useBoostFarmWithdrawal = ({
  selectedFarmInfo,
  selectedSupportedToken,
  withdrawValue,
  setWithdrawValue,
}) => {
  // inputs validation
  const [withdrawValueError, setWithdrawValueError] = useState<string>('');

  // data
  const selectedSupportedTokenInfo = useRef<any>({
    boostDepositedAmount: 0,
  });

  // loading control
  const [isFetchingSupportedTokenInfo, setIsFetchingSupportedTokenInfo] =
    useState(true);

  // when the selected token changes, trigger balance update
  useEffect(() => {
    if (selectedFarmInfo && selectedSupportedToken) {
      updateSelectedTokenBalance();
    }
  }, [selectedSupportedToken]);

  // function that updates the balance of the selected token on change
  const updateSelectedTokenBalance = async () => {
    setIsFetchingSupportedTokenInfo(true);

    const boostDepositedAmount =
      selectedFarmInfo.current?.depositedAmountInLP > 0
        ? await getMaximumWithdrawAmount(
            selectedFarmInfo.current.farmAddress,
            selectedSupportedToken.address,
            selectedFarmInfo.current?.depositedAmountInLP,
          )
        : 0;
    selectedSupportedTokenInfo.current = {
      boostDepositedAmount: boostDepositedAmount,
    };

    await handleWithdrawalFieldChange(withdrawValue);

    setIsFetchingSupportedTokenInfo(false);
  };

  // handles withdraw input change
  const handleWithdrawalFieldChange = value => {
    setWithdrawValueError('');
    if (+value > selectedSupportedTokenInfo.current?.boostDepositedAmount) {
      setWithdrawValueError('Insufficient balance');
    }
    setWithdrawValue(value);
  };

  return {
    withdrawValueError,
    withdrawValue,
    handleWithdrawalFieldChange,
    hasErrors: withdrawValueError != '',
    isFetchingSupportedTokenInfo,
    selectedSupportedTokenInfo,
  };
};
