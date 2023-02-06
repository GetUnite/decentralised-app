import { getAllowance, getBalanceOf } from 'app/common/functions/web3Client';
import { TPossibleStep } from 'app/common/types/global';
import { useEffect, useState } from 'react';

export const possibleDepositSteps: TPossibleStep[] = [
  {
    id: 0,
    label: '',
    successLabel: '',
    errorLabel: 'Approval failed',
  },
  {
    id: 1,
    label: 'Deposit',
    successLabel: '',
    errorLabel: 'Failed to deposit tokens',
  },
  {
    id: 2,
    label: 'Lock',
    successLabel: '',
    errorLabel: 'Failed to lock tokens',
  },
];

export const useBoostFarmDeposit = ({
  selectedFarmInfo,
  selectSupportedToken,
  selectedSupportedToken,
  selectedSupportedTokenInfo,
  depositValue,
  setDepositValue,
  steps,
}) => {
  // inputs
  const [depositValueError, setDepositValueError] = useState<string>('');

  // loading control
  const [isFetchingSupportedTokenInfo, setIsFetchingSupportedTokenInfo] =
    useState(true);

  useEffect(() => {
    if (selectedFarmInfo && selectedFarmInfo.current?.isLocked) {
      selectSupportedToken(selectedFarmInfo.current?.supportedTokens[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedFarmInfo && selectedSupportedToken) {
      updateBalanceAndAllowance();
      updateSteps();
    }
  }, [selectedSupportedToken]);

  useEffect(() => {
    if (selectedFarmInfo && selectedSupportedToken && depositValue != '') {
      updateSteps();
    }
  }, [depositValue]);

  const updateBalanceAndAllowance = async () => {
    setIsFetchingSupportedTokenInfo(true);

    const allowance = await getAllowance(
      selectedSupportedToken?.address,
      selectedFarmInfo.current?.farmAddress,
      selectedFarmInfo.current?.chain,
    );

    const balance = await getBalanceOf(
      selectedSupportedToken?.address,
      selectedSupportedToken?.decimals,
      selectedFarmInfo.current?.chain,
    );

    selectedSupportedTokenInfo.current = {
      ...selectedSupportedTokenInfo.current,
      balance: balance,
      allowance: allowance,
    };

    await handleDepositValueChange(depositValue);

    setIsFetchingSupportedTokenInfo(false);
  };

  const updateSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    // If the allowance is not higher than 0 ask for approval
    if (!(+selectedSupportedTokenInfo.current?.allowance > 0)) {
      neededSteps.push({
        ...possibleDepositSteps[0],
        label: `Approve ${
          selectedFarmInfo.current?.isLocked ? 'lock' : 'deposit'
        }`,
        successLabel: `${
          selectedFarmInfo.current?.isLocked ? 'Lock' : 'Deposit'
        } approved`,
      });
    }

    // Deposit/Lock step is always there
    var stepToAdd = selectedFarmInfo.current?.isLocked
      ? possibleDepositSteps[2]
      : possibleDepositSteps[1];
    neededSteps.push({
      ...stepToAdd,
      label: `${stepToAdd.label} ${depositValue} ${selectedSupportedToken.label}`,
      successLabel: `${depositValue} ${selectedSupportedToken.label} ${
        selectedFarmInfo.current?.isLocked ? 'locked' : 'deposited'
      }.`,
    });

    steps.current = neededSteps;
  };

  const handleDepositValueChange = value => {
    setDepositValueError('');
    if (+value > +selectedSupportedTokenInfo.current?.balance) {
      setDepositValueError('Insufficient balance');
    }
    setDepositValue(value);
  };

  return {
    depositValue,
    handleDepositValueChange,
    depositValueError,
    hasErrors: depositValueError != '',
    isFetchingSupportedTokenInfo,
    selectedSupportedTokenInfo,
  };
};
