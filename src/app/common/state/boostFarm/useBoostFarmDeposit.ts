<<<<<<< HEAD
import { depositIntoBoostFarm } from 'app/common/functions/boostFarm';
=======
>>>>>>> staging
import { heapTrack } from 'app/common/functions/heapClient';
import {
  approve,
  getAllowance,
  getBalanceOf
} from 'app/common/functions/web3Client';
import { useNotification } from 'app/common/state';
import { TDepositStep } from 'app/common/types/farm';
<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
=======
import { useEffect, useRef, useState } from 'react';
>>>>>>> staging

const possibleDepositSteps: TDepositStep[] = [
  { id: 0, label: 'Approve' },
  { id: 1, label: 'Deposit' },
];

export const useBoostFarmDeposit = ({
<<<<<<< HEAD
  selectedFarm,
  selectedSupportedToken,
}) => {
  // react
  const navigate = useNavigate();

=======
  selectedFarmInfo,
  selectedSupportedToken,
  depositValue,
  setDepositValue,
  startBoostDepositConfirmation,
  handleDeposit,
}) => {
>>>>>>> staging
  // other state control files
  const { setNotification } = useNotification();

  // inputs
<<<<<<< HEAD
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
=======
  const [depositValueError, setDepositValueError] = useState<string>('');

  // data
  const selectedSupportedTokenInfo = useRef<any>({
    balance: 0,
    allowance: 0,
  });

  // Deposit steps
  const [currentStep, setCurrentStep] = useState<number>(0);
  const selectedSupportedTokenSteps = useRef<TDepositStep[]>();
>>>>>>> staging

  // loading control
  const [isFetchingSupportedTokenInfo, setIsFetchingSupportedTokenInfo] =
    useState(true);
  const [isApproving, setIsApproving] = useState<boolean>(false);
<<<<<<< HEAD
  const [isDepositing, setIsDepositing] = useState<boolean>(false);

  const resetState = () => {
    setDepositValueError('');
    setIsApproving(false);
    setIsDepositing(false);
  };

  useEffect(() => {
    if (selectedFarm && selectedSupportedToken) {
=======

  useEffect(() => {
    if (selectedFarmInfo && selectedSupportedToken) {
>>>>>>> staging
      updateBalanceAndAllowance();
    }
  }, [selectedSupportedToken]);

<<<<<<< HEAD
  useEffect(() => {
    if (selectedFarm && selectedSupportedTokenInfo) {
      // retrigger input validation
      handleDepositValueChange(depositValue);
    }
  }, [selectedSupportedTokenInfo]);

=======
>>>>>>> staging
  const updateBalanceAndAllowance = async () => {
    setIsFetchingSupportedTokenInfo(true);

    let neededSteps: TDepositStep[] = [];

    const allowance = await getAllowance(
<<<<<<< HEAD
      selectedSupportedToken.address,
      selectedFarm.farmAddress,
      selectedFarm.chain,
=======
      selectedSupportedToken?.address,
      selectedFarmInfo.current?.farmAddress,
      selectedFarmInfo.current?.chain,
>>>>>>> staging
    );
    // If the allowance is not higher than 0 ask for approval
    if (!(+allowance > 0)) {
      neededSteps.push(possibleDepositSteps[0]);
    }

    const balance = await getBalanceOf(
<<<<<<< HEAD
      selectedSupportedToken.address,
      selectedSupportedToken.decimals,
      selectedFarm.chain,
    );

    setSelectedSupportedTokenInfo({ balance: balance, allowance: allowance });
=======
      selectedSupportedToken?.address,
      selectedSupportedToken?.decimals,
      selectedFarmInfo.current?.chain,
    );

    selectedSupportedTokenInfo.current = {
      balance: balance,
      allowance: allowance,
    };
>>>>>>> staging

    // Deposit step is always there
    neededSteps.push(possibleDepositSteps[1]);

<<<<<<< HEAD
    setSelectedSupportedTokenSteps(neededSteps);
=======
    selectedSupportedTokenSteps.current = neededSteps;

    await handleDepositValueChange(depositValue);
>>>>>>> staging

    setIsFetchingSupportedTokenInfo(false);
  };

  const handleApprove = async () => {
    setIsApproving(true);

    try {
      const tx = await approve(
<<<<<<< HEAD
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
=======
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
>>>>>>> staging
      setNotification(
        'Approved successfully',
        'success',
        tx.transactionHash,
<<<<<<< HEAD
        selectedFarm.chain,
=======
        selectedFarmInfo.current?.chain,
>>>>>>> staging
      );
    } catch (err) {
      setNotification(err, 'error');
    }

    setIsApproving(false);
  };

  const handleDepositValueChange = value => {
    setDepositValueError('');
<<<<<<< HEAD
    if (+value > +selectedSupportedTokenInfo.balance) {
=======
    if (+value > +selectedSupportedTokenInfo.current?.balance) {
>>>>>>> staging
      setDepositValueError('Insufficient balance');
    }
    setDepositValue(value);
  };

<<<<<<< HEAD
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

=======
>>>>>>> staging
  // executes the handle for the current step
  const handleCurrentStep = async () => {
    const possibleDepositStep = possibleDepositSteps.find(
      possibleDepositStep =>
<<<<<<< HEAD
        possibleDepositStep.id == selectedSupportedTokenSteps[currentStep].id,
=======
        possibleDepositStep.id == selectedSupportedTokenSteps.current[currentStep].id,
>>>>>>> staging
    );

    switch (possibleDepositStep.id) {
      case 0:
        await handleApprove();
        break;

      case 1:
<<<<<<< HEAD
        await handleDeposit();
=======
        (await selectedFarmInfo.current?.isLocked)
          ? startBoostDepositConfirmation()
          : handleDeposit();
>>>>>>> staging
        break;
    }
  };

  return {
    depositValue,
    handleDepositValueChange,
    isApproving,
<<<<<<< HEAD
    isDepositing,
    setUseBiconomy,
    useBiconomy,
    resetState,
=======
>>>>>>> staging
    depositValueError,
    hasErrors: depositValueError != '',
    isFetchingSupportedTokenInfo,
    selectedSupportedTokenInfo,
    currentStep,
    selectedSupportedTokenSteps,
    handleCurrentStep,
  };
};
