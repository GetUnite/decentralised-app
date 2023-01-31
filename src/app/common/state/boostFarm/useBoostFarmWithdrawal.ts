import { getMaximumLPValueAsToken } from 'app/common/functions/boostFarm';
import { TPossibleStep } from 'app/common/types/global';
import vaultUnlocking from 'app/modernUI/animations/vaultUnlocking.svg';
import vaultBottomLeft from 'app/modernUI/images/vaults/vault-bottom-left.svg';
import { useEffect, useState } from 'react';

export const possibleWithdrawSteps: TPossibleStep[] = [
  {
    id: 3,
    label: 'Withdraw',
    errorLabel: 'Failed to withdraw tokens',
    successLabel: '',
    image: vaultUnlocking,
    successImage: vaultBottomLeft,
  },
  {
    id: 3,
    label: 'Unlock',
    errorLabel: 'Failed to unlock tokens',
    successLabel: '',
  },
];

export const useBoostFarmWithdrawal = ({
  selectedFarmInfo,
  selectSupportedToken,
  selectedSupportedToken,
  selectedSupportedTokenInfo,
  withdrawValue,
  setWithdrawValue,
  steps,
}) => {
  // inputs validation
  const [withdrawValueError, setWithdrawValueError] = useState<string>('');

  // loading control
  const [isFetchingSupportedTokenInfo, setIsFetchingSupportedTokenInfo] =
    useState(true);

  useEffect(() => {
    if (selectedFarmInfo && selectedFarmInfo.current?.isLocked) {
      selectSupportedToken(selectedFarmInfo.current?.withdrawToken);
    }
  }, []);

  // when the selected token changes, trigger balance update
  useEffect(() => {
    if (selectedFarmInfo && selectedSupportedToken) {
      updateSelectedTokenBalance();
      updateSteps();
    }
  }, [selectedSupportedToken]);

  useEffect(() => {
    if (selectedFarmInfo) {
      updateSteps();
    }
  }, [withdrawValue]);

  // function that updates the balance of the selected token on change
  const updateSelectedTokenBalance = async () => {
    setIsFetchingSupportedTokenInfo(true);

    const boostDepositedAmount =
      selectedFarmInfo.current?.depositedAmountInLP > 0
        ? await getMaximumLPValueAsToken(
            selectedFarmInfo.current.farmAddress,
            selectedSupportedToken.address,
            selectedSupportedToken.decimals,
            selectedFarmInfo.current?.depositedAmountInLP,
          )
        : 0;
    selectedSupportedTokenInfo.current = {
      ...selectedSupportedTokenInfo.current,
      boostDepositedAmount: boostDepositedAmount,
    };

    await handleWithdrawalFieldChange(withdrawValue);

    setIsFetchingSupportedTokenInfo(false);
  };

  const updateSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    // Withdraw/Unlock step is always there
    var stepToAdd = selectedFarmInfo.current?.isLocked
      ? possibleWithdrawSteps[1]
      : possibleWithdrawSteps[0];
    var successLabel = selectedFarmInfo.current?.isLocked
      ? 'Unlock requested'
      : `${withdrawValue} ${selectedSupportedToken.label} withdrawn`;

    neededSteps.push({
      ...stepToAdd,
      label: `${stepToAdd.label} ${withdrawValue} ${selectedSupportedToken.label}`,
      successLabel: successLabel,
    });

    steps.current = neededSteps;
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
