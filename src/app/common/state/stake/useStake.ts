import { EEthereumAddresses } from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import { heapTrack } from 'app/common/functions/heapClient';
import {
  approveAlluoStaking,
  claimStakingRewards,
  getAlluoBalance,
  getAlluoStakingAllowance,
  getAlluoStakingAPR,
  getAlluoStakingWalletAddressInfo,
  getEarnedAlluo,
  getRewardsInterest,
  getStakingPendingRewards,
  getTotalAlluoLocked,
  getUnlockedAlluo,
  lockAlluo,
  unlockAllAlluo,
  unlockAlluo,
  withdrawAlluo
} from 'app/common/functions/stake';
import { toExactFixed } from 'app/common/functions/utils';
import { getValueOf1LPinUSDC } from 'app/common/functions/web3Client';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { TPossibleStep } from 'app/common/types/global';
import openVault from 'app/modernUI/animations/openVault.svg';
import vaultUnlocking from 'app/modernUI/animations/vaultUnlocking.svg';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useRecoilState } from 'recoil';
import { useProcessingSteps } from '../useProcessingSteps';
import { possibleLockSteps } from './useLock';
import { possibleUnlockSteps } from './useUnlock';

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

const possibleStakeSteps = [
  {
    id: 3,
    label: '',
    errorLabel: 'Failed to withdraw tokens',
    successLabel: '',
    image: vaultUnlocking,
    successImage: openVault,
  },
  {
    id: 4,
    label: '',
    errorLabel: 'Failed to claim rewards',
    successLabel: '',
  },
  ...possibleLockSteps,
  ...possibleUnlockSteps,
];

export const useStake = () => {
  // react
  const [cookies] = useCookies(['has_seen_stake']);
  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // tabs
  const [selectedTab, setSelectedTab] = useState(0);

  // alluo info
  const [alluoInfo, setAlluoInfo] = useState<TAlluoStakingInfo>();

  // inputs
  const [lockValue, setLockValue] = useState<string>('');
  const [unlockValue, setUnlockValue] = useState<number>(0);

  // steps
  const {
    isProcessing,
    setIsProcessing,
    currentStep,
    steps,
    stepWasSuccessful,
    stepError,
    successTransactionHash,
    resetProcessing,
    isHandlingStep,
    setIsHandlingStep,
  } = useProcessingSteps();
  const processingTitle = useRef<string>();

  //rewards control
  const rewardsApy = useRef<number>(0);
  const [rewardsInfo, setRewardsInfo] = useState<any>(defaultRewards);
  const [pendingRewardsInfo, setPendingRewardsInfo] = useState<any>(false);
  const [seeRewardsAsStable, setSeeRewardsAsStable] = useState<boolean>(false);
  const previousHarvestDate = moment().subtract(1, 'days').day('Sunday');
  const nextHarvestDate = moment()
    .subtract(1, 'days')
    .add(1, 'week')
    .day('Sunday');

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingRewardsApy, setIsLoadingRewardsApy] = useState<boolean>(true);
  const [isLoadingRewards, setIsLoadingRewards] = useState<boolean>(false);
  const [isLoadingPendingRewards, setIsLoadingPendingRewards] =
    useState<boolean>(false);

  // confirmation/information control
  const showStakePresentation = !cookies.has_seen_stake;
  const [showReunlockConfirmation, setShowReunlockConfirmation] =
    useState<boolean>(false);

  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.ETHEREUM);
      heapTrack('stake');
      updateRewardsApy();
      updateAlluoInfo();
    }
  }, [walletAccountAtom]);

  useEffect(() => {
    if (walletAccountAtom && alluoInfo) {
      updateRewardsInfo();
    }
  }, [alluoInfo]);

  const updateRewardsApy = async () => {
    setIsLoadingRewardsApy(true);
    rewardsApy.current = await getRewardsInterest();
    setIsLoadingRewardsApy(false);
  }

  const updateAlluoInfo = async () => {
    setShowReunlockConfirmation(false);
    setIsLoading(true);
    try {
      let info: TAlluoStakingInfo = {
        balance: await getAlluoBalance(),
        allowance: await getAlluoStakingAllowance(),
        apr: toExactFixed(await getAlluoStakingAPR(), 2),
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

  const handleApprove = async () => {
    try {
      const tx = await approveAlluoStaking();
      successTransactionHash.current = tx.transactionHash;
    } catch (error) {
      throw error;
    }
  };

  const handleLock = async () => {
    try {
      heapTrack('stakeLockAmount', { amount: lockValue });
      heapTrack('stakeLockButtonClicked');
      const tx = await lockAlluo(lockValue);
      successTransactionHash.current = tx.transactionHash;
    } catch (error) {
      throw error;
    }
  };

  const handleUnlock = async () => {
    let tx;
    try {
      heapTrack('stakeUnlockAmount', { amount: unlockValue });
      heapTrack('stakeUnlockButtonClicked');
      if (+unlockValue === 100) {
        tx = await unlockAllAlluo();
      } else {
        tx = await unlockAlluo(+alluoInfo.lockedInLp * (+unlockValue / 100));
      }
      successTransactionHash.current = tx.transactionHash;
    } catch (error) {
      throw error;
    }
  };

  const handleWithdraw = async () => {
    try {
      const tx = await withdrawAlluo();
      successTransactionHash.current = tx.transactionHash;
    } catch (error) {
      throw error;
    }
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
    try {
      const tx = await claimStakingRewards();
      successTransactionHash.current = tx.transactionHash;
    } catch (error) {
      throw error;
    }
  };

  const startProcessingSteps = async () => {
    cancelReunlockConfirmation();
    processingTitle.current =
      processingTitle.current != undefined
        ? processingTitle.current
        : selectedTab == 0
          ? 'Locking funds...'
          : 'Unlocking funds...';
    setIsProcessing(true);
    await handleCurrentStep();
  };

  const startWithdrawSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    // Withdraw step is always there
    neededSteps.push({
      ...possibleStakeSteps[0],
      label: `Withdrawing ${alluoInfo?.unlocked} $ALLUO`,
      successLabel: `${alluoInfo?.unlocked} $ALLUO withdrawn`,
    });

    processingTitle.current = 'Withdrawing funds...';
    steps.current = neededSteps;

    await startProcessingSteps();
  };

  const startClaimRewardsSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    // Withdraw step is always there
    const label = seeRewardsAsStable
      ? rewardsInfo.stableLabel
      : rewardsInfo.label;
    const value = seeRewardsAsStable
      ? rewardsInfo.stableValue
      : rewardsInfo.value;
    neededSteps.push({
      ...possibleStakeSteps[1],
      label: `Claiming ${value} ${label}`,
      successLabel: `${value} ${label} claimed`,
    });

    processingTitle.current = 'Claiming rewards...';
    steps.current = neededSteps;

    await startProcessingSteps();
  };

  const stopProcessingSteps = async () => {
    processingTitle.current = undefined;
    resetProcessing();
    setUnlockValue(0);
    setLockValue('');
    await updateAlluoInfo();
  };

  // executes the handle for the current step
  const handleCurrentStep = async () => {
    setIsHandlingStep(true);

    const step = possibleStakeSteps.find(
      step => step.id == steps.current[currentStep.current].id,
    );

    try {
      switch (step.id) {
        case 0:
          await handleApprove();
          break;

        case 1:
          await handleLock();
          break;

        case 2:
          await handleUnlock();
          break;

        case 3:
          await handleWithdraw();
          break;

        case 4:
          await claimRewards();
          break;
      }
      stepWasSuccessful.current = true;
    } catch (error) {
      stepError.current = error;
      stepWasSuccessful.current = false;
    }
    setIsHandlingStep(false);
  };

  return {
    selectedTab,
    setSelectedTab,
    walletAccountAtom,
    isLoading,
    alluoInfo,
    updateAlluoInfo,
    startReunlockConfirmation,
    showReunlockConfirmation,
    cancelReunlockConfirmation,
    seeRewardsAsStable,
    setSeeRewardsAsStable,
    isLoadingRewards,
    rewardsInfo,
    pendingRewardsInfo,
    claimRewards,
    nextHarvestDate,
    previousHarvestDate,
    isLoadingPendingRewards,
    isLoadingRewardsApy,
    rewardsApy,
    // information/ confirmation
    showStakePresentation,
    // lock
    lockValue,
    setLockValue,
    // unlock
    unlockValue,
    setUnlockValue,
    // steps
    isProcessing,
    currentStep,
    processingTitle,
    isHandlingStep,
    stepWasSuccessful,
    stepError,
    startProcessingSteps,
    stopProcessingSteps,
    steps,
    handleCurrentStep,
    startWithdrawSteps,
    startClaimRewardsSteps,
  };
};
