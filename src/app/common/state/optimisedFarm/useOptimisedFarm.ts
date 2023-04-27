import {
  EEthereumAddresses,
  EOptimismAddresses,
  EPolygonAddresses
} from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import {
  deposit,
  getIfUserHasWithdrawalRequest,
  getIfWithdrawalWasAddedToQueue,
  withdraw
} from 'app/common/functions/farm';
import { heapTrack } from 'app/common/functions/heapClient';
import { depositDivided } from 'app/common/functions/utils';
import {
  approve,
  getBalance,
  getInterest,
  getTotalAssetSupply,
} from 'app/common/functions/web3Client';
import { isSafeApp, walletAccount, wantedChain } from 'app/common/state/atoms';
import { TFarm } from 'app/common/types/farm';
import { TSupportedToken } from 'app/common/types/global';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useNotification } from '../useNotification';
import { useProcessingSteps } from '../useProcessingSteps';
import { possibleDepositSteps } from './useOptimisedFarmDeposit';
import { possibleWithdrawSteps } from './useOptimisedFarmWithdrawal';

export const optimisedFarmOptions: Array<TFarm> = [
  {
    id: 0,
    farmAddress: EOptimismAddresses.BEEFYTOPVAULTUSDC,
    type: 'optimised',
    isOptimised: true,
    chain: EChain.OPTIMISM,
    name: 'Beefy Top Vault USD',
    sign: '$',
    icons: ['USDC', 'USDT', 'DAI'],
    underlyingTokenAddress: EOptimismAddresses.USDC,
    supportedTokens: [
      {
        label: 'DAI',
        address: EOptimismAddresses.DAI,
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: EOptimismAddresses.USDC,
        decimals: 6,
        sign: '$',
      },
      {
        label: 'USDT',
        address: EOptimismAddresses.USDT,
        decimals: 6,
        sign: '$',
      },
    ],
  },
  {
    id: 1,
    farmAddress: EOptimismAddresses.BEEFYTOP3VAULTUSDC,
    type: 'optimised',
    isOptimised: true,
    chain: EChain.OPTIMISM,
    name: 'Beefy Top 3 Vault USD',
    sign: '$',
    icons: ['USDC', 'USDT', 'DAI'],
    underlyingTokenAddress: EOptimismAddresses.USDC,
    supportedTokens: [
      {
        label: 'DAI',
        address: EOptimismAddresses.DAI,
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: EOptimismAddresses.USDC,
        decimals: 6,
        sign: '$',
      },
      {
        label: 'USDT',
        address: EOptimismAddresses.USDT,
        decimals: 6,
        sign: '$',
      },
    ],
  },
  {
    id: 2,
    farmAddress: EOptimismAddresses.BEEFYTOPVAULTETH,
    type: 'optimised',
    isOptimised: true,
    chain: EChain.OPTIMISM,
    name: 'Beefy Top Vault ETH',
    sign: '$',
    icons: ['WETH'],
    underlyingTokenAddress: EOptimismAddresses.WETH,
    supportedTokens: [
      {
        label: 'WETH',
        address: EOptimismAddresses.WETH,
        decimals: 18,
        sign: 'Ξ',
      },
    ],
  },
  {
    id: 3,
    farmAddress: EOptimismAddresses.BEEFYTOP3VAULTETH,
    type: 'optimised',
    isOptimised: true,
    chain: EChain.OPTIMISM,
    name: 'Beefy Top 3 Vault ETH',
    sign: '$',
    icons: ['WETH'],
    underlyingTokenAddress: EOptimismAddresses.WETH,
    supportedTokens: [
      {
        label: 'WETH',
        address: EOptimismAddresses.WETH,
        decimals: 18,
        sign: 'Ξ',
      },
    ],
  },
  {
    id: 4,
    farmAddress: EOptimismAddresses.YEARNTOPVAULTUSDC,
    type: 'optimised',
    isOptimised: true,
    chain: EChain.OPTIMISM,
    name: 'Yearn Top Vault USD',
    sign: '$',
    icons: ['USDC', 'USDT', 'DAI'],
    underlyingTokenAddress: EOptimismAddresses.USDC,
    supportedTokens: [
      {
        label: 'DAI',
        address: EOptimismAddresses.DAI,
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: EOptimismAddresses.USDC,
        decimals: 6,
        sign: '$',
      },
      {
        label: 'USDT',
        address: EOptimismAddresses.USDT,
        decimals: 6,
        sign: '$',
      },
    ],
  },
  {
    id: 5,
    farmAddress: EOptimismAddresses.YEARNTOP3VAULTUSDC,
    type: 'optimised',
    isOptimised: true,
    chain: EChain.OPTIMISM,
    name: 'Yearn Top 3 Vault USD',
    sign: '$',
    icons: ['USDC', 'USDT', 'DAI'],
    underlyingTokenAddress: EOptimismAddresses.USDC,
    supportedTokens: [
      {
        label: 'DAI',
        address: EOptimismAddresses.DAI,
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: EOptimismAddresses.USDC,
        decimals: 6,
        sign: '$',
      },
      {
        label: 'USDT',
        address: EOptimismAddresses.USDT,
        decimals: 6,
        sign: '$',
      },
    ],
  },
  {
    id: 6,
    farmAddress: EOptimismAddresses.YEARNTOPVAULTETH,
    type: 'optimised',
    isOptimised: true,
    chain: EChain.OPTIMISM,
    name: 'Yearn Top Vault ETH',
    sign: '$',
    icons: ['WETH'],
    underlyingTokenAddress: EOptimismAddresses.WETH,
    supportedTokens: [
      {
        label: 'WETH',
        address: EOptimismAddresses.WETH,
        decimals: 18,
        sign: 'Ξ',
      },
    ],
  },
  {
    id: 7,
    farmAddress: EOptimismAddresses.YEARNTOP3VAULTETH,
    type: 'optimised',
    isOptimised: true,
    chain: EChain.OPTIMISM,
    name: 'Yearn Top 3 Vault ETH',
    sign: '$',
    icons: ['WETH'],
    underlyingTokenAddress: EOptimismAddresses.WETH,
    supportedTokens: [
      {
        label: 'WETH',
        address: EOptimismAddresses.WETH,
        decimals: 18,
        sign: 'Ξ',
      },
    ],
  },
];

const possibleFarmSteps = [...possibleDepositSteps, ...possibleWithdrawSteps];

export const useOptimisedFarm = ({ id }) => {
  // react
  const navigate = useNavigate();

  // atoms
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // other state control files
  const { setNotification } = useNotification();

  // selected farm control
  const selectedFarm = useRef<TFarm>(
    optimisedFarmOptions.find(availableFarm => availableFarm.id == id),
  );
  const [selectedFarmInfo, setSelectedFarmInfo] = useState<TFarm>();
  const [selectedSupportedToken, setSelectedsupportedToken] =
    useState<TSupportedToken>();
  // selected supportedTokenInfo
  const selectedSupportedTokenInfo = useRef<any>({
    balance: 0,
    allowance: 0,
  });

  // inputs
  const [depositValue, setDepositValue] = useState<string>('');
  const [withdrawValue, setWithdrawValue] = useState<string>('');

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

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // biconomy
  const [useBiconomy, setUseBiconomy] = useState(false);

  useEffect(() => {
    if (walletAccountAtom && selectedFarmInfo) {
      setWantedChainAtom(selectedFarmInfo.chain);
    }
  }, [walletAccountAtom, selectedFarmInfo]);

  useEffect(() => {
    const selectFarm = async id => {
      try {
        let farm = optimisedFarmOptions.find(availableFarm => availableFarm.id == id);
        if (!farm) {
          navigate('/');
          return;
        }

        farm = { ...farm, ...(await getUpdatedFarmInfo(farm)) };

        heapTrack('farm', { pool: 'Ib', currency: farm.type });
        setSelectedFarmInfo(farm);
        setSelectedsupportedToken(farm.supportedTokens[0]);
      } catch (error) {
        console.log(error);
      }

      setIsLoading(false);
    };

    selectFarm(id);
  }, [walletAccountAtom]);

  useEffect(() => {
    if (selectedFarmInfo) {
      setUseBiconomy(
        isSafeAppAtom || EChain.POLYGON != selectedFarmInfo?.chain
          ? false
          : true,
      );
      fetchIfUserHasWithdrawalRequest();
    }
  }, [selectedFarmInfo]);

  const fetchIfUserHasWithdrawalRequest = async () => {
    try {
      const isUserWaiting = await getIfUserHasWithdrawalRequest(
        selectedFarmInfo.farmAddress,
        selectedFarmInfo.chain,
      );

      if (isUserWaiting) {
        setNotification(
          `You have pending withdrawal requests in the queue. These will be processed shortly`,
          'info',
          undefined,
          undefined,
          true,
        );
      }
    } catch (error) {
      setNotification(error, 'error');
    }
  };

  const updateFarmInfo = async () => {
    setIsLoading(true);
    try {
      const farm = await getUpdatedFarmInfo(selectedFarmInfo);
      setSelectedsupportedToken(
        farm.supportedTokens?.find(
          st => st?.address == selectedSupportedToken?.address,
        ),
      );
      setSelectedFarmInfo(farm);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const getUpdatedFarmInfo = async (farm = selectedFarmInfo) => {
    try {
      let farmInfo;

      farmInfo = {
        interest: await getInterest(farm.farmAddress, farm.chain),
        totalAssetSupply: await getTotalAssetSupply(
          farm.farmAddress,
          farm.chain,
        ),
        depositedAmount: 0,
      };
      if (walletAccountAtom) {
        const depositedAmount = await getBalance(
          farm.farmAddress,
          farm.chain,
        );
        farmInfo.depositedAmount = depositedAmount;
        farmInfo.depositDividedAmount = depositDivided(depositedAmount);
      }

      return { ...farm, ...farmInfo };
    } catch (error) {
      console.log(error);
    }
  };

  const selectSupportedToken = supportedToken => {
    setSelectedsupportedToken(supportedToken);
  };

  const handleApprove = async () => {
    try {
      const tx = await approve(
        selectedFarmInfo.farmAddress,
        selectedSupportedToken.address,
        selectedFarmInfo.chain,
        useBiconomy,
      );
      heapTrack('approvedTransactionMined', {
        pool: 'Ib',
        currency: selectedSupportedToken.label,
        amount: depositValue,
      });
      successTransactionHash.current = tx.transactionHash;
    } catch (err) {
      throw err;
    }
  };

  const handleDeposit = async () => {
    try {
      heapTrack('startedDepositing', {
        pool: 'Ib',
        currency: selectedSupportedToken.label,
        amount: depositValue,
      });
      const tx = await deposit(
        selectedSupportedToken.address,
        selectedFarmInfo.farmAddress,
        depositValue,
        selectedSupportedToken.decimals,
        selectedFarmInfo.chain,
        useBiconomy,
      );
      heapTrack('depositTransactionMined', {
        pool: 'Ib',
        currency: selectedSupportedToken.label,
        amount: depositValue,
      });
      successTransactionHash.current = tx.transactionHash;
    } catch (error) {
      throw error;
    }
  };

  const handleWithdraw = async () => {
    try {
      const tx = await withdraw(
        selectedSupportedToken.address,
        selectedFarmInfo.farmAddress,
        +withdrawValue,
        selectedFarmInfo.chain,
        useBiconomy,
      );
      successTransactionHash.current = tx.transactionHash;
      const blockNumber = tx.blockNumber;
      // the withdrawal might be instant or get into a buffer queue.
      const wasAddedToQueue = await getIfWithdrawalWasAddedToQueue(
        blockNumber,
        selectedFarm.current?.chain,
      );

      if (wasAddedToQueue) {
        steps.current[currentStep.current].successMessage = 'In progress...';
        steps.current[
          currentStep.current
        ].successLabel = `Your withdrawal request for ${withdrawValue} ${selectedSupportedToken.label} was added to the queue and will be processed soon`;
        setNotification(
          `You have pending withdrawal requests in the queue. These will be processed shortly`,
          'info',
          undefined,
          undefined,
          true,
        );
      }
    } catch (error) {
      throw error;
    }
  };

  const startProcessingSteps = async () => {
    setIsProcessing(true);
    await handleCurrentStep();
  };

  const stopProcessingSteps = async () => {
    resetProcessing();
    setDepositValue('');
    setWithdrawValue('');
    await updateFarmInfo();
  };

  // executes the handle for the current step
  const handleCurrentStep = async () => {
    setIsHandlingStep(true);

    const step = possibleFarmSteps.find(
      step => step.id == steps.current[currentStep.current].id,
    );

    try {
      switch (step.id) {
        case 0:
          await handleApprove();
          break;

        case 1:
          await handleDeposit();
          break;

        case 2:
          await handleWithdraw();
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
    isLoading,
    selectedFarm,
    selectedFarmInfo,
    selectedSupportedToken,
    selectSupportedToken,
    selectedSupportedTokenInfo,
    // deposit
    depositValue,
    setDepositValue,
    // withdraw
    withdrawValue,
    setWithdrawValue,
    // biconomy
    useBiconomy,
    setUseBiconomy,
    // steps
    isProcessing,
    currentStep,
    isHandlingStep,
    stepWasSuccessful,
    stepError,
    startProcessingSteps,
    stopProcessingSteps,
    steps,
    handleCurrentStep,
  };
};
