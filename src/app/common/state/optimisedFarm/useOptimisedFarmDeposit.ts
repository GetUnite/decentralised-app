import { getAllowance, getBalanceOf } from 'app/common/functions/web3Client';
import { TPossibleStep } from 'app/common/types/global';
import openVault from 'app/modernUI/animations/openVault.svg';
import { useEffect, useState } from 'react';

export const possibleDepositSteps: TPossibleStep[] = [
  {
    id: 1,
    label: 'Deposit',
    successLabel: '',
    errorLabel: 'Failed to deposit tokens',
    successImage: openVault,
  },
];

export const useOptimisedFarmDeposit = ({
  selectedFarmInfo,
  selectedSupportedToken,
  selectedSupportedTokenInfo,
  steps,
  // deposit
  depositValue,
  setDepositValue,
}) => {
  // inputs
  const [depositValueError, setDepositValueError] = useState<string>('');

  // loading control
  const [isFetchingSupportedTokenInfo, setIsFetchingSupportedTokenInfo] =
    useState(true);

  useEffect(() => {
    if (selectedFarmInfo && selectedSupportedToken) {
      updateBalance();
      updateSteps();
    }
  }, [selectedSupportedToken]);

  useEffect(() => {
    if (selectedFarmInfo && selectedSupportedToken && depositValue != '') {
      updateSteps();
    }
  }, [depositValue]);

  const updateBalance = async () => {
    setIsFetchingSupportedTokenInfo(true);

    const balance = await getBalanceOf(
      selectedSupportedToken.address,
      selectedSupportedToken.decimals,
      selectedFarmInfo.chain,
    );

    selectedSupportedTokenInfo.current = {
      ...selectedSupportedTokenInfo.current,
      balance: balance,
    };

    // the inputs might not be ok after this
    await handleDepositValueChange(depositValue);

    setIsFetchingSupportedTokenInfo(false);
  };

  const updateSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    // Deposit step is always there
    neededSteps.push({
      ...possibleDepositSteps[0],
      label: `Deposit ${depositValue} ${selectedSupportedToken.label}`,
      successLabel: `${depositValue} ${selectedSupportedToken.label} deposited`,
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
    handleDepositValueChange,
    selectedSupportedTokenInfo,
    depositValueError,
    hasErrors: depositValueError != '',
    isFetchingSupportedTokenInfo,
  };
};
