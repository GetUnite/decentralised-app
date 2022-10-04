import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { isSafeApp, walletAccount, wantedChain } from 'app/common/state/atoms';
import {
  transferToAddress,
  getIbAlluoInfo,
} from 'app/common/functions/transfer';
import { useNotification } from 'app/common/state';
import { addressIsValid, isNumeric } from 'app/common/functions/utils';
import { EChain } from 'app/common/constants/chains';
import { EPolygonAddresses } from 'app/common/constants/addresses';
import { TIbAlluoInfo } from 'app/common/types/transfer';

export const useTransfer = () => {
  // atoms
  const [, setWantedChainAtom] = useRecoilState(wantedChain);
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [isSafeAppAtom] = useRecoilState(isSafeApp);

  // notifications
  const { setNotificationt } = useNotification();

  // biconomy
  const [useBiconomy, setUseBiconomy] = useState(!isSafeAppAtom);

  // ibAlluos
  const [ibAlluosInfo, setIbAlluosInfo] = useState<Array<TIbAlluoInfo>>([]);

  // inputs
  const [selectedIbAlluo, setSelectedIbAlluo] = useState<string>('IbAlluoUSD');
  const [transferValue, setTransferValue] = useState<string>();
  const [transferValueError, setTransferValueError] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [recipientAddressError, setRecipientAddressError] =
    useState<string>('');

  // loading control
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.POLYGON);
      fetchIbAlluosInfo();
    }
  }, [walletAccountAtom]);

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
      setTransferValueError('Not enough balance');
    } else {
      setTransferValue(value);
    }
  };

  const handleRecipientAddressChange = e => {
    const { value } = e.target;
    setRecipientAddressError('');
    if (!addressIsValid(value)) {
      setRecipientAddressError('Recipient address is not valid');
    } else {
      setRecipientAddressError('');
    }
    setRecipientAddress(value);
  };

  const handleTransfer = async () => {
    setIsTransferring(true);

    try {
      await transferToAddress(
        selectedIbAlluoInfo.address,
        transferValue,
        selectedIbAlluoInfo.decimals,
        recipientAddress,
        useBiconomy,
      );
      await fetchIbAlluosInfo();
      setTransferValue('');
      setRecipientAddress('');
      setNotificationt('Transfer completed successfully', 'success');
    } catch (err) {
      console.error('Error', err.message);
      setNotificationt(err.message, 'error');
    }

    setIsTransferring(false);
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
    isTransferring,
    handleTransfer,
    ibAlluosInfo,
    recipientAddress,
    handleRecipientAddressChange,
    setSelectedIbAlluoBySymbol,
    isSafeAppAtom,
    useBiconomy,
    setUseBiconomy,
    isLoading,
  };
};
