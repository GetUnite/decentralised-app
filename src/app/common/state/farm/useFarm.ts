import {
  EEthereumAddresses,
  EPolygonAddresses
} from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import {
  deposit,
  getIfWithdrawalWasAddedToQueue,
  withdraw
} from 'app/common/functions/farm';
import { heapTrack } from 'app/common/functions/heapClient';
import { depositDivided } from 'app/common/functions/utils';
import {
  approve, getInterest,
  getTotalAssetSupply,
  getUserDepositedAmount
} from 'app/common/functions/web3Client';
import { isSafeApp, walletAccount, wantedChain } from 'app/common/state/atoms';
import { TFarm } from 'app/common/types/farm';
import { TSupportedToken } from 'app/common/types/global';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useProcessingSteps } from '../useProcessingSteps';
import { possibleDepositSteps } from './useFarmDeposit';
import { possibleWithdrawSteps } from './useFarmWithdrawal';

export const farmOptions: Array<TFarm> = [
  {
    id: 0,
    farmAddress: EPolygonAddresses.IBALLUOUSD,
    type: 'usd',
    chain: EChain.POLYGON,
    name: 'US Dollar',
    sign: '$',
    icons: ['USDC', 'USDT', 'DAI'],
    underlyingTokenAddress: EPolygonAddresses.USDC,
    supportedTokens: [
      {
        label: 'DAI',
        address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDC',
        address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        decimals: 6,
        sign: '$',
      },
      {
        label: 'USDT',
        address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
        decimals: 6,
        sign: '$',
      },
    ],
  },
  {
    id: 1,
    farmAddress: EPolygonAddresses.IBALLUOEUR,
    type: 'eur',
    chain: EChain.POLYGON,
    name: 'Euro',
    sign: '€',
    icons: ['EURT', 'EURS', 'jEUR'],
    underlyingTokenAddress: EPolygonAddresses.EURT,
    supportedTokens: [
      {
        label: 'EURS',
        address: '0xE111178A87A3BFf0c8d18DECBa5798827539Ae99',
        decimals: 2,
        sign: '€',
      },
      {
        label: 'PAR',
        address: '0xE2Aa7db6dA1dAE97C5f5C6914d285fBfCC32A128',
        decimals: 18,
        sign: '€',
      },
      {
        label: 'jEUR',
        address: '0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c',
        decimals: 18,
        sign: '€',
      },
      {
        label: 'EURT',
        address: '0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f',
        decimals: 6,
        sign: '€',
      },
    ],
  },
  {
    id: 2,
    farmAddress: EPolygonAddresses.IBALLUOETH,
    type: 'eth',
    chain: EChain.POLYGON,
    name: 'Ethereum',
    sign: 'Ξ',
    icons: ['WETH'],
    underlyingTokenAddress: EPolygonAddresses.WETH,
    supportedTokens: [
      {
        label: 'WETH',
        address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        decimals: 18,
        sign: 'Ξ',
      },
    ],
  },
  {
    id: 3,
    farmAddress: EPolygonAddresses.IBALLUOBTC,
    type: 'btc',
    chain: EChain.POLYGON,
    name: 'Bitcoin',
    sign: '₿',
    icons: ['WBTC'],
    underlyingTokenAddress: EPolygonAddresses.WBTC,
    supportedTokens: [
      {
        label: 'WBTC',
        address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
        decimals: 8,
        sign: '₿',
      },
    ],
  },
  /*{
    id: 4,
    farmAddress: EEthereumAddresses.IBALLUOUSD,
    type: 'usd',
    chain: EChain.ETHEREUM,
    name: 'US Dollar',
    sign: '$',
    icons: ['USDC', 'USDT', 'DAI'],
    underlyingTokenAddress: EEthereumAddresses.USDC,
    supportedTokens: [
      {
        label: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        sign: '$',
      },
      {
        label: 'DAI',
        address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        decimals: 18,
        sign: '$',
      },
      {
        label: 'USDT',
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
        sign: '$',
      },
    ],
  },*/
  {
    id: 5,
    farmAddress: EEthereumAddresses.IBALLUOEUR,
    type: 'eur',
    chain: EChain.ETHEREUM,
    name: 'Euro',
    sign: '€',
    icons: ['EURT', 'EURS', 'agEUR'],
    underlyingTokenAddress: EEthereumAddresses.EURT,
    supportedTokens: [
      {
        label: 'EURS',
        address: '0xdB25f211AB05b1c97D595516F45794528a807ad8',
        decimals: 2,
        sign: '€',
      },
      {
        label: 'EURT',
        address: '0xC581b735A1688071A1746c968e0798D642EDE491',
        decimals: 6,
        sign: '€',
      },
      {
        label: 'agEUR',
        address: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
        decimals: 18,
        sign: '€',
      },
    ],
  },
  {
    id: 6,
    farmAddress: EEthereumAddresses.IBALLUOETH,
    type: 'eth',
    chain: EChain.ETHEREUM,
    name: 'Ethereum',
    sign: 'Ξ',
    icons: ['WETH'],
    underlyingTokenAddress: EEthereumAddresses.WETH,
    supportedTokens: [
      {
        label: 'WETH',
        address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        sign: 'Ξ',
      },
    ],
  },
  {
    id: 7,
    farmAddress: EEthereumAddresses.IBALLUOBTC,
    type: 'btc',
    chain: EChain.ETHEREUM,
    name: 'Bitcoin',
    sign: '₿',
    icons: ['WBTC'],
    underlyingTokenAddress: EEthereumAddresses.WBTC,
    supportedTokens: [
      {
        label: 'WBTC',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        sign: '₿',
      },
    ],
  },
];

const possibleFarmSteps = [...possibleDepositSteps, ...possibleWithdrawSteps];

export const useFarm = ({ id }) => {
  // react
  const navigate = useNavigate();

  // atoms
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // selected farm control
  const selectedFarm = useRef<TFarm>(
    farmOptions.find(availableFarm => availableFarm.id == id),
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
        let farm = farmOptions.find(availableFarm => availableFarm.id == id);
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
    }
  }, [selectedFarmInfo]);

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
        const depositedAmount = await getUserDepositedAmount(
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

      // change the step message to tell the user the withdraw was added to the queue
      if (wasAddedToQueue) {
        console.log('here i guess');
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
