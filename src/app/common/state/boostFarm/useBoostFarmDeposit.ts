import {
  getAllowance,
  getBalanceOf
} from 'app/common/functions/web3Client';
import { TPossibleStep } from 'app/common/types/global';
import { useEffect, useRef, useState } from 'react';

const possibleDepositSteps: TPossibleStep[] = [
  { id: 0, label: 'Approve' },
  { id: 1, label: 'Deposit' },
];

export const useBoostFarmDeposit = ({
  selectedFarmInfo,
  selectedSupportedToken,
  depositValue,
  setDepositValue,
  startLockedBoostDepositConfirmation,
  handleApprove,
  handleDeposit,
}) => {
  // inputs
  const [depositValueError, setDepositValueError] = useState<string>('');

  // data
  const selectedSupportedTokenInfo = useRef<any>({
    balance: 0,
    allowance: 0,
  });

  // Deposit steps
  const [currentStep, setCurrentStep] = useState<number>(0);
  const selectedSupportedTokenSteps = useRef<TPossibleStep[]>();

  // loading control
  const [isFetchingSupportedTokenInfo, setIsFetchingSupportedTokenInfo] =
    useState(true);

  useEffect(() => {
    if (selectedFarmInfo && selectedSupportedToken) {
      updateBalanceAndAllowance();
    }
  }, [selectedSupportedToken]);

  const updateBalanceAndAllowance = async () => {
    setIsFetchingSupportedTokenInfo(true);

    let neededSteps: TPossibleStep[] = [];

    const allowance = await getAllowance(
      selectedSupportedToken?.address,
      selectedFarmInfo.current?.farmAddress,
      selectedFarmInfo.current?.chain,
    );
    // If the allowance is not higher than 0 ask for approval
    if (!(+allowance > 0)) {
      neededSteps.push(possibleDepositSteps[0]);
    }

    const balance = await getBalanceOf(
      selectedSupportedToken?.address,
      selectedSupportedToken?.decimals,
      selectedFarmInfo.current?.chain,
    );

    selectedSupportedTokenInfo.current = {
      balance: balance,
      allowance: allowance,
    };

    // Deposit step is always there
    neededSteps.push(possibleDepositSteps[1]);

    selectedSupportedTokenSteps.current = neededSteps;

    await handleDepositValueChange(depositValue);

    setIsFetchingSupportedTokenInfo(false);
  };

  const handleDepositValueChange = value => {
    setDepositValueError('');
    if (+value > +selectedSupportedTokenInfo.current?.balance) {
      setDepositValueError('Insufficient balance');
    }
    setDepositValue(value);
  };

  // executes the handle for the current step
  const handleCurrentStep = async () => {
    const possibleDepositStep = possibleDepositSteps.find(
      possibleDepositStep =>
        possibleDepositStep.id ==
        selectedSupportedTokenSteps.current[currentStep].id,
    );

    try {
      switch (possibleDepositStep.id) {
        case 0:
          await handleApprove();
          // Next step
          setCurrentStep(currentStep + 1);
          break;

        case 1:
          (await selectedFarmInfo.current?.isLocked)
            ? startLockedBoostDepositConfirmation()
            : handleDeposit();
          break;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return {
    depositValue,
    handleDepositValueChange,
    depositValueError,
    hasErrors: depositValueError != '',
    isFetchingSupportedTokenInfo,
    selectedSupportedTokenInfo,
    currentStep,
    selectedSupportedTokenSteps,
    handleCurrentStep,
  };
};
