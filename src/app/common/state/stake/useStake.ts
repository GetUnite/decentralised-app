import { EEthereumAddresses } from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import { heapTrack } from 'app/common/functions/heapClient';
import {
  claimStakingRewards,
  getAlluoBalance,
  getAlluoStakingAllowance,
  getAlluoStakingAPR,
  getAlluoStakingWalletAddressInfo,
  getEarnedAlluo,
  getStakingPendingRewards,
  getTotalAlluoLocked,
  getUnlockedAlluo,
<<<<<<< HEAD
=======
  unlockAllAlluo,
  unlockAlluo,
>>>>>>> staging
  withdrawAlluo
} from 'app/common/functions/stake';
import { toExactFixed } from 'app/common/functions/utils';
import { getValueOf1LPinUSDC } from 'app/common/functions/web3Client';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useNotification } from '../useNotification';

export type TAlluoStakingInfo = {
  balance?: string;
  allowance?: string;
  locked?: string;
  lockedInLp?: string;
  apr?: string;
  totalLocked?: string;
  earned?: string;
  unlocked?: string;
  depositUnlockTime?: string;
  withdrawUnlockTime?: string;
  cvxRewards?: string | number;
};

const defaultRewards = {
  label: 'CVX-ETH',
  stableLabel: 'USDC',
  stableAddress: EEthereumAddresses.USDC,
};

export const useStake = () => {
  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // other state control files
  const { setNotification, resetNotification } = useNotification();

  // alluo info
  const [alluoInfo, setAlluoInfo] = useState<TAlluoStakingInfo>();

<<<<<<< HEAD
=======
  // inputs
  const [unlockValue, setUnlockValue] = useState<number>(0);

>>>>>>> staging
  //rewards control
  const [rewardsInfo, setRewardsInfo] = useState<any>(defaultRewards);
  const [pendingRewardsInfo, setPendingRewardsInfo] = useState<any>(false);
  const [seeRewardsAsStable, setSeeRewardsAsStable] = useState<boolean>(false);
  const previousHarvestDate = moment().subtract(1, 'days').day('Monday');
  const nextHarvestDate = moment()
    .subtract(1, 'days')
    .add(1, 'week')
    .day('Monday');

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);
<<<<<<< HEAD
=======
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
>>>>>>> staging
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [isClamingRewards, setIsClamingRewards] = useState<boolean>(false);
  const [isLoadingRewards, setIsLoadingRewards] = useState<boolean>(false);
  const [isLoadingPendingRewards, setIsLoadingPendingRewards] =
    useState<boolean>(false);

  // confirmation/information control
  const [showReunlockConfirmation, setShowReunlockConfirmation] =
    useState<boolean>(false);

  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.ETHEREUM);
      heapTrack('stake');
      updateAlluoInfo();
    }
  }, [walletAccountAtom]);

  const resetState = () => {
    resetNotification();
    setShowReunlockConfirmation(false);
    setIsWithdrawing(false);
  };

  useEffect(() => {
    if (walletAccountAtom && alluoInfo) {
      updateRewardsInfo();
    }
  }, [alluoInfo]);

  const updateAlluoInfo = async () => {
    setShowReunlockConfirmation(false);
    setIsLoading(true);
    try {
      let info: TAlluoStakingInfo = {
        balance: await getAlluoBalance(),
        allowance: await getAlluoStakingAllowance(),
        apr: (await getAlluoStakingAPR()).toLocaleString(),
        totalLocked: toExactFixed(await getTotalAlluoLocked(), 2),
        earned: toExactFixed(await getEarnedAlluo(), 2),
        unlocked: await getUnlockedAlluo(),
      };
      const alluoStakingWalletAddressInfo =
        await getAlluoStakingWalletAddressInfo();
      info.locked = alluoStakingWalletAddressInfo.locked;
      info.lockedInLp = alluoStakingWalletAddressInfo.lockedInLp;
      info.depositUnlockTime = alluoStakingWalletAddressInfo.depositUnlockTime;
      info.withdrawUnlockTime =
        alluoStakingWalletAddressInfo.withdrawUnlockTime;
      info.cvxRewards = alluoStakingWalletAddressInfo.cvxRewards;

      setAlluoInfo(info);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

<<<<<<< HEAD
=======
  const handleUnlock = async () => {
    resetState();
    setIsUnlocking(true);
    let tx;
    try {
      heapTrack('stakeUnlockAmount', { amount: unlockValue });
      heapTrack('stakeUnlockButtonClicked');
      if (+unlockValue === 100) {
        tx = await unlockAllAlluo();
      } else {
        tx = await unlockAlluo(+alluoInfo.lockedInLp * (+unlockValue / 100));
      }
      setNotification('Successfully unlocked', 'success', tx.transactionHash, EChain.ETHEREUM);
      await updateAlluoInfo();
    } catch (error) {
      setNotification(error, 'error');
    }
    setIsUnlocking(false);
  };

>>>>>>> staging
  const handleWithdraw = async () => {
    resetState();
    setIsWithdrawing(true);
    try {
      await withdrawAlluo();
      await updateAlluoInfo();
<<<<<<< HEAD
      setNotification('Successfully withdrew', 'success');
=======
      setNotification('Transaction confirmed. $ALLUO tokens withdrawn to wallet.', 'success');
>>>>>>> staging
    } catch (error) {
      console.error('Error', error);
      setNotification(error, 'error');
    }
    setIsWithdrawing(false);
  };

  const startReunlockConfirmation = () => {
    setShowReunlockConfirmation(true);
  };

  const cancelReunlockConfirmation = () => {
    setShowReunlockConfirmation(false);
  };

  const updateRewardsInfo = async () => {
    setIsLoadingRewards(true);
    setIsLoadingPendingRewards(true);
    try {
      const CVXETHInUSDC = await getValueOf1LPinUSDC(
        EEthereumAddresses.CVXETH,
        EChain.ETHEREUM,
      );
      // Rewards
      const updatedRewards = {
        ...defaultRewards,
        value: toExactFixed(alluoInfo.cvxRewards, 8),
        stableValue: toExactFixed(CVXETHInUSDC * +alluoInfo.cvxRewards, 4),
      };
      setRewardsInfo(updatedRewards);
      setIsLoadingRewards(false);

      // Pending Rewards
      const updatedPendingRewards = await getStakingPendingRewards(
        EChain.ETHEREUM,
      );
      setPendingRewardsInfo(updatedPendingRewards);
      setIsLoadingPendingRewards(false);
    } catch (error) {
      console.log(error);
    }
  };

  const claimRewards = async () => {
    setIsClamingRewards(true);
    try {
      const tx = await claimStakingRewards();
      await updateAlluoInfo();
      setNotification(
        'Rewards claimed successfully',
        'success',
        tx.transactionHash,
        EChain.ETHEREUM,
      );
    } catch (error) {
      setNotification(error, 'error');
    }
    setIsClamingRewards(false);
  };

  return {
    walletAccountAtom,
    isLoading,
    alluoInfo,
    updateAlluoInfo,
    handleWithdraw,
    isWithdrawing,
    startReunlockConfirmation,
    showReunlockConfirmation,
    cancelReunlockConfirmation,
    seeRewardsAsStable,
    setSeeRewardsAsStable,
    isClamingRewards,
    isLoadingRewards,
    rewardsInfo,
    pendingRewardsInfo,
    claimRewards,
    nextHarvestDate,
    previousHarvestDate,
    isLoadingPendingRewards,
<<<<<<< HEAD
=======
    // unlock 
    unlockValue,
    setUnlockValue,
    handleUnlock,
    isUnlocking
>>>>>>> staging
  };
};
