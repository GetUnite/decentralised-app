import { EChain } from 'app/common/constants/chains';
import {
  getDepositedAmount,
  getInterest,
  getTotalAssetSupply,
  startStream
} from 'app/common/functions/autoInvest';
import { isNumeric } from 'app/common/functions/utils';
import {
  approve,
  getAllowance,
  getBalanceOf,
  getSupportedTokensBasicInfo
} from 'app/common/functions/web3Client';
import { isSafeApp, walletAccount, wantedChain } from 'app/common/state/atoms';
import { TFarm } from 'app/common/types/farm';
import { TSupportedToken } from 'app/common/types/global';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useNotification } from '../useNotification';
import { streamOptions, streamToOptions } from './useAutoInvest';

export const useAutoInvestTab = () => {
  // Atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // other state control files
  const { setNotificationt } = useNotification();

  // biconomy
  const [useBiconomy, setUseBiconomy] = useState(isSafeAppAtom ? false : true);

  // keep allowance separated since it changes everytime etiher the "from" or "to" changes
  const [allowance, setAllowance] = useState<string>();

  // stream from
  const [supportedFromTokens, setSupportedFromTokens] =
    useState<TSupportedToken[]>();
  const [selectedSupportedFromToken, setSelectedSupportedFromToken] =
    useState<TSupportedToken>();

  // stream to
  const [supportedToTokens, setSupportedToTokens] =
    useState<TSupportedToken[]>();
  const [selectedSupportedToToken, setSelectedSupportedToToken] =
    useState<TSupportedToken>();
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
  const [isFetchingFarmInfo, setIsFetchingFarmInfo] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.POLYGON);
      updateAutoInvestInfo();
    }
  }, [walletAccountAtom]);

  useEffect(() => {
    if (walletAccountAtom && selectedSupportedFromToken) {
      updateSupportedToTokens(selectedSupportedFromToken);
    }
  }, [selectedSupportedFromToken]);

  useEffect(() => {
    if (
      walletAccountAtom &&
      selectedSupportedFromToken &&
      selectedSupportedToToken
    ) {
      updateAllowance();
    }
  }, [selectedSupportedFromToken, selectedSupportedToToken]);

  const updateSupportedToTokens = async selectedFromToken => {
    // streaming data of the selected from token
    const streamOption = streamOptions.find(streamOption =>
      streamOption.from
        .map(option => option.address)
        .includes(selectedFromToken.address),
    );

    // the addresses to which the from token can stream to
    const toAddresses = streamOption.to.map(so => so.ibAlluoAddress);

    // if there is a stream from the new "from" to the already selected "to" only update the allowance
    if (toAddresses.includes(selectedSupportedToToken?.address)) {
      return;
    }

    const toSupportedtokens = streamToOptions.filter(supportedToken =>
      toAddresses.includes(supportedToken.address),
    );

    setSupportedToTokens(toSupportedtokens);

    // select the first of to tokens
    setSelectedSupportedToToken(toSupportedtokens[0]);

    setTargetFarmInfo(await fetchFarmInfo(toSupportedtokens[0]));
  };

  const updateAllowance = async () => {
    setAllowance(
      await getAllowance(
        selectedSupportedFromToken.address,
        selectedSupportedToToken.address,
      ),
    );
  };

  const handleStreamValueChange = value => {
    setStreamValueError('');
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setStreamValueError('Write a valid number');
    } else if (+value > +selectedSupportedFromToken?.balance) {
      setStreamValueError('Insufficient balance');
    }
    setStreamValue(value);
  };

  const fetchFarmInfo = async selectedToToken => {
    let farmInfo;
    farmInfo = {
      interest: await getInterest(selectedToToken.address),
      totalAssetSupply: await getTotalAssetSupply(selectedToToken.address),
      sign: selectedToToken.sign,
    };
    if (walletAccountAtom) {
      farmInfo.depositedAmount = await getDepositedAmount(
        selectedToToken.address,
      );
    }

    return farmInfo;
  };

  const updateAutoInvestInfo = async () => {
    setIsLoading(true);

    if (walletAccountAtom) {
      let supportedFromTokensArray = [];

      for (const streamOption of streamOptions) {
        for (const supportedToken of streamOption.from) {
          const basicSupportedTokenInfo = await getSupportedTokensBasicInfo(
            supportedToken.address,
            EChain.POLYGON,
          );
          supportedFromTokensArray.push({
            label: supportedToken.label,
            address: basicSupportedTokenInfo.tokenAddress,
            balance: await getBalanceOf(
              basicSupportedTokenInfo.tokenAddress,
              basicSupportedTokenInfo.decimals,
            ),
            decimals: basicSupportedTokenInfo.decimals,
            sign: supportedToken.sign,
          });
        }
      }

      // set the from supported tokens and the first as the default selected
      setSupportedFromTokens(supportedFromTokensArray);
      const selectedSupportedToken = supportedFromTokensArray[0];
      setSelectedSupportedFromToken(selectedSupportedToken);

      // updates supported to tokens
      await updateSupportedToTokens(selectedSupportedToken);
    }

    setIsLoading(false);
  };

  const selectSupportedFromToken = supportedFromToken => {
    setSelectedSupportedFromToken(supportedFromToken);
  };

  const selectSupportedToToken = async supportedToToken => {
    setSelectedSupportedToToken(supportedToToken);
    setIsFetchingFarmInfo(true);
    setTargetFarmInfo(await fetchFarmInfo(supportedToToken));
    setIsFetchingFarmInfo(false);
  };

  const handleApprove = async () => {
    setIsApproving(true);

    try {
      await approve(
        selectedSupportedFromToken.address,
        selectedSupportedToToken.address,
        EChain.POLYGON,
      );
      await updateAllowance();
      setNotificationt('Approved successfully', 'success');
    } catch (err) {
      setNotificationt(err, 'error');
    }

    setIsApproving(false);
  };

  const handleStartStream = async () => {
    setIsStartingStream(true);

    try {
      // the complete selected stream data
      const selectedStreamOption = streamOptions.find(
        streamOption =>
          streamOption.from
            .map(so => so.address)
            .includes(selectedSupportedFromToken.address) &&
          streamOption.to
            .map(so => so.ibAlluoAddress)
            .includes(selectedSupportedToToken.address),
      );
      // data from the selected output
      const selectedTo = selectedStreamOption.to.find(
        sso => sso.ibAlluoAddress == selectedSupportedToToken.address,
      );
      /*await depositIntoAlluo(
        selectedSupportedFromToken.address,
        selectedStreamOption.ibAlluoAddress,
        streamValue,
        useBiconomy,
      );*/
      await startStream(
        selectedStreamOption.ibAlluoAddress,
        selectedStreamOption.stIbAlluoAddress,
        selectedTo.stIbAlluoAddress,
        selectedTo.ricochetMarketAddress,
        +streamValue / 2592000,
        endDate ? new Date(endDate).getTime() : null,
        useBiconomy,
      );
      setStreamValue(undefined);
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
    supportedToTokens,
    selectedSupportedToToken,
    selectSupportedToToken,
    targetFarmInfo,
    setUseBiconomy,
    useBiconomy,
    useEndDate,
    setUseEndDate,
    endDate,
    endDateError,
    setEndDate,
    allowance,
    isApproving,
    handleApprove,
    isFetchingFarmInfo,
  };
};
