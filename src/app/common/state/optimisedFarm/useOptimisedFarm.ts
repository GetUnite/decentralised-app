import { EOptimismAddresses } from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import { heapTrack } from 'app/common/functions/heapClient';
import { depositDivided } from 'app/common/functions/utils';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { TOptimisedFarm } from 'app/common/types/farm';
import { TSupportedToken } from 'app/common/types/global';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useProcessingSteps } from '../useProcessingSteps';
import { possibleDepositSteps } from './useOptimisedFarmDeposit';
import { possibleWithdrawSteps } from './useOptimisedFarmWithdrawal';
import {
  depositIntoOptimised,
  getOptimisedFarmInterest,
  getOptimisedTotalAssetSupply,
  getUserOptimisedFarmDepositedAmount,
  withdrawFromOptimised,
} from 'app/common/functions/optimisedFarm';
import { approve } from 'app/common/functions/web3Client';

export const optimisedFarmOptions: Array<TOptimisedFarm> = [
  {
    id: 0,
    farmAddress: EOptimismAddresses.BEEFYTOPVAULTUSD,
    type: 'beefy',
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
    // apy addresses order needs to match underlying vaults. So the first apy address needs to be according to the first underlying vault and so on
    apyAddresses: [
      '72d0ef83-fa27-44ba-b9a6-efb0a43f2a3c', // USD+-DOLA
    ],
    isNewest: true,
  },
  {
    id: 1,
    farmAddress: EOptimismAddresses.BEEFYTOP3VAULTUSD,
    type: 'beefy',
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
    // apy addresses order needs to match underlying vaults. So the first apy address needs to be according to the first underlying vault and so on
    apyAddresses: [
      '72d0ef83-fa27-44ba-b9a6-efb0a43f2a3c', // USD+-DOLA
      'd643c61d-bfcb-429e-9bac-b3b0a2f18561', // MIM-DAI-USDC-USDT
      '25717654-0ded-413f-9b88-c06b919f04a6', // DOLA-MAI
    ],
    isNewest: true,
  },
  {
    id: 2,
    farmAddress: EOptimismAddresses.BEEFYTOPVAULTETH,
    type: 'beefy',
    isOptimised: true,
    chain: EChain.OPTIMISM,
    name: 'Beefy Top Vault ETH',
    sign: 'Ξ',
    icons: [
      //'ETH',
      'WETH',
    ],
    underlyingTokenAddress: EOptimismAddresses.WETH,
    supportedTokens: [
      /*{
        label: 'ETH',
        address: EOptimismAddresses.ETH,
        decimals: 18,
        sign: 'Ξ',
      },*/
      {
        label: 'WETH',
        address: EOptimismAddresses.WETH,
        decimals: 18,
        sign: 'Ξ',
      },
    ],
    // apy addresses order needs to match underlying vaults. So the first apy address needs to be according to the first underlying vault and so on
    apyAddresses: [
      'e6281e9b-c308-4bb1-a59e-e53fe511ecf8', // ETH-frxETH
    ],
    isNewest: true,
  },
  {
    id: 3,
    farmAddress: EOptimismAddresses.BEEFYTOP3VAULTETH,
    type: 'beefy',
    isOptimised: true,
    chain: EChain.OPTIMISM,
    name: 'Beefy Top 3 Vault ETH',
    sign: 'Ξ',
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
    // apy addresses order needs to match underlying vaults. So the first apy address needs to be according to the first underlying vault and so on
    apyAddresses: [
      'e6281e9b-c308-4bb1-a59e-e53fe511ecf8', // ETH-frxETH
      '249f4209-98d2-4aa5-8596-8fb2d2867426', // alETH-ETH
      '0bd59ec7-6389-4a92-93fb-aa4ee6b2705b', // sfrxETH-frxETH
    ],
    isNewest: true,
  },
  {
    id: 4,
    farmAddress: EOptimismAddresses.YEARNTOPVAULTUSD,
    type: 'yearn',
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
    isNewest: true,
  },
  {
    id: 5,
    farmAddress: EOptimismAddresses.YEARNTOP3VAULTUSD,
    type: 'yearn',
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
    isNewest: true,
  },
  {
    id: 6,
    farmAddress: EOptimismAddresses.YEARNTOPVAULTETH,
    type: 'yearn',
    isOptimised: true,
    chain: EChain.OPTIMISM,
    name: 'Yearn Top Vault ETH',
    sign: 'Ξ',
    icons: [
      //'ETH',
      'WETH',
    ],
    underlyingTokenAddress: EOptimismAddresses.WETH,
    supportedTokens: [
      /*{
        label: 'ETH',
        address: EOptimismAddresses.ETH,
        decimals: 18,
        sign: 'Ξ',
      },*/
      {
        label: 'WETH',
        address: EOptimismAddresses.WETH,
        decimals: 18,
        sign: 'Ξ',
      },
    ],
    isNewest: true,
  },
  /*{
    id: 7,
    farmAddress: EOptimismAddresses.YEARNTOP3VAULTETH,
    type: 'optimised',
    isOptimised: true,
    chain: EChain.OPTIMISM,
    name: 'Yearn Top 3 Vault ETH',
    sign: 'Ξ',
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
    // apy addresses order needs to match underlying vaults. So the first apy address needs to be according to the first underlying vault and so on
    apyAddresses: [
      '288e9c6d-d0fe-4606-a970-e0e98893231a',
      '25717654-0ded-413f-9b88-c06b919f04a6',
    ],
    isNewest: true,
  },*/
];

const possibleFarmSteps = [...possibleDepositSteps, ...possibleWithdrawSteps];

export const useOptimisedFarm = ({ id }) => {
  // react
  const navigate = useNavigate();

  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // selected farm control
  const selectedFarm = useRef<TOptimisedFarm>(
    optimisedFarmOptions.find(availableFarm => availableFarm.id == id),
  );
  const [selectedFarmInfo, setSelectedFarmInfo] = useState<TOptimisedFarm>();
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
        let farm = optimisedFarmOptions.find(
          availableFarm => availableFarm.id == id,
        );
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
        interest: await getOptimisedFarmInterest(
          farm.farmAddress,
          farm.type,
          farm.apyAddresses,
        ),
        totalAssetSupply: await getOptimisedTotalAssetSupply(
          farm.farmAddress,
          farm.underlyingTokenAddress,
          farm.chain,
        ),
        depositedAmount: 0,
      };
      if (walletAccountAtom) {
        const depositedAmount = await getUserOptimisedFarmDepositedAmount(
          farm.farmAddress,
          farm.underlyingTokenAddress,
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
      const tx = await depositIntoOptimised(
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
      const withdrawPercentage = Math.round(
        (+withdrawValue / +selectedFarmInfo.depositedAmount) * 100,
      );

      const tx = await withdrawFromOptimised(
        selectedSupportedToken.address,
        selectedFarmInfo.farmAddress,
        +withdrawPercentage,
        selectedFarmInfo.chain,
        useBiconomy,
      );

      successTransactionHash.current = tx.transactionHash;
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