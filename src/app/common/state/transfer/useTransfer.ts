import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { walletAccount } from 'app/common/state/atoms';
import {
  transferToAddress,
  getIbAlluoInfo,
  EChain,
} from 'app/common/functions/Web3Client';
import { useNotification, ENotificationId } from 'app/common/state';
import { useChain } from 'app/common/state';
import { addressIsValid, isNumeric } from 'app/common/functions/utils';

export const useTransfer = () => {
  const { setNotificationt } = useNotification();
  const { changeChainTo } = useChain();
  const [walletAccountAtom] = useRecoilState(walletAccount);

  type IbAlluoInfo = {
    type?: string;
    address?: string;
    balance?: string;
    decimals?: number;
    label?: string;
  };

  const [selectedIbAlluo, setSelectedIbAlluo] = useState<string>('IbAlluoUSD');
  const [transferValue, setTransferValue] = useState<string>();
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [ibAlluosInfo, setIbAlluosInfo] = useState<Array<IbAlluoInfo>>([]);

  useEffect(() => {
    if (walletAccountAtom) {
      changeChainTo(EChain.POLYGON);
      fetchIbAlluosInfo();
    }
  }, [walletAccountAtom]);

  const resetState = () => {
    setError('');
    setIsTransferring(false);
  };

  const setSelectedIbAlluoBySymbol = tokenInfo => {
    setSelectedIbAlluo(tokenInfo.type);
  };

  const fetchIbAlluosInfo = async () => {
    const [usd, eur, eth, btc] = await Promise.all([
      getIbAlluoInfo('usd'),
      getIbAlluoInfo('eur'),
      getIbAlluoInfo('eth'),
      getIbAlluoInfo('btc'),
    ]);

    setIbAlluosInfo([
      {
        label: 'USD',
        address: usd.ibAlluoAddress,
        balance: usd.balance,
        decimals: usd.decimals,
        type: usd.symbol,
      },
      {
        label: 'EUR',
        address: eur.ibAlluoAddress,
        balance: eur.balance,
        decimals: eur.decimals,
        type: eur.symbol,
      },
      {
        label: 'ETH',
        address: eth.ibAlluoAddress,
        balance: eth.balance,
        decimals: eth.decimals,
        type: eth.symbol,
      },
      {
        label: 'BTC',
        address: btc.ibAlluoAddress,
        balance: btc.balance,
        decimals: btc.decimals,
        type: btc.symbol,
      },
    ]);
  };

  const selectedIbAlluoInfo = ibAlluosInfo?.find(
    token => token.type === selectedIbAlluo,
  );

  const handleTransferValueChange = e => {
    const { value } = e.target;
    resetState();
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setError('Write a valid number');
    } else if (+value > +(selectedIbAlluoInfo?.balance || 0)) {
      setError('Not enough balance');
    } else {
      setTransferValue(value);
    }
  };

  const handleRecipientAddressChange = e => {
    const { value } = e.target;
    resetState();
    if (!addressIsValid(value)) {
      setError('Recipient address is not valid');
    } else {
      setError('');
    }
    setRecipientAddress(value);
  };

  const setToMax = () => {
    setError('');
    setTransferValue(selectedIbAlluoInfo?.balance || '');
  };

  const handleTransfer = async (useBiconomy) => {
    setError('');
    setIsTransferring(true);

    try {
      const res = await transferToAddress(
        selectedIbAlluoInfo.address,
        transferValue,
        selectedIbAlluoInfo.decimals,
        recipientAddress,
        useBiconomy
      );
      await fetchIbAlluosInfo();
      resetState();
      setTransferValue('');
      setRecipientAddress('');
      setNotificationt('Transfer completed successfully', 'success');
    } catch (err) {
      console.error('Error', err.message);
      resetState();
      setNotificationt(err.message, 'error');
    }

    setIsTransferring(false);
  };

  return {
    notificationId: ENotificationId.TRANSFER,
    error,
    transferValue,
    selectedIbAlluoInfo,
    handleTransferValueChange,
    setToMax,
    isTransferring,
    handleTransfer,
    resetState,
    ibAlluosInfo,
    recipientAddress,
    handleRecipientAddressChange,
    setSelectedIbAlluoBySymbol,
  };
};
