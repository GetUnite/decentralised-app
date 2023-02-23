import { Resolution } from '@unstoppabledomains/resolution';
import { udTlds } from '@unstoppabledomains/tldsresolverkeys';
import { EPolygonAddresses } from 'app/common/constants/addresses';
import { EChain } from 'app/common/constants/chains';
import { heapTrack } from 'app/common/functions/heapClient';
import {
  getIbAlluoInfo,
  transferToAddress
} from 'app/common/functions/transfer';
import { addressIsValid, isNumeric } from 'app/common/functions/utils';
import { useProcessingSteps } from 'app/common/state';
import { isSafeApp, walletAccount, wantedChain } from 'app/common/state/atoms';
import { TPossibleStep } from 'app/common/types/global';
import { TIbAlluoInfo } from 'app/common/types/transfer';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

export const possibleTransferSteps: TPossibleStep[] = [
  {
    id: 0,
    label: 'Transfer',
    successLabel: '',
    errorLabel: 'Tranfer failed',
  },
];

export const useTransfer = () => {
  // atoms
  const [, setWantedChainAtom] = useRecoilState(wantedChain);
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [isSafeAppAtom] = useRecoilState(isSafeApp);

  // biconomy
  const [useBiconomy, setUseBiconomy] = useState(!isSafeAppAtom);

  // ibAlluos
  const [ibAlluosInfo, setIbAlluosInfo] = useState<Array<TIbAlluoInfo>>([]);

  // inputs
  const [selectedIbAlluo, setSelectedIbAlluo] = useState<string>('IbAlluoUSD');
  const [transferValue, setTransferValue] = useState<string>('');
  const [transferValueError, setTransferValueError] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [recipientAddressError, setRecipientAddressError] =
    useState<string>('');
  const [recipientAddressValue, setRecipientAddressValue] =
    useState<string>('');

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
    successImage,
    isHandlingStep,
    setIsHandlingStep,
  } = useProcessingSteps();

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (walletAccountAtom) {
      heapTrack('transfer');
      setWantedChainAtom(EChain.POLYGON);
      fetchIbAlluosInfo();
    }
  }, [walletAccountAtom]);

  // when the selected token changes, trigger balance update
  useEffect(() => {
    updateSteps();
  }, [transferValue, recipientAddress]);

  // function that updates the balance of the selected token on change
  const updateSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    let recipientAddressVal: any = recipientAddressValue;
    if (/^[ A-Za-z0-9]*$/.test(recipientAddress)) {
      recipientAddressVal = recipientAddress;
    }

    // Withdraw step is always there
    neededSteps.push({
      ...possibleTransferSteps[0],
      label: `Tranfering ${transferValue} ${selectedIbAlluoInfo?.label}`,
      successLabel: `${transferValue} ${selectedIbAlluoInfo?.label} transfered successfully`,
      successMessage: `${transferValue} ${selectedIbAlluoInfo?.label} sent to ${recipientAddressVal}`,
    });

    steps.current = neededSteps;
  };

  const setSelectedIbAlluoBySymbol = tokenInfo => {
    setSelectedIbAlluo(tokenInfo.type);
  };

  const fetchIbAlluosInfo = async () => {
    setIsLoading(true);
    const [usd, eur, eth, btc] = await Promise.all([
      getIbAlluoInfo(EPolygonAddresses.IBALLUOUSD),
      getIbAlluoInfo(EPolygonAddresses.IBALLUOEUR),
      getIbAlluoInfo(EPolygonAddresses.IBALLUOETH),
      getIbAlluoInfo(EPolygonAddresses.IBALLUOBTC),
    ]);

    setIbAlluosInfo([
      {
        label: 'USD',
        address: usd.address,
        balance: usd.balance,
        decimals: usd.decimals,
        type: usd.symbol,
        sign: getTokenSign(usd.symbol),
      },
      {
        label: 'EUR',
        address: eur.address,
        balance: eur.balance,
        decimals: eur.decimals,
        type: eur.symbol,
        sign: getTokenSign(eur.symbol),
      },
      {
        label: 'ETH',
        address: eth.address,
        balance: eth.balance,
        decimals: eth.decimals,
        type: eth.symbol,
        sign: getTokenSign(eth.symbol),
      },
      {
        label: 'BTC',
        address: btc.address,
        balance: btc.balance,
        decimals: btc.decimals,
        type: btc.symbol,
        sign: getTokenSign(btc.symbol),
      },
    ]);
    setIsLoading(false);
  };

  const selectedIbAlluoInfo = ibAlluosInfo?.find(
    token => token.type === selectedIbAlluo,
  );

  const handleTransferValueChange = value => {
    setTransferValueError('');
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setTransferValueError('Write a valid number');
    } else if (+value > +(selectedIbAlluoInfo?.balance || 0)) {
      setTransferValueError('Insufficient balance');
    } else {
      setTransferValue(value);
    }
  };

  const handleRecipientAddressChange = e => {
    const { value } = e.target;
    const resolution = new Resolution();
    setRecipientAddressError('');
    setRecipientAddressValue('');

    if (value != '')
      if (/\.(?=[^\.]+$)/.test(value)) {
        const inputTld = value.split(/\.(?=[^\.]+$)/);
        const found = udTlds.find(
          ele => inputTld && inputTld.length > 0 && inputTld[1].includes(ele),
        );
        if (found) {
          resolution
            .owner(value)
            .then(address => {
              setRecipientAddressValue(address);
              setRecipientAddressError('');
              return address;
            })
            .catch(error => {
              if (error.code === 'UnregisteredDomain') {
                console.log('Domain is not registered');
              }
            });
        }

        if (!addressIsValid(value)) {
          setRecipientAddressError(
            'Recipient address or domain name is not valid',
          );
        }
      } else if (/^[ A-Za-z0-9]*$/.test(value)) {
        setRecipientAddressError('');
        if (!addressIsValid(value)) {
          setRecipientAddressError(
            'Recipient address or domain name is not valid',
          );
        }
      } else {
        setRecipientAddressError(
          'Recipient address or domain name is not valid',
        );
      }
    setRecipientAddress(value);
  };

  const startProcessingSteps = async () => {
    setIsProcessing(true);
    await handleCurrentStep();
  };

  const stopProcessingSteps = async () => {
    resetProcessing();
    setTransferValue('');
    setRecipientAddressValue('');
    setRecipientAddress('');
    await fetchIbAlluosInfo();
  };

  const handleTransfer = async () => {
    let recipientAddressVal: any = recipientAddressValue;
    if (/^[ A-Za-z0-9]*$/.test(recipientAddress)) {
      recipientAddressVal = recipientAddress;
    }
    try {
      heapTrack('transferAmount', { amount: transferValue });
      heapTrack('transferRecipient', { recipient: recipientAddress });
      heapTrack('transferButtonClicked');
      const tx = await transferToAddress(
        selectedIbAlluoInfo.address,
        transferValue,
        selectedIbAlluoInfo.decimals,
        recipientAddressVal,
        useBiconomy,
      );
      successTransactionHash.current = tx.transactionHash;
    } catch (error) {
      throw error;
    }
  };

  // executes the handle for the current step
  const handleCurrentStep = async () => {
    setIsHandlingStep(true);

    const step = possibleTransferSteps.find(
      step => step.id == steps.current[currentStep.current].id,
    );

    try {
      switch (step.id) {
        case 0:
          await handleTransfer();
          break;
      }
      stepWasSuccessful.current = true;
    } catch (error) {
      stepError.current = error;
      stepWasSuccessful.current = false;
    }
    setIsHandlingStep(false);
  };

  const getTokenSign = (type = 'usd') => {
    return type === 'usd'
      ? '$'
      : type === 'eur'
      ? '€'
      : type === 'eth'
      ? 'Ξ'
      : type === 'btc'
      ? '₿'
      : '';
  };

  return {
    recipientAddressError,
    transferValueError,
    hasErrors: recipientAddressError != '' || transferValueError != '',
    transferValue,
    selectedIbAlluoInfo,
    handleTransferValueChange,
    ibAlluosInfo,
    recipientAddress,
    recipientAddressValue,
    handleRecipientAddressChange,
    setSelectedIbAlluoBySymbol,
    isSafeAppAtom,
    useBiconomy,
    setUseBiconomy,
    isLoading,
    // steps
    isProcessing,
    isHandlingStep,
    currentStep,
    stepWasSuccessful,
    stepError,
    startProcessingSteps,
    stopProcessingSteps,
    steps,
    handleCurrentStep,
  };
};
