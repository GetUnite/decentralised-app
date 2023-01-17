import {
  convertFromUSDC
} from 'app/common/functions/boostFarm';
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
  const selectedSupportedTokenInfo =
    useRef<any>({
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

    // For booster farm withdrawals
    // The balance of the farm is returned in LP which is converted into USDC and needs to be converted to each supported token for withdrawal
    // ex: wETH is selected => depositedAmount = 1500 USDC = 1 wETH => Max withdraw value is 1
    const boostDepositedAmount = await convertFromUSDC(
      selectedSupportedToken.address,
      selectedSupportedToken.decimals,
      // here the deposited amount is in USDC
      selectedFarmInfo.current?.depositedAmount,
    );
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
