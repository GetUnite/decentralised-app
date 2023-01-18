import {
  getAllowance,
  getBalanceOf
} from 'app/common/functions/web3Client';
import { TDepositStep } from 'app/common/types/farm';
import { useEffect, useState } from 'react';

const possibleDepositSteps: TDepositStep[] = [
  { id: 0, label: 'Approve' },
  { id: 1, label: 'Deposit' },
];

export const useFarmDeposit = ({
  selectedFarm,
  selectedSupportedToken,
  // deposit
  depositValue,
  setDepositValue,
  handleApprove,
  handleDeposit,
}) => {
  // inputs
  const [depositValueError, setDepositValueError] = useState<string>('');

  // data
  const [selectedSupportedTokenInfo, setSelectedSupportedTokenInfo] =
    useState<any>({
      balance: 0,
      allowance: 0,
    });

  // Deposit steps
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedSupportedTokenSteps, setSelectedSupportedTokenSteps] =
    useState<TDepositStep[]>();

  // loading control
  const [isFetchingSupportedTokenInfo, setIsFetchingSupportedTokenInfo] =
    useState(true);

  useEffect(() => {
    if (selectedFarm && selectedSupportedToken) {
      updateBalanceAndAllowance();
    }
  }, [selectedSupportedToken]);

  useEffect(() => {
    if (selectedFarm && selectedSupportedToken && depositValue != undefined) {
      // the inputs might not be ok after this
      handleDepositValueChange(depositValue);
    }
  }, [selectedSupportedTokenInfo]);

  const updateBalanceAndAllowance = async () => {
    setIsFetchingSupportedTokenInfo(true);

    let neededSteps: TDepositStep[] = [];

    const allowance = await getAllowance(
      selectedSupportedToken.address,
      selectedFarm.farmAddress,
      selectedFarm.chain,
    );

    // If the allowance is not higher than 0 ask for approval
    if (!(+allowance > 0)) {
      neededSteps.push(possibleDepositSteps[0]);
    }

    const balance = await getBalanceOf(
      selectedSupportedToken.address,
      selectedSupportedToken.decimals,
      selectedFarm.chain,
    );

    setSelectedSupportedTokenInfo({ balance: balance, allowance: allowance });

    // Deposit step is always there
    neededSteps.push(possibleDepositSteps[1]);

    setSelectedSupportedTokenSteps(neededSteps);

    setIsFetchingSupportedTokenInfo(false);
  };

  const handleDepositValueChange = value => {
    setDepositValueError('');
    if (+value > +selectedSupportedTokenInfo.balance) {
      setDepositValueError('Insufficient balance');
    }
    setDepositValue(value);
  };

  // executes the handle for the current step
  const handleCurrentStep = async () => {
    const possibleDepositStep = possibleDepositSteps.find(
      possibleDepositStep =>
        possibleDepositStep.id == selectedSupportedTokenSteps[currentStep].id,
    );

    switch (possibleDepositStep.id) {
      case 0:
        await handleApprove();
        // Next step
        setCurrentStep(currentStep + 1);
        break;

      case 1:
        await handleDeposit();
        break;
    }
  };

  return {
    depositValue,
    handleDepositValueChange,
    selectedSupportedTokenInfo,
    depositValueError,
    hasErrors: depositValueError != '',
    isFetchingSupportedTokenInfo,
    currentStep,
    selectedSupportedTokenSteps,
    handleCurrentStep,
  };
};
