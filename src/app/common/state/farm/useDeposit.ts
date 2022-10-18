import { EChain } from 'app/common/constants/chains';
import { isNumeric } from 'app/common/functions/utils';
import {
  approveStableCoin,
  depositIntoBoosterFarm,
  depositStableCoin
} from 'app/common/functions/web3Client';
import { useNotification } from 'app/common/state';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { isSafeApp } from '../atoms';

export const useDeposit = ({
  selectedFarm,
  selectedSupportedToken,
  updateFarmInfo,
}) => {
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
  const { setNotificationt } = useNotification();
  const [depositValue, setDepositValue] = useState<string>();
  const [depositValueError, setDepositValueError] = useState<string>('');
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [useBiconomy, setUseBiconomy] = useState(
    isSafeAppAtom || EChain.POLYGON != selectedFarm?.chain ? false : true,
  );

  const resetState = () => {
    setDepositValueError('');
    setIsApproving(false);
    setIsDepositing(false);
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
      setNotificationt('Approved successfully', 'success');
    } catch (err) {
      setNotificationt(err, 'error');
    }

    setIsApproving(false);
  };

  const handleDepositValueChange = value => {
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setDepositValueError('Write a valid number');
    } else if (+value > +selectedSupportedToken?.balance) {
      setDepositValueError('Not enough balance');
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
      setNotificationt('Deposit successfully', 'success');
      await updateFarmInfo();
    } catch (error) {
      resetState();
      setNotificationt(error, 'error');
    }

    setIsDepositing(false);
  };

  return {
    depositValue,
    handleDepositValueChange,
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
