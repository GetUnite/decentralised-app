import { EOptimismAddresses } from 'app/common/constants/addresses';
import { maximumUint256Value } from 'app/common/functions/utils';
import {
  getAllowance,
  getBalanceOf,
  signerGetBalance,
} from 'app/common/functions/web3Client';
import { TPossibleStep } from 'app/common/types/global';
import openVault from 'app/modernUI/animations/openVault.svg';
import { useEffect, useState } from 'react';

export const possibleDepositSteps: TPossibleStep[] = [
  {
    id: 0,
    label: 'Approve deposit',
    successLabel: 'Deposit approved',
    errorLabel: 'Approval failed',
  },
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

    let allowance;
    let balance;
    if (selectedSupportedToken.address != EOptimismAddresses.ETH) {
      allowance = await getAllowance(
        selectedSupportedToken.address,
        selectedFarmInfo.farmAddress,
        selectedFarmInfo.chain,
      );

      balance = await getBalanceOf(
        selectedSupportedToken.address,
        selectedSupportedToken.decimals,
        selectedFarmInfo.chain,
      );
    } else {
      allowance = maximumUint256Value;
      balance = await signerGetBalance(selectedSupportedToken.decimals);
    }

    selectedSupportedTokenInfo.current = {
      ...selectedSupportedTokenInfo.current,
      balance: balance,
      allowance: allowance,
    };

    // the inputs might not be ok after this
    await handleDepositValueChange(depositValue);

    setIsFetchingSupportedTokenInfo(false);
  };

  const updateSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    // If the allowance is not higher than 0 ask for approval
    if (!(+selectedSupportedTokenInfo.current?.allowance > 0)) {
      neededSteps.push(possibleDepositSteps[0]);
    }

    // Deposit step is always there
    neededSteps.push({
      ...possibleDepositSteps[1],
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
