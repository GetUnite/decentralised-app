import {
  isNumeric,
  maximumUint256Value,
  toExactFixed,
} from 'app/common/functions/utils';
import {
  approveAlluoPurchaseInWETH,
  approveAlluoTransaction,
  buyAlluoWithWETH,
  getWETHAllowance,
  getAlluoPriceInWETH,
  getBalanceOfAlluoUser,
  getTotalSupplyVlAlluo,
  getVlAlluoBalance,
  getWEthBalance,
  lockAlluoToken,
  getAlluoStakingAPR,
  getAlluoStakingAllowance,
} from 'app/common/functions/w';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { useNotification } from 'app/common/state';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { EChain } from 'app/common/constants/chains';

export const useBuy = () => {
  const { setNotificationt, resetNotification } = useNotification();
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>();
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [inputValueError, setInputValueError] = useState<string>('');
  const [wethBalance, setWethBalance] = useState<string>('');
  const [alluoPriceInWETH, setAlluoPriceInWETH] = useState<string>('');
  const [totalSupply, setTotalSupply] = useState<string>('');
  const [allowance, setAllowance] = useState<string>('');
  const [vlAlluoBalance, setVlAlluoBalance] = useState<string>('');
  const [alluoStakingAPR, setAlluoStakingAPR] = useState<number>();

  const resetState = () => {
    resetNotification();
    setIsBuying(false);
    setIsLoading(false);
    setIsApproving(false);
  };

  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.ETHEREUM);
      updateBuyInfo();
    }
  }, [walletAccountAtom]);

  const updateBuyInfo = async () => {
    setIsLoading(true);
    await fetchAlluoPriceInWETH();
    await fetchTotalSupply();
    await fetchWethBalance();
    await fetchAllowanceOfWETH();
    await fetchVlAlluoBalance();
    await fetchAlluoStakingAPR();
    setIsLoading(false);
  };

  const fetchWethBalance = async () => {
    const balance = await getWEthBalance();
    const fixedBalance = toExactFixed(balance, 4);
    setWethBalance(fixedBalance);
  };

  const fetchTotalSupply = async () => {
    const balance = await getTotalSupplyVlAlluo();
    const fixedBalance = toExactFixed(balance, 2);
    setTotalSupply(fixedBalance);
  };

  const fetchVlAlluoBalance = async () => {
    const balance = await getVlAlluoBalance();
    const fixedBalance = toExactFixed(balance, 2);
    setVlAlluoBalance(fixedBalance);
  };

  const fetchAlluoPriceInWETH = async () => {
    const price = await getAlluoPriceInWETH();
    const fixed = toExactFixed(price, 2);
    setAlluoPriceInWETH(fixed);
  };

  const fetchAlluoStakingAPR = async () => {
    const apr = await getAlluoStakingAPR();
    setAlluoStakingAPR(apr);
  };

  const handleInputValueChange = value => {
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.'))
      setInputValueError('Write a valid number');
    else if (+value > +wethBalance) setInputValueError('Not enough balance');
    else setInputValue(value);
  };

  const fetchAllowanceOfWETH = async () => {
    const res = await getWETHAllowance();
    setAllowance(res);
  };

  const handleApprove = async () => {
    resetState();
    setIsApproving(true);

    try {
      await approveAlluoPurchaseInWETH();
      await updateBuyInfo();
    } catch (err) {
      console.log('Error', err.message);
      setNotificationt(err.message, 'error');
    }

    setIsApproving(false);
  };

  const handleBuyAction = async () => {
    resetState();
    setIsBuying(true);

    try {
      await buyAlluoWithWETH(inputValue);
      setInputValue(null);
      await updateBuyInfo();
      setNotificationt('Successfully bought', 'success');
    } catch (err) {
      console.log('Error', err);
      setNotificationt(err, 'error');
    }

    setIsBuying(false);
  };

  const handleBuyAndLockAction = async () => {
    resetState();
    setIsBuying(true);

    try {
      const alluoBalanceBefore = await getBalanceOfAlluoUser();
      await buyAlluoWithWETH(inputValue);
      const alluoBalanceAfter = await getBalanceOfAlluoUser();
      const difference =
        process.env.REACT_APP_NET === 'mainnet'
          ? +alluoBalanceAfter - +alluoBalanceBefore
          : 1;
      const alluoStakingAllowance = await getAlluoStakingAllowance();
      if (+alluoStakingAllowance < difference) {
        await approveAlluoTransaction(maximumUint256Value);
      }
      await lockAlluoToken(difference);
      await updateBuyInfo();
      setNotificationt('Successfully bought and locked', 'success');
    } catch (err) {
      console.log('Error', err.message);
      setNotificationt(err.message, 'error');
    }

    setIsBuying(false);
  };

  return {
    isLoading,
    alluoStakingAPR,
    wethBalance,
    vlAlluoBalance,
    allowance,
    totalSupply,
    inputValueError,
    inputValue,
    isApproving,
    isBuying,
    handleInputValueChange,
    handleApprove,
    handleBuyAction,
    handleBuyAndLockAction,
    alluoPriceInWETH,
    hasErrors: inputValueError != '',
  };
};
