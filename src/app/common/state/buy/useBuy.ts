import {
  isNumeric,
  maximumUint256Value,
  toExactFixed,
} from 'app/common/functions/utils';
import {
  approveAlluoPurchaseInWETH,
  approveAlluoTransaction,
  buyAlluoWithWETH,
  EChain,
  getWETHAllowance,
  getAlluoPriceInWETH,
  getBalanceOfAlluoUser,
  getTokenInfo,
  getTotalSupplyVlAlluo,
  getVlAlluoBalance,
  getWEthBalance,
  lockAlluoToken,
} from 'app/common/functions/Web3Client';
import { tokenInfo, walletAccount, wantedChain } from 'app/common/state/atoms';
import { ENotificationId, useNotification } from 'app/common/state';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

export const useBuy = () => {
  const { notification, setNotification, resetNotification } = useNotification();
  const [tokenInfoAtom, setTokenInfoAtom] = useRecoilState(tokenInfo);
  const [walletAccountAtom, setWalletAccountAtom] =
    useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  const [inputValue, setInputValue] = useState<string>();
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [wethBalance, setWethBalance] = useState<string>('');
  const [alluoPriceInWETH, setAlluoPriceInWETH] = useState<string>('');
  const [totalSupply, setTotalSupply] = useState<string>('');
  const [allowance, setAllowance] = useState<string>('');
  const [vlAlluoBalance, setVlAlluoBalance] = useState<string>('');

  const resetState = () => {
    setError('');
    resetNotification();
    setIsBuying(false);
    setIsApproving(false);
  };

  const setSuccessNotification = message => {
    setNotification({
      id: ENotificationId.BUY,
      type: 'success',
      message: message,
    });
  };

  const setErrorNotification = message => {
    setNotification({
      id: ENotificationId.BUY,
      type: 'error',
      message: message,
    });
  };

  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.ETHEREUM);
      fetchAlluoPriceInWETH();
      fetchTotalSupply();
      fetchWethBalance();
      fetchAllowanceOfWETH();
      fetchVlAlluoBalance();
    }
  }, [walletAccountAtom]);

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

  const handleValueChange = e => {
    const { value } = e.target;
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.'))
      setError('Write a valid number');
    else if (+value > +wethBalance) setError('Not enough balance');
    else setInputValue(value);
  };

  const handleSetLockToMax = () => {
    resetState();
    setInputValue(tokenInfoAtom.alluoBalance + '');
  };

  const setAccountInformation = async () => {
    setTokenInfoAtom({
      isLoading: true,
    });
    fetchWethBalance();
    fetchTotalSupply();
    fetchWethBalance();
    fetchAllowanceOfWETH();
    const tokenInfoData = await getTokenInfo(walletAccountAtom);
    setTokenInfoAtom(tokenInfoData);
  };

  const fetchAllowanceOfWETH = async () => {
    const res = await getWETHAllowance();
    setAllowance(res);
  };

  const handleApprove = async () => {
    resetNotification();
    setIsApproving(true);

    try {
      const res = await approveAlluoPurchaseInWETH();

      setAccountInformation();
    } catch (err) {
      console.error('Error', err.message);
      resetState();
      setErrorNotification(err.message);
    }

    setIsApproving(false);
  };
  const handleBuyAction = async () => {
    resetNotification();
    setIsBuying(true);

    try {
      const res = await buyAlluoWithWETH(inputValue);
      setAccountInformation();
      setErrorNotification('');
      setInputValue(null);
      setSuccessNotification('Successfully bought');
    } catch (err) {
      console.error('Error', err.message);
      resetState();
      setErrorNotification(err.message);
    }

    setIsBuying(false);
  };

  const handleBuyAndLockAction = async () => {
    resetNotification();
    setIsBuying(true);

    try {
      const alluoBalanceBefore = await getBalanceOfAlluoUser();
      await buyAlluoWithWETH(inputValue);
      const alluoBalanceAfter = await getBalanceOfAlluoUser();
      const difference =
        process.env.REACT_APP_NET === 'mainnet'
          ? +alluoBalanceAfter - +alluoBalanceBefore
          : 1;
      if (+tokenInfoAtom.allowance < difference)
        await approveAlluoTransaction(maximumUint256Value);
      await lockAlluoToken(difference);
      setAccountInformation();
      setErrorNotification('');

      setSuccessNotification('Successfully bought and locked');
    } catch (err) {
      console.error('Error', err.message);
      resetState();
      setErrorNotification(err.message);
    }

    setIsBuying(false);
  };

  const setToMax = () => {
    setError('');
    setInputValue(wethBalance);
  };

  return {
    notificationId: ENotificationId.BUY,
    wethBalance,
    vlAlluoBalance,
    allowance,
    totalSupply,
    error,
    inputValue,
    isApproving,
    isBuying,
    handleValueChange,
    handleSetLockToMax,
    handleApprove,
    handleBuyAction,
    handleBuyAndLockAction,
    alluoPriceInWETH,
    setToMax,
  };
};
