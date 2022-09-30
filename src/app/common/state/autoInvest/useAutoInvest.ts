import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  getAllowance,
  getDepositedAmount,
  getInterest,
  getTotalAssetSupply,
} from 'app/common/functions/autoInvest';
import { isSafeApp, walletAccount, wantedChain } from 'app/common/state/atoms';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../useNotification';
import { TSupportedToken } from 'app/common/types/form';
import { isNumeric } from 'app/common/functions/utils';
import { EChain } from 'app/common/constants/chains';
import { EPolygonAddresses } from 'app/common/constants/addresses';
import { TFarm } from 'app/common/types/farm';
import {
  getSupportedTokensAdvancedInfo,
  getSupportedTokensBasicInfo,
} from 'app/common/functions/web3Client';

export type TStreamInfo = {
  from: TSupportedToken;
  to: TFarm;
  allowance: string;
};

const streamFromOptions: TSupportedToken[] = [
  { address: EPolygonAddresses.USDC, sign: '$' },
  { address: EPolygonAddresses.USDT, sign: '$' },
  { address: EPolygonAddresses.DAI, sign: '$' },
];

const streamToOptions: TSupportedToken[] = [
  { address: EPolygonAddresses.IBALLUOETH, label: 'ETH', sign: 'Ξ' },
];

export const useAutoInvest = () => {
  // Atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // other state control files
  const { setNotificationt } = useNotification();

  // biconomy
  const [useBiconomy, setUseBiconomy] = useState(isSafeAppAtom ? false : true);

  // stream from
  const [supportedFromTokens, setSupportedFromTokens] =
    useState<TSupportedToken[]>();
  const [selectedSupportedFromToken, setSelectedSupportedFromToken] =
    useState<TSupportedToken>();

  // stream to
  const [selectedSupportedToToken, setSelectedSupportedToToken] =
    useState<TSupportedToken>(streamToOptions[0]);
  const [targetFarmInfo, setTargetFarmInfo] = useState<TFarm>();

  // inputs
  const [streamValue, setStreamValue] = useState<string>();
  const [streamValueError, setStreamValueError] = useState<string>('');
  const [useEndDate, setUseEndDate] = useState<boolean>(false);
  const [endDate, setEndDate] = useState<string>();
  const [endDateError, setEndDateError] = useState<string>();

  // loading control
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStartingStream, setIsStartingStream] = useState<boolean>(false);

  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.POLYGON);
      updateAutoInvestInfo();
    }
  }, [walletAccountAtom]);

  const handleStreamValueChange = value => {
    setStreamValueError('');
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setStreamValueError('Write a valid number');
    } else if (+value > +selectedSupportedFromToken?.balance) {
      setStreamValueError('Not enough balance');
    }
    setStreamValue(value);
  };

  const fetchFarmInfo = async () => {
    let farmInfo;
    farmInfo = {
      interest: await getInterest(selectedSupportedToToken.address),
      totalAssetSupply: await getTotalAssetSupply(
        selectedSupportedToToken.address,
      ),
      sign: selectedSupportedToToken.sign,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmount = await getDepositedAmount(
        selectedSupportedToToken.address,
      );
    }

    return farmInfo;
  };

  const updateAutoInvestInfo = async () => {
    setIsLoading(true);

    if (walletAccountAtom) {
      const supportedTokens = await Promise.all(
        streamFromOptions.map(async supportedToken => {
          const basicSupportedTokenInfo = await getSupportedTokensBasicInfo(
            supportedToken.address,
            EChain.POLYGON,
          );
          const advancedSupportedTokenInfo =
            await getSupportedTokensAdvancedInfo(
              selectedSupportedToToken.address,
              basicSupportedTokenInfo,
              EChain.POLYGON,
            );
          return {
            label: basicSupportedTokenInfo.symbol,
            address: basicSupportedTokenInfo.tokenAddress,
            balance: advancedSupportedTokenInfo.balance,
            allowance: advancedSupportedTokenInfo.allowance,
            decimals: basicSupportedTokenInfo.decimals,
            sign: supportedToken.sign,
          };
        }),
      );
      setSupportedFromTokens(supportedTokens);
      setSelectedSupportedFromToken(supportedTokens[0]);
      setTargetFarmInfo(await fetchFarmInfo());
    }

    setIsLoading(false);
  };

  const selectSupportedFromToken = supportedFromToken => {
    setSelectedSupportedFromToken(supportedFromToken);
  };

  const selectSupportedToToken = async supportedToToken => {
    setSelectedSupportedToToken(supportedToToken);
    setSelectedSupportedFromToken({
      ...selectedSupportedFromToken,
      allowance: await getAllowance(
        selectedSupportedFromToken.address,
        supportedToToken.address,
      ),
    });
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
    hasErrors: streamValueError != '' || endDateError != '',
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
    selectSupportedToToken,
    targetFarmInfo,
    setUseBiconomy,
    useBiconomy,
    useEndDate,
    setUseEndDate,
    endDate,
    endDateError,
    setEndDate
  };
};
