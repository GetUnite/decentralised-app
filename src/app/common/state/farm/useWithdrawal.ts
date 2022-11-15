import { EChain } from 'app/common/constants/chains';
import { convertToLP, withdrawFromBoosterFarm } from 'app/common/functions/farm';
import { isNumeric } from 'app/common/functions/utils';
import {
    withdrawStableCoin
} from 'app/common/functions/web3Client';
import { useNotification } from 'app/common/state';
import { isSafeApp, walletAccount } from 'app/common/state/atoms';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

export const useWithdrawal = ({
  selectedFarm,
  selectedSupportedToken,
  updateFarmInfo,
}) => {
  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [isSafeAppAtom] = useRecoilState(isSafeApp);

  // other state control files
  const { setNotification } = useNotification();

  // biconomy
  const [useBiconomy, setUseBiconomy] = useState(true);

  // inputs
  const [withdrawValue, setWithdrawValue] = useState<string>();
  const [withdrawValueError, setWithdrawValueError] = useState<string>('');

  // loading control
  const [isWithdrawalRequestsLoading, setIsWithdrawalRequestsLoading] =
    useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);

  useEffect(() => {
    if (selectedFarm) {
      setUseBiconomy(isSafeAppAtom || EChain.POLYGON != selectedFarm?.chain ? false : true)
    }
  }, [selectedFarm]);

  const handleWithdrawalFieldChange = value => {
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setWithdrawValueError('Write a valid number');
    } else if (+value > (selectedFarm.isBooster ? selectedSupportedToken.boosterDepositedAmount : +selectedFarm?.depositedAmount)) {
      setWithdrawValueError('Insufficient balance');
    }
    setWithdrawValue(value);
  };

  const resetState = () => {
    setWithdrawValueError('');
    setIsWithdrawing(false);
  };

  const handleWithdraw = async () => {
    setIsWithdrawing(true);

    try {
      let blockNumber;
      if (selectedFarm?.isBooster) {
        blockNumber = await withdrawFromBoosterFarm(
          selectedFarm.farmAddress,
          selectedSupportedToken.address,
          // The withdraw value is always referent to the selected supported token
          // But the contract for booster farm withdrawal expects the value as LP/Shares
          // Thus, convert the value into LP
          await convertToLP(withdrawValue, selectedSupportedToken.address, selectedSupportedToken.decimals, selectedFarm.valueOf1LPinUSDC),
          selectedSupportedToken.decimals,
          selectedFarm.chain,
          useBiconomy,
        );
      } else {
        blockNumber = await withdrawStableCoin(
          selectedSupportedToken.address,
          withdrawValue,
          selectedFarm.type,
          selectedFarm.chain,
          useBiconomy,
        );
      }
      resetState();
      setNotification("Successfully withdrew", 'success');
      await updateFarmInfo();
    } catch (error) {
      resetState();
      setNotification(error, 'error');
    }

    setIsWithdrawing(false);
  };

  return {
    withdrawValueError,
    withdrawValue,
    handleWithdrawalFieldChange,
    isWithdrawalRequestsLoading,
    isWithdrawing,
    handleWithdraw,
    resetState,
    setUseBiconomy,
    useBiconomy,
    hasErrors: withdrawValueError != '',
  };
};
