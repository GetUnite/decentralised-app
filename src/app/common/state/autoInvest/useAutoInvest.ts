import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  getInterest,
  getTotalAssetSupply,
  getUserDepositedAmount,
  getSupportedTokensBasicInfo,
  getSupportedTokensAdvancedInfo,
  getBoosterFarmRewards,
  getUserDepositedLPAmount,
  getTotalAssets,
  getSupportedTokensList,
  claimBoosterFarmNonLPRewards,
  claimBoosterFarmLPRewards,
  getBoosterFarmInterest,
} from 'app/common/functions/web3Client';
import { walletAccount, wantedChain } from 'app/common/state/atoms';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../useNotification';
import { TSupportedToken } from 'app/common/types/form';
import { isNumeric } from 'app/common/functions/utils';
import { EChain } from 'app/common/constants/chains';
import { EPolygonAddresses } from 'app/common/constants/addresses';

const streamFromOptions: string[] = [
  EPolygonAddresses.USDC,
  EPolygonAddresses.USDT,
  EPolygonAddresses.DAI,
];

const streamToOptions: TSupportedToken[] = [
  { address: EPolygonAddresses.IBALLUOETH, label: 'ETH' },
];

export const useAutoInvest = () => {
  const { setNotificationt } = useNotification();
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  const [supportedFromTokens, setSupportedFromTokens] =
    useState<TSupportedToken[]>();
  const [selectedSupportedFromToken, setSelectedSupportedFromToken] =
    useState<TSupportedToken>();

  const [selectedSupportedToToken, setSelectedSupportedToToken] =
    useState<TSupportedToken>(streamToOptions[0]);

  const [streamValue, setStreamValue] = useState<string>();
  const [streamValueError, setStreamValueError] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStartingStream, setIsStartingStream] = useState<boolean>(false);

  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.POLYGON);
      updateAutoInvestInfo();
    }
  }, [walletAccountAtom]);

  const handleStreamValueChange = value => {
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setStreamValueError('Write a valid number');
    } else if (+value > +selectedSupportedFromToken?.balance) {
      setStreamValueError('Not enough balance');
    }
    setStreamValue(value);
  };

  const updateAutoInvestInfo = async () => {
    if (walletAccountAtom) {
      const supportedTokens = await Promise.all(
        streamFromOptions.map(async supportedToken => {
          const basicSupportedTokenInfo =
            await getSupportedTokensBasicInfo(
              supportedToken,
              EChain.POLYGON,
            );
          const advancedSupportedTokenInfo =
            await getSupportedTokensAdvancedInfo(
              EPolygonAddresses.IBALLUOUSD,
              basicSupportedTokenInfo,
              EChain.POLYGON,
            );
          return {
            label: basicSupportedTokenInfo.symbol,
            address: basicSupportedTokenInfo.tokenAddress,
            balance: advancedSupportedTokenInfo.balance,
            allowance: advancedSupportedTokenInfo.allowance,
            decimals: basicSupportedTokenInfo.decimals,
          };
        }),
      );
      setSupportedFromTokens(supportedTokens);
      setSelectedSupportedFromToken(supportedTokens[0]);
    }
  };

  const selectSupportedFromToken = supportedFromToken => {
    setSelectedSupportedFromToken(supportedFromToken);
  };

  const selectSupportedToToken = supportedToToken => {
    setSelectedSupportedToToken(supportedToToken);
  };

  const handleStartStream = async () => {
    setIsStartingStream(true);

    try {
      /*await depositStableCoin(
          selectedSupportedToken.address,
          depositValue,
          selectedSupportedToken.decimals,
          selectedFarm.type,
          selectedFarm.chain,
          useBiconomy,
        );*/
      setStreamValue(null);
      setNotificationt('Stream started successfully', 'success');
    } catch (error) {
      setNotificationt(error, 'error');
    }

    setIsStartingStream(false);
  };

  return {
    selectedSupportedFromToken,
    hasErrors: streamValueError != '',
    streamValueError,
    streamValue,
    handleStreamValueChange,
    isLoading,
    selectSupportedFromToken,
    supportedFromTokens,
    handleStartStream,
    isStartingStream,
    supportedToTokens: streamToOptions,
    selectedSupportedToToken,
    selectSupportedToToken
  };
};
