import { heapTrack } from 'app/common/functions/heapClient';
import {
  approve,
  getAllowance,
  getBalanceOf
} from 'app/common/functions/web3Client';
import { useNotification } from 'app/common/state';
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
  startBoostDepositConfirmation,
  handleDeposit,
}) => {
  // other state control files
  const { setNotification } = useNotification();

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
  const [isApproving, setIsApproving] = useState<boolean>(false);

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

  const handleApprove = async () => {
    setIsApproving(true);

    try {
      const tx = await approve(
        selectedFarmInfo.current?.farmAddress,
        selectedSupportedToken?.address,
        selectedFarmInfo.current?.chain,
      );
      heapTrack('approvedTransactionMined', {
        pool: 'boost',
        currency: selectedSupportedToken?.label,
        amount: depositValue,
      });
      // Next step
      setCurrentStep(currentStep + 1);
      setNotification(
        'Approved successfully',
        'success',
        tx.transactionHash,
        selectedFarmInfo.current?.chain,
      );
    } catch (err) {
      setNotification(err, 'error');
    }

    setIsApproving(false);
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
        possibleDepositStep.id == selectedSupportedTokenSteps.current[currentStep].id,
    );

    switch (possibleDepositStep.id) {
      case 0:
        await handleApprove();
        break;

      case 1:
        (await selectedFarmInfo.current?.isLocked)
          ? startBoostDepositConfirmation()
          : handleDeposit();
        break;
    }
  };

  return {
    depositValue,
    handleDepositValueChange,
    isApproving,
    depositValueError,
    hasErrors: depositValueError != '',
    isFetchingSupportedTokenInfo,
    selectedSupportedTokenInfo,
    currentStep,
    selectedSupportedTokenSteps,
    handleCurrentStep,
  };
};
