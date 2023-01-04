import { depositIntoBoostFarm } from 'app/common/functions/boostFarm';
import { heapTrack } from 'app/common/functions/heapClient';
import { isNumeric } from 'app/common/functions/utils';
import {
  approve,
  getAllowance,
  getBalanceOf
} from 'app/common/functions/web3Client';
import { useNotification } from 'app/common/state';
import { TDepositStep } from 'app/common/types/farm';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const possibleDepositSteps: TDepositStep[] = [
  { id: 0, label: 'Approve' },
  { id: 1, label: 'Deposit' },
];

export const useBoostFarmDeposit = ({
  selectedFarm,
  selectedSupportedToken,
}) => {
  // react
  const navigate = useNavigate();

  // other state control files
  const { setNotification } = useNotification();

  // inputs
  const [depositValue, setDepositValue] = useState<string>('');
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

  // biconomy
  const [useBiconomy, setUseBiconomy] = useState(false);

  // loading control
  const [isFetchingSupportedTokenInfo, setIsFetchingSupportedTokenInfo] =
    useState(true);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isDepositing, setIsDepositing] = useState<boolean>(false);

  const resetState = () => {
    setDepositValueError('');
    setIsApproving(false);
    setIsDepositing(false);
  };

  useEffect(() => {
    if (selectedFarm && selectedSupportedToken) {
      updateBalanceAndAllowance();
    }
  }, [selectedSupportedToken]);

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

  const handleApprove = async () => {
    setIsApproving(true);

    try {
      const tx = await approve(
        selectedFarm.farmAddress,
        selectedSupportedToken.address,
        selectedFarm.chain,
      );
      await updateBalanceAndAllowance();
      heapTrack('approvedTransactionMined', {
        pool: 'boost',
        currency: selectedSupportedToken.label,
        amount: depositValue,
      });
      setNotification(
        'Approved successfully',
        'success',
        tx.transactionHash,
        selectedFarm.chain,
      );
    } catch (err) {
      setNotification(err, 'error');
    }

    setIsApproving(false);
  };

  const handleDepositValueChange = value => {
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setDepositValueError('Write a valid number');
    } else if (+value > +selectedSupportedTokenInfo.balance) {
      setDepositValueError('Insufficient balance');
    }
    setDepositValue(value);
  };

  const handleDeposit = async () => {
    setIsDepositing(true);

    try {
      heapTrack('startedDepositing', {
        pool: 'boost',
        currency: selectedSupportedToken.label,
        amount: depositValue,
      });
      const tx = await depositIntoBoostFarm(
        selectedFarm.farmAddress,
        selectedSupportedToken.address,
        depositValue,
        selectedSupportedToken.decimals,
        selectedFarm.chain,
        useBiconomy,
      );
      resetState();
      setDepositValue('');
      heapTrack('depositTransactionMined', {
        pool: 'boost',
        currency: selectedSupportedToken.label,
        amount: depositValue,
      });
      setNotification(
        'Deposit successful',
        'success',
        tx.transactionHash,
        selectedFarm.chain,
      );
      navigate('/?view_type=my_farms');
      //await updateFarmInfo();
    } catch (error) {
      resetState();
      setNotification(error, 'error');
    }

    setIsDepositing(false);
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
        break;

      case 1:
        await handleDeposit();
        break;
    }
  };

  return {
    depositValue,
    handleDepositValueChange,
    isApproving,
    isDepositing,
    setUseBiconomy,
    useBiconomy,
    resetState,
    depositValueError,
    hasErrors: depositValueError != '',
    isFetchingSupportedTokenInfo,
    selectedSupportedTokenInfo,
    currentStep,
    selectedSupportedTokenSteps,
    handleCurrentStep,
  };
};
