import { isNumeric } from 'app/common/functions/utils';
import {
  approveStableCoin,
  depositIntoBoosterFarm,
  depositStableCoin,
  getAllowance,
  getBalanceOf,
  getDecimals
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
  const [supportedTokenInfo, setSupportedTokenInfo] = useState<any>({balance: 0, allowance: 0});

  // loading control
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
    if (selectedFarm) {
      updateBalanceAndAllowance();
    }
  }, [selectedSupportedToken]);

  const updateBalanceAndAllowance = async () => {
    const decimals = await getDecimals(
      selectedSupportedToken.address,
      selectedFarm.chain,
    );
    const allowance = await getAllowance(selectedSupportedToken.address, selectedFarm.farmAddress, selectedFarm.chain);
    const balance = await getBalanceOf(
      selectedSupportedToken.address,
      decimals,
      selectedFarm.chain,
    );
    setSupportedTokenInfo({balance: balance, allowance: allowance});
  };

  const handleApprove = async () => {
    setIsApproving(true);

    try {
      await approveStableCoin(
        selectedFarm.farmAddress,
        selectedSupportedToken.address,
        selectedFarm.chain,
        useBiconomy,
      );
      await updateFarmInfo();
      setNotification('Approved successfully', 'success');
    } catch (err) {
      setNotification(err, 'error');
    }

    setIsApproving(false);
  };

  const handleDepositValueChange = value => {
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setDepositValueError('Write a valid number');
    } else if (+value > +selectedSupportedToken?.balance) {
      setDepositValueError('Insufficient balance');
    }
    setDepositValue(value);
  };

  const handleDeposit = async () => {
    setIsDepositing(true);

    try {
      if (selectedFarm?.isBooster) {
        await depositIntoBoosterFarm(
          selectedFarm.farmAddress,
          selectedSupportedToken.address,
          depositValue,
          selectedSupportedToken.decimals,
          selectedFarm.chain,
          useBiconomy,
        );
      } else {
        await depositStableCoin(
          selectedSupportedToken.address,
          depositValue,
          selectedSupportedToken.decimals,
          selectedFarm.type,
          selectedFarm.chain,
          useBiconomy,
        );
      }
      resetState();
      setDepositValue(null);
      setNotification('Deposit successfully', 'success');
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
    supportedTokenInfo,
    isApproving,
    handleApprove,
    isDepositing,
    handleDeposit,
    setUseBiconomy,
    useBiconomy,
    resetState,
    depositValueError,
    hasErrors: depositValueError != '',
  };
};
