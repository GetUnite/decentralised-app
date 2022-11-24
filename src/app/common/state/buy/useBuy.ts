import { EChain } from 'app/common/constants/chains';
import {
  approveAlluoPurchaseInWETH,
  buyAlluoWithWETH,
  getAlluoBalance, getAlluoPriceInWETH, getVlAlluoBalance,
  getVlAlluoTotalSupply,
  getWETHAllowance,
  getWEthBalance
} from 'app/common/functions/buy';
import {
  approveAlluoStaking,
  getAlluoStakingAllowance,
  getAlluoStakingAPR,
  lockAlluo
} from 'app/common/functions/stake';
import { isNumeric, toExactFixed } from 'app/common/functions/utils';
import { useNotification } from 'app/common/state';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

export const useBuy = () => {
  const { setNotification, resetNotification } = useNotification();
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
    const totalSupply = await getVlAlluoTotalSupply();
    const fixedTotalSupply = toExactFixed(totalSupply, 2);
    setTotalSupply(fixedTotalSupply);
  };

  const fetchVlAlluoBalance = async () => {
    const balance = await getVlAlluoBalance();
    const fixedBalance = toExactFixed(balance, 2);
    setVlAlluoBalance(fixedBalance);
  };

  const fetchAlluoPriceInWETH = async () => {
    try{
    const price = await getAlluoPriceInWETH();
    const fixed = toExactFixed(price, 2);
    setAlluoPriceInWETH(fixed);
    }catch(error){
      setNotification(error, 'error');
    }
  };

  const fetchAllowanceOfWETH = async () => {
    const res = await getWETHAllowance();
    setAllowance(res);
  };

  const fetchAlluoStakingAPR = async () => {
    const apr = await getAlluoStakingAPR();
    setAlluoStakingAPR(apr);
  };

  const handleInputValueChange = value => {
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.'))
      setInputValueError('Write a valid number');
    else if (+value > +wethBalance) setInputValueError('Insufficient balance');
    else setInputValue(value);
  };

  const handleApprove = async () => {
    resetState();
    setIsApproving(true);

    try {
      const tx = await approveAlluoPurchaseInWETH();
      await updateBuyInfo();
      setNotification('Approved successfully', 'success', tx.transactionHash, EChain.ETHEREUM);
    } catch (err) {
      console.log('Error', err.message);
      setNotification(err.message, 'error');
    }

    setIsApproving(false);
  };

  const handleBuyAction = async () => {
    resetState();
    setIsBuying(true);

    try {
      const tx = await buyAlluoWithWETH(inputValue);
      setInputValue(null);
      await updateBuyInfo();
      setNotification('Successfully bought', 'success', tx.transactionHash, EChain.ETHEREUM);
    } catch (err) {
      console.log('Error', err);
      setNotification(err, 'error');
    }

    setIsBuying(false);
  };

  const handleBuyAndStakeAction = async () => {
    resetState();
    setIsBuying(true);

    try {
      const alluoBalanceBefore = await getAlluoBalance();
      await buyAlluoWithWETH(inputValue);
      const alluoBalanceAfter = await getAlluoBalance();
      const difference =
        process.env.REACT_APP_NET === 'mainnet'
          ? +alluoBalanceAfter - +alluoBalanceBefore
          : 1;
      const alluoStakingAllowance = await getAlluoStakingAllowance();
      if (+alluoStakingAllowance < difference) {
        await approveAlluoStaking();
      }
      const tx = await lockAlluo(difference);
      await updateBuyInfo();
      setNotification('Successfully bought and locked', 'success', tx.transactionHash, EChain.ETHEREUM);
    } catch (err) {
      console.log('Error', err.message);
      setNotification(err.message, 'error');
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
    handleBuyAndStakeAction,
    alluoPriceInWETH,
    hasErrors: inputValueError != '',
  };
};
