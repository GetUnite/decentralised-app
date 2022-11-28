import { heapTrack } from 'app/common/functions/heapClient';
import { isNumeric } from 'app/common/functions/utils';
import {
  approveStableCoin,
  depositStableCoin,
  getAllowance,
  getBalanceOf
} from 'app/common/functions/web3Client';
import { useNotification } from 'app/common/state';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { isSafeApp } from '../atoms';

export const useFarmDeposit = ({
  selectedFarm,
  selectedSupportedToken,
  updateFarmInfo,
}) => {
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
  // other control files
  const { setNotification } = useNotification();

  // inputs
  const [depositValue, setDepositValue] = useState<string>();
  const [depositValueError, setDepositValueError] = useState<string>('');

  // data
  const [selectedSupportedTokenInfo, setSelectedSupportedTokenInfo] =
    useState<any>({
      balance: 0,
      allowance: 0,
    });

  // loading control
  const [isFetchingSupportedTokenInfo, setIsFetchingSupportedTokenInfo] =
    useState(true);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [useBiconomy, setUseBiconomy] = useState(false);

  useEffect(() => {
    if (selectedFarm) {
      //setUseBiconomy(isSafeAppAtom || EChain.POLYGON != selectedFarm?.chain ? false : true)
    }
  }, [selectedFarm]);

  const resetState = () => {
    setDepositValueError('');
    setIsApproving(false);
    setIsDepositing(false);
  };

  useEffect(() => {
    const updateBalanceAndAllowance = async () => {
      setIsFetchingSupportedTokenInfo(true);

      const allowance = await getAllowance(
        selectedSupportedToken.address,
        selectedFarm.farmAddress,
        selectedFarm.chain,
      );
      const balance = await getBalanceOf(
        selectedSupportedToken.address,
        selectedSupportedToken.decimals,
        selectedFarm.chain,
      );
      setSelectedSupportedTokenInfo({ balance: balance, allowance: allowance });

      setIsFetchingSupportedTokenInfo(false);
    };

    if (selectedFarm && selectedSupportedToken) {
      updateBalanceAndAllowance();
    }
  }, [selectedSupportedToken]);

  const handleApprove = async () => {
    setIsApproving(true);

    try {
      const tx = await approveStableCoin(
        selectedFarm.farmAddress,
        selectedSupportedToken.address,
        selectedFarm.chain,
        useBiconomy,
      );
      await updateFarmInfo();
      heapTrack('approvedTransactionMined', {
        pool: 'Ib',
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
        pool: 'Ib',
        currency: selectedSupportedToken.label,
        amount: depositValue,
      });
      const tx = await depositStableCoin(
        selectedSupportedToken.address,
        depositValue,
        selectedSupportedToken.decimals,
        selectedFarm.type,
        selectedFarm.chain,
        useBiconomy,
      );
      resetState();
      setDepositValue(null);
      heapTrack('depositTransactionMined', {
        pool: 'Ib',
        currency: selectedSupportedToken.label,
        amount: depositValue,
      });
      setNotification(
        'Deposit successfully',
        'success',
        tx.transactionHash,
        selectedFarm.chain,
      );
      await updateFarmInfo();
    } catch (error) {
      resetState();
      setNotification(error, 'error');
    }

    setIsDepositing(false);
  };

  return {
    depositValue,
    handleDepositValueChange,
    selectedSupportedTokenInfo,
    isApproving,
    handleApprove,
    isDepositing,
    handleDeposit,
    setUseBiconomy,
    useBiconomy,
    resetState,
    depositValueError,
    hasErrors: depositValueError != '',
    isFetchingSupportedTokenInfo,
  };
};
