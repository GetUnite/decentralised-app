import { EChain } from 'app/common/constants/chains';
import { deposit } from 'app/common/functions/farm';
import { heapTrack } from 'app/common/functions/heapClient';
import { isNumeric } from 'app/common/functions/utils';
import {
  approve, getAllowance,
  getBalanceOf
} from 'app/common/functions/web3Client';
import { useNotification } from 'app/common/state';
import { TDepositStep } from 'app/common/types/farm';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { isSafeApp } from '../atoms';

const possibleDepositSteps: TDepositStep[] = [
  { id: 0, label: 'Approve' },
  { id: 1, label: 'Deposit' },
];

export const useFarmDeposit = ({
  selectedFarm,
  selectedSupportedToken,
}) => {
  // react
  const navigate = useNavigate();

  // atoms
  const [isSafeAppAtom] = useRecoilState(isSafeApp);

  // other control files
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

  // loading control
  const [isFetchingSupportedTokenInfo, setIsFetchingSupportedTokenInfo] =
    useState(true);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [useBiconomy, setUseBiconomy] = useState(true);

  useEffect(() => {
    if (selectedFarm) {
      setUseBiconomy(
        isSafeAppAtom || EChain.POLYGON != selectedFarm?.chain ? false : true,
      );
    }
  }, [selectedFarm]);

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

  const handleApprove = async () => {
    setIsApproving(true);

    try {
      const tx = await approve(
        selectedFarm.farmAddress,
        selectedSupportedToken.address,
        selectedFarm.chain,
        useBiconomy,
      );
      await updateBalanceAndAllowance();
      heapTrack('approvedTransactionMined', {
        pool: 'Ib',
        currency: selectedSupportedToken.label,
        amount: depositValue,
      });
      // Next step
      setCurrentStep(currentStep + 1);
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
        pool: 'Ib',
        currency: selectedSupportedToken.label,
        amount: depositValue,
      });
      const tx = await deposit(
        selectedSupportedToken.address,
        selectedFarm.farmAddress,
        depositValue,
        selectedSupportedToken.decimals,
        selectedFarm.chain,
        useBiconomy,
      );
      resetState();
      setDepositValue('');
      heapTrack('depositTransactionMined', {
        pool: 'Ib',
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
      setIsDepositing(false);
    }
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
    selectedSupportedTokenInfo,
    isApproving,
    isDepositing,
    setUseBiconomy,
    useBiconomy,
    resetState,
    depositValueError,
    hasErrors: depositValueError != '',
    isFetchingSupportedTokenInfo,
    currentStep,
    selectedSupportedTokenSteps,
    handleCurrentStep,
  };
};
