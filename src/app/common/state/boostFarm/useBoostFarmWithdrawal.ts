import { convertFromUSDC } from 'app/common/functions/boosterFarm';
import {
  convertToLP,
  withdrawFromBoosterFarm
} from 'app/common/functions/farm';
import { isNumeric } from 'app/common/functions/utils';
import { useNotification } from 'app/common/state';
import { isSafeApp, walletAccount } from 'app/common/state/atoms';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

export const useBoostFarmWithdrawal = ({
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
  const [useBiconomy, setUseBiconomy] = useState(false)
    /*isSafeAppAtom || EChain.POLYGON != selectedFarm?.chain ? false : true,
  );*/

  // inputs
  const [withdrawValue, setWithdrawValue] = useState<string>();
  const [withdrawValueError, setWithdrawValueError] = useState<string>('');

  // data
  const [selectedSupportedTokenInfo, setSelectedSupportedTokenInfo] =
    useState<any>({
      boostDepositedAmount: 0,
    });

  // loading control
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [isFetchingSupportedTokenInfo, setIsFetchingSupportedTokenInfo] =
    useState(true);

  useEffect(() => {
    const updateAvailable = async () => {
      setIsFetchingSupportedTokenInfo(true);

      // For booster farm withdrawals
      // The balance of the farm is returned in LP which is converted into USDC and needs to be converted to each supported token for withdrawal
      // ex: wETH is selected => depositedAmount = 1500 USDC = 1 wETH => Max withdraw value is 1
      const boostDepositedAmount = await convertFromUSDC(
        selectedSupportedToken.address,
        selectedSupportedToken.decimals,
        // here the deposited amount is in USDC
        selectedFarm.depositedAmount,
      );
      setSelectedSupportedTokenInfo({
        boostDepositedAmount: boostDepositedAmount,
      });

      setIsFetchingSupportedTokenInfo(false);
    };

    if (selectedFarm && selectedSupportedToken) {
      updateAvailable();
    }
  }, [selectedSupportedToken]);

  const handleWithdrawalFieldChange = value => {
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setWithdrawValueError('Write a valid number');
    } else if (
      +value >
      (selectedFarm.isBooster
        ? selectedSupportedToken.boosterDepositedAmount
        : +selectedFarm?.depositedAmount)
    ) {
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
      const tx = await withdrawFromBoosterFarm(
        selectedFarm.farmAddress,
        selectedSupportedToken.address,
        // The withdraw value is always referent to the selected supported token
        // But the contract for booster farm withdrawal expects the value as LP/Shares
        // Thus, convert the value into LP
        await convertToLP(
          withdrawValue,
          selectedSupportedToken.address,
          selectedSupportedToken.decimals,
          selectedFarm.valueOf1LPinUSDC,
        ),
        selectedSupportedToken.decimals,
        selectedFarm.chain,
        useBiconomy,
      );
      resetState();
      await updateFarmInfo();
      setNotification(
        'Withdrew successfully',
        'success',
        tx.transactionHash,
        selectedFarm.chain,
      );
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
    isWithdrawing,
    handleWithdraw,
    resetState,
    setUseBiconomy,
    useBiconomy,
    hasErrors: withdrawValueError != '',
    isFetchingSupportedTokenInfo,
    selectedSupportedTokenInfo,
  };
};
