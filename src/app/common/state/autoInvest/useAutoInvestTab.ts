import { EChain } from 'app/common/constants/chains';
import {
  approveSuperfluidSubscriptions,
  depositIntoAlluo,
  getDepositedAmount,
  getInterest,
  getStreamFlow,
  getTotalAssetSupply,
  getUnapprovedSuperfluidSubscriptions,
  startStream
} from 'app/common/functions/autoInvest';
import { isNumeric } from 'app/common/functions/utils';
import {
  approve,
  getAllowance,
  getBalance,
  getBalanceOf,
  getSupportedTokensBasicInfo
} from 'app/common/functions/web3Client';
import { isSafeApp, walletAccount, wantedChain } from 'app/common/state/atoms';
import { TStreamCreationStep } from 'app/common/types/autoInvest';
import { TFarm } from 'app/common/types/farm';
import { TAllowance, TSupportedToken } from 'app/common/types/form';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { useNotification } from '../useNotification';
import { streamOptions, streamToOptions } from './useAutoInvest';

const possibleStreamCreationSteps: TStreamCreationStep[] = [
  { id: 0, label: 'Approve' },
  { id: 1, label: 'Deposit' },
  { id: 2, label: 'Ricochet exchange set-up' },
  { id: 3, label: 'Start stream' },
];

export const useAutoInvestTab = () => {
  // Atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // other state control files
  const { setNotificationt } = useNotification();

  // biconomy
  const [useBiconomy, setUseBiconomy] = useState(false); //useState(isSafeAppAtom ? false : true);

  // keep allowance separated since it changes everytime etiher the "from" or "to" changes
  const [allowance, setAllowance] = useState<string>();

  // stream
  const [selectedStreamOption, setSelectedStreamOption] = useState<any>();

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
  const [endDateError, setEndDateError] = useState<string>('');

  // stream creation steps
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedStreamOptionSteps, setSelectedStreamOptionSteps] =
    useState<TStreamCreationStep[]>();
  const [
    unapprovedSuperfluidSubscriptions,
    setUnapprovedSuperfluidSubscriptions,
  ] = useState<any[]>([]);

  // loading control
  const [isUpdating, setIsUpdating] = useState<boolean>(true);
  const [isStartingStream, setIsStartingStream] = useState<boolean>(false);
  const [isFetchingFarmInfo, setIsFetchingFarmInfo] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [isUpdatingSelectedStreamOption, setIsUpdatingSelectedStreamOption] =
    useState<boolean>(false);

  // speed improvements (cache data, lazy loading, etc)
  const [allowances, setAllowances] = useState<TAllowance[]>([]);

  // updates the entire modal
  useEffect(() => {
    if (walletAccountAtom) {
      setWantedChainAtom(EChain.POLYGON);
      updateAutoInvestInfo();
    }
  }, [walletAccountAtom]);

  // updates the list of supported "to" tokens when the "from" token is updated
  useEffect(() => {
    if (walletAccountAtom && selectedSupportedFromToken) {
      updateSupportedToTokens(selectedSupportedFromToken);
    }
  }, [selectedSupportedFromToken]);

  // resets the current step when one stream creation is finished
  useEffect(() => {
    if (walletAccountAtom && selectedStreamOption) {
      if (currentStep > selectedStreamOptionSteps.length - 1) {
        setCurrentStep(1);
      }
    }
  }, [currentStep]);

  // updates the selectes stream option when either the "from" or "to" tokens change
  useEffect(() => {
    if (
      walletAccountAtom &&
      selectedSupportedFromToken &&
      selectedSupportedToToken
    ) {
      setIsUpdatingSelectedStreamOption(true);

      const updateSelectedStreamOption = async () => {
        const newSelectedStreamOption = streamOptions.find(
          streamOption =>
            streamOption.from
              .map(so => so.address)
              .includes(selectedSupportedFromToken.address) &&
            streamOption.to
              .map(so => so.ibAlluoAddress)
              .includes(selectedSupportedToToken.address),
        );
        if (newSelectedStreamOption) {
          setSelectedStreamOption(newSelectedStreamOption);

          let neededSteps: TStreamCreationStep[] = [];
          // First step is always approve when there is a need for deposit
          if (!selectedSupportedFromToken.isStreamable) {
            const allowance = await getAllowance(
              selectedSupportedFromToken.address,
              newSelectedStreamOption.ibAlluoAddress,
            );
            if (!(+allowance > 0)) {
              neededSteps.push(possibleStreamCreationSteps[0]);
            }
          }
          // Deposit step if its not one of the iballuo
          if (!selectedSupportedFromToken.isStreamable) {
            neededSteps.push(possibleStreamCreationSteps[1]);
          }
          // subscriptions to superfluid contracts
          const selectedTo = newSelectedStreamOption.to.find(
            sso => sso.ibAlluoAddress == selectedSupportedToToken.address,
          );
          const subscriptionOperations =
            await getUnapprovedSuperfluidSubscriptions(
              newSelectedStreamOption.ibAlluoAddress,
              newSelectedStreamOption.stIbAlluoAddress,
              selectedTo.stIbAlluoAddress,
              selectedTo.ricochetMarketAddress,
            );
          if (subscriptionOperations.length > 0) {
            setUnapprovedSuperfluidSubscriptions(subscriptionOperations);
            neededSteps.push(possibleStreamCreationSteps[2]);
          }
          // start stream finishs the steps
          neededSteps.push(possibleStreamCreationSteps[3]);

          setSelectedStreamOptionSteps(neededSteps);
        }
        setIsUpdating(false);
      };
      // Check the stream value against the new "from" token
      if (+streamValue > 0) {
        validateInputs(streamValue);
      }
      // Only update if we didn't take the first step yet, after that info is updated on a need basis
      if (!(currentStep > 0)) {
        updateSelectedStreamOption();
      }

      setIsUpdatingSelectedStreamOption(false);
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

    // if there is a option stream from the new "from" to the already selected "to" only update the allowance
    if (toAddresses.includes(selectedSupportedToToken?.address)) {
      return;
    }

    const toSupportedtokens = streamToOptions.filter(supportedToken =>
      toAddresses.includes(supportedToken.address),
    );

    setSupportedToTokens(toSupportedtokens);

    // select the first of to tokens
    setSelectedSupportedToToken(toSupportedtokens[0]);

    setIsFetchingFarmInfo(true);
    setTargetFarmInfo(await fetchFarmInfo(toSupportedtokens[0]));
    setIsFetchingFarmInfo(false);
  };

  // updates allowance between the "from" and the underlying iballuo token
  const updateAllowance = async (force = false) => {
    // if force is false search if the allowance for this combination of "from" and the underlying iballuo token was already loaded
    if (!force) {
      const foundAllowance = allowances.find(
        allowance =>
          allowance.fromTokenAddress == selectedSupportedFromToken.address &&
          allowance.toTokenAddress == selectedStreamOption.ibAlluoAddress,
      );
      if (foundAllowance) {
        return foundAllowance.allowance;
      }
    }

    // allowance wasn't found or needs to be updated
    const allowance = await getAllowance(
      selectedSupportedFromToken.address,
      selectedStreamOption.ibAlluoAddress,
    );
    // saves allowance for future searchs
    setAllowances([
      ...allowances,
      {
        fromTokenAddress: selectedSupportedFromToken.address,
        toTokenAddress: selectedStreamOption.ibAlluoAddress,
        allowance: allowance,
      },
    ]);
    setAllowance(allowance);
  };

  const validateInputs = value => {
    setStreamValueError('');
    if (!(isNumeric(value) || value === '' || value === '.')) {
      setStreamValueError('Write a valid number');
    } else if (+value > +selectedSupportedFromToken?.balance) {
      setStreamValueError('Insufficient balance');
    }
    setStreamValue(value);
  };

  // updates target farm info
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

  // updates info about needed for the auto invest tab
  const updateAutoInvestInfo = async () => {
    setIsUpdating(true);

    if (walletAccountAtom) {
      let supportedFromTokensArray = [];

      for (const streamOption of streamOptions) {
        var alreadyStreaming = false;
        for (const supportedToken of streamOption.to) {
          const streamFlow = await getStreamFlow(
            streamOption.stIbAlluoAddress,
            supportedToken.ricochetMarketAddress,
          );
          if (streamFlow.flowPerSecond > 0) {
            alreadyStreaming = true;
          }
        }
        if (alreadyStreaming) {
          continue;
        }
        for (const supportedToken of streamOption.from) {
          const basicSupportedTokenInfo = await getSupportedTokensBasicInfo(
            supportedToken.address,
            EChain.POLYGON,
          );
          supportedFromTokensArray.push({
            label: supportedToken.label,
            address: basicSupportedTokenInfo.tokenAddress,
            balance: supportedToken.isStreamable
              ? await getBalance(
                  basicSupportedTokenInfo.tokenAddress,
                  basicSupportedTokenInfo.decimals,
                )
              : await getBalanceOf(
                  basicSupportedTokenInfo.tokenAddress,
                  basicSupportedTokenInfo.decimals,
                ),
            decimals: basicSupportedTokenInfo.decimals,
            sign: supportedToken.sign,
            isStreamable: supportedToken.isStreamable,
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
  };

  // the "from" token was changed
  const selectSupportedFromToken = supportedFromToken => {
    setSelectedSupportedFromToken(supportedFromToken);
  };

  // the "to" token was changed
  const selectSupportedToToken = async supportedToToken => {
    setSelectedSupportedToToken(supportedToToken);
    setIsFetchingFarmInfo(true);
    setTargetFarmInfo(await fetchFarmInfo(supportedToToken));
    setIsFetchingFarmInfo(false);
  };

  // approve deposit from the "from" token into the underlying iballuo token
  const handleApprove = async () => {
    setIsApproving(true);

    try {
      // TODO: currently biconomy doesn't work here
      await approve(
        selectedSupportedFromToken.address,
        selectedSupportedToToken.address,
        EChain.POLYGON,
        //useBiconomy,
      );
      // Next step
      setCurrentStep(currentStep + 1);
      setNotificationt('Approved successfully', 'success');
    } catch (err) {
      setNotificationt(err, 'error');
    }

    setIsApproving(false);
  };

  // approve superfluid subscriptions that allow the creation of streams
  const handleSuperfluidStreamApprove = async () => {
    setIsApproving(true);

    try {
      // TODO: currently biconomy doesn't work here
      await approveSuperfluidSubscriptions(
        unapprovedSuperfluidSubscriptions,
        useBiconomy,
      );
      // Next step
      setCurrentStep(currentStep + 1);
      setNotificationt('Approved successfully', 'success');
    } catch (err) {
      setNotificationt(err, 'error');
    }

    setIsApproving(false);
  };

  // deposit form the "from" token into the underlying iballuo token
  const handleDeposit = async () => {
    setIsDepositing(true);

    try {
      const tx = await depositIntoAlluo(
        selectedSupportedFromToken.address,
        selectedStreamOption.ibAlluoAddress,
        streamValue,
        useBiconomy,
      );
      // Next step
      setCurrentStep(currentStep + 1);
      // update "from" token balance
      const balance = await getBalanceOf(
        selectedSupportedFromToken.address,
        selectedSupportedFromToken.decimals,
      );
      setSelectedSupportedFromToken({
        ...selectedSupportedFromToken,
        balance: balance,
      });
      setNotificationt('Deposit successfully', 'success');
    } catch (err) {
      setNotificationt(err, 'error');
    }

    setIsDepositing(false);
  };

  // start stream functions
  const handleStartStream = async () => {
    setIsStartingStream(true);

    try {
      // data from the selected output
      const selectedTo = selectedStreamOption.to.find(
        sso => sso.ibAlluoAddress == selectedSupportedToToken.address,
      );
      await startStream(
        selectedStreamOption.ibAlluoAddress,
        selectedStreamOption.stIbAlluoAddress,
        selectedTo.stIbAlluoAddress,
        selectedTo.ricochetMarketAddress,
        +streamValue,
        endDate ? new Date(endDate).getTime() : null,
        useBiconomy,
      );
      // Next step
      setCurrentStep(currentStep + 1);
      setNotificationt('Stream started successfully', 'success');
    } catch (error) {
      setNotificationt(error, 'error');
    }

    setIsStartingStream(false);
  };

  // executes the handle for the current step
  const handleCurrentStep = async () => {
    const currentStreamCreationStep = possibleStreamCreationSteps.find(
      possibleStreamCreationStep =>
        possibleStreamCreationStep.id ==
        selectedStreamOptionSteps[currentStep].id,
    );

    switch (currentStreamCreationStep.id) {
      case 0:
        await handleApprove();
        break;

      case 1:
        await handleDeposit();
        break;

      case 2:
        await handleSuperfluidStreamApprove();
        break;

      case 3:
        await handleStartStream();
        break;
      default:
        break;
    }
  };

  return {
    // loading control
    isLoading: isUpdating || isStartingStream || isApproving || isDepositing,
    isFetchingFarmInfo,
    isUpdatingSelectedStreamOption,
    // error control
    hasErrors: streamValueError != '' || endDateError != '',
    // inputs
    disableInputs: currentStep > 0,
    streamValue,
    validateInputs,
    selectedSupportedFromToken,
    streamValueError,
    selectSupportedFromToken,
    supportedFromTokens,
    supportedToTokens,
    selectedSupportedToToken,
    selectSupportedToToken,
    targetFarmInfo,
    useBiconomy,
    setUseBiconomy,
    useEndDate,
    setUseEndDate,
    endDate,
    setEndDate,
    currentStep,
    selectedStreamOptionSteps,
    handleCurrentStep,
  };
};
