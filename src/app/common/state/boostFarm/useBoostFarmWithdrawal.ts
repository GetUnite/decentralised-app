<<<<<<< HEAD
import { EChain } from 'app/common/constants/chains';
import {
  convertFromUSDC, convertToLP, withdrawFromBoostFarm
} from 'app/common/functions/boostFarm';
import { useNotification } from 'app/common/state';
import { isSafeApp, walletAccount } from 'app/common/state/atoms';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

export const useBoostFarmWithdrawal = ({
  selectedFarm,
  selectedSupportedToken,
  updateFarmInfo,
  cancelBoostWithdrawalConfirmation
}) => {
  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [isSafeAppAtom] = useRecoilState(isSafeApp);

  // other state control files
  const { setNotification } = useNotification();

  // biconomy
  const [useBiconomy, setUseBiconomy] = useState(
    isSafeAppAtom || EChain.POLYGON != selectedFarm?.chain ? false : true,
  );

  // inputs
  const [withdrawValue, setWithdrawValue] = useState<string>();
  const [withdrawValueError, setWithdrawValueError] = useState<string>('');

  // data
  const [selectedSupportedTokenInfo, setSelectedSupportedTokenInfo] =
    useState<any>({
=======
import {
  convertFromUSDC
} from 'app/common/functions/boostFarm';
import { useEffect, useRef, useState } from 'react';

export const useBoostFarmWithdrawal = ({
  selectedFarmInfo,
  selectedSupportedToken,
  withdrawValue,
  setWithdrawValue,
}) => {
  // inputs validation
  const [withdrawValueError, setWithdrawValueError] = useState<string>('');

  // data
  const selectedSupportedTokenInfo =
    useRef<any>({
>>>>>>> staging
      boostDepositedAmount: 0,
    });

  // loading control
<<<<<<< HEAD
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [isFetchingSupportedTokenInfo, setIsFetchingSupportedTokenInfo] =
    useState(true);

  useEffect(() => {
    if (selectedFarm && selectedSupportedToken) {
      updateAvailable();
    }
  }, [selectedSupportedToken]);

  useEffect(() => {
    if (selectedFarm && selectedSupportedTokenInfo) {
      // retrigger input validation
      handleWithdrawalFieldChange(withdrawValue);
    }
  }, [selectedSupportedTokenInfo]);

  const updateAvailable = async () => {
=======
  const [isFetchingSupportedTokenInfo, setIsFetchingSupportedTokenInfo] =
    useState(true);

  // when the selected token changes, trigger balance update
  useEffect(() => {
    if (selectedFarmInfo && selectedSupportedToken) {
      updateSelectedTokenBalance();
    }
  }, [selectedSupportedToken]);

  // function that updates the balance of the selected token on change
  const updateSelectedTokenBalance = async () => {
>>>>>>> staging
    setIsFetchingSupportedTokenInfo(true);

    // For booster farm withdrawals
    // The balance of the farm is returned in LP which is converted into USDC and needs to be converted to each supported token for withdrawal
    // ex: wETH is selected => depositedAmount = 1500 USDC = 1 wETH => Max withdraw value is 1
    const boostDepositedAmount = await convertFromUSDC(
      selectedSupportedToken.address,
      selectedSupportedToken.decimals,
      // here the deposited amount is in USDC
<<<<<<< HEAD
      selectedFarm.depositedAmount,
    );
    setSelectedSupportedTokenInfo({
      boostDepositedAmount: boostDepositedAmount,
    });
=======
      selectedFarmInfo.current?.depositedAmount,
    );
    selectedSupportedTokenInfo.current = {
      boostDepositedAmount: boostDepositedAmount,
    };

    await handleWithdrawalFieldChange(withdrawValue);
>>>>>>> staging

    setIsFetchingSupportedTokenInfo(false);
  };

<<<<<<< HEAD
  const handleWithdrawalFieldChange = value => {
    setWithdrawValueError('');
    if (+value > selectedSupportedTokenInfo.boostDepositedAmount) {
=======
  // handles withdraw input change
  const handleWithdrawalFieldChange = value => {
    setWithdrawValueError('');
    if (+value > selectedSupportedTokenInfo.current?.boostDepositedAmount) {
>>>>>>> staging
      setWithdrawValueError('Insufficient balance');
    }
    setWithdrawValue(value);
  };

<<<<<<< HEAD
  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    cancelBoostWithdrawalConfirmation();
    try {
      const tx = await withdrawFromBoostFarm(
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

      setNotification(
        'Withdrew successfully',
        'success',
        tx.transactionHash,
        selectedFarm.chain,
      );
      await updateFarmInfo();
      

    } catch (error) {
      setNotification(error, 'error');
    }

    setIsWithdrawing(false);
  };

=======
>>>>>>> staging
  return {
    withdrawValueError,
    withdrawValue,
    handleWithdrawalFieldChange,
<<<<<<< HEAD
    isWithdrawing,
    handleWithdraw,
    setUseBiconomy,
    useBiconomy,
=======
>>>>>>> staging
    hasErrors: withdrawValueError != '',
    isFetchingSupportedTokenInfo,
    selectedSupportedTokenInfo,
  };
};
