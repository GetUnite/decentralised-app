import { EPolygonAddresses } from 'app/common/constants/addresses';
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
  getBalanceOf
} from 'app/common/functions/web3Client';
import { isSafeApp, walletAccount, wantedChain } from 'app/common/state/atoms';
import {
  TStreamCreationStep,
  TStreamOption,
  TSupportedStreamToken
} from 'app/common/types/autoInvest';
import { TFarm } from 'app/common/types/farm';
import { TSupportedToken } from 'app/common/types/global';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { useNotification } from '../useNotification';

const streamOptions: TStreamOption[] = [
  // from USD options
  {
    // USD Farm to ETH
    fromLabel: 'USD',
    fromSign: '$',
    toLabel: 'ETH',
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    fromAddress: EPolygonAddresses.IBALLUOUSD,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOETH,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOETH,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDETH,
    underlyingTokenAddress: EPolygonAddresses.USDC,
  },
  {
    // USD Farm to BTC
    fromLabel: 'USD',
    fromSign: '$',
    toLabel: 'BTC',
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    fromAddress: EPolygonAddresses.IBALLUOUSD,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOBTC,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOBTC,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDBTC,
    underlyingTokenAddress: EPolygonAddresses.USDC,
  },
  {
    // USDC to ETH
    fromLabel: 'USD',
    fromSign: '$',
    toLabel: 'ETH',
    fromAddress: EPolygonAddresses.USDC,
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOETH,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOETH,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDETH,
    underlyingTokenAddress: EPolygonAddresses.USDC,
  },
  {
    // USDC to BTC
    fromLabel: 'USD',
    fromSign: '$',
    toLabel: 'BTC',
    fromAddress: EPolygonAddresses.USDC,
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOBTC,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOBTC,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDBTC,
    underlyingTokenAddress: EPolygonAddresses.USDC,
  },
  {
    // DAI to ETH
    fromLabel: 'USD',
    fromSign: '$',
    toLabel: 'ETH',
    fromAddress: EPolygonAddresses.DAI,
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOETH,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOETH,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDETH,
    underlyingTokenAddress: EPolygonAddresses.USDC,
  },
  {
    // DAI to BTC
    fromLabel: 'USD',
    fromSign: '$',
    toLabel: 'BTC',
    fromAddress: EPolygonAddresses.DAI,
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOBTC,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOBTC,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDBTC,
    underlyingTokenAddress: EPolygonAddresses.USDC,
  },
  {
    // USDT to ETH
    fromLabel: 'USD',
    fromSign: '$',
    toLabel: 'ETH',
    fromAddress: EPolygonAddresses.USDT,
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOETH,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOETH,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDETH,
    underlyingTokenAddress: EPolygonAddresses.USDC,
  },
  {
    // USDT to BTC
    fromLabel: 'USD',
    fromSign: '$',
    toLabel: 'BTC',
    fromAddress: EPolygonAddresses.USDT,
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOBTC,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOBTC,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDBTC,
    underlyingTokenAddress: EPolygonAddresses.USDC,
  },
  // from BTC options
  {
    // BTC Farm to USD
    fromLabel: 'BTC',
    fromSign: '₿',
    toLabel: 'USD',
    fromAddress: EPolygonAddresses.IBALLUOBTC,
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOBTC,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOBTC,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDBTC,
    underlyingTokenAddress: EPolygonAddresses.WBTC,
  },
  {
    // WBTC to USD
    fromLabel: 'BTC',
    fromSign: '₿',
    toLabel: 'USD',
    fromAddress: EPolygonAddresses.WBTC,
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOBTC,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOBTC,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDBTC,
    underlyingTokenAddress: EPolygonAddresses.WBTC,
  },
  // from ETH options
  {
    // ETH Farm to USD
    fromLabel: 'ETH',
    fromSign: 'Ξ',
    toLabel: 'USD',
    fromAddress: EPolygonAddresses.IBALLUOETH,
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOETH,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOETH,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDETH,
    underlyingTokenAddress: EPolygonAddresses.WETH,
  },
  {
    // WETH to USD
    fromLabel: 'ETH',
    fromSign: 'Ξ',
    toLabel: 'USD',
    fromAddress: EPolygonAddresses.WETH,
    fromStIbAlluoAddress: EPolygonAddresses.STIBALLUOETH,
    fromIbAlluoAddress: EPolygonAddresses.IBALLUOETH,
    toIbAlluoAddress: EPolygonAddresses.IBALLUOUSD,
    toStIbAlluoAddress: EPolygonAddresses.STIBALLUOUSD,
    ricochetMarketAddress: EPolygonAddresses.TWOWAYMARKETIBALLUOUSDETH,
    underlyingTokenAddress: EPolygonAddresses.WETH,
  },
];

const streamFromOptions: TSupportedStreamToken[] = [
  {
    label: 'Your USD farm',
    address: EPolygonAddresses.IBALLUOUSD,
    decimals: 18,
    sign: '$',
    isStreamable: true,
    canStreamTo: [
      {
        label: 'BTC',
        address: EPolygonAddresses.IBALLUOBTC,
        sign: '₿',
      },
      {
        label: 'ETH',
        address: EPolygonAddresses.IBALLUOETH,
        sign: 'Ξ',
      },
    ],
  },
  {
    label: 'USDC',
    address: EPolygonAddresses.USDC,
    decimals: 6,
    sign: '$',
    canStreamTo: [
      {
        label: 'BTC',
        address: EPolygonAddresses.IBALLUOBTC,
        sign: '₿',
      },
      {
        label: 'ETH',
        address: EPolygonAddresses.IBALLUOETH,
        sign: 'Ξ',
      },
    ],
  },
  {
    label: 'DAI',
    address: EPolygonAddresses.DAI,
    decimals: 18,
    sign: '$',
    canStreamTo: [
      {
        label: 'BTC',
        address: EPolygonAddresses.IBALLUOBTC,
        sign: '₿',
      },
      {
        label: 'ETH',
        address: EPolygonAddresses.IBALLUOETH,
        sign: 'Ξ',
      },
    ],
  },
  {
    label: 'USDT',
    address: EPolygonAddresses.USDT,
    decimals: 6,
    sign: '$',
    canStreamTo: [
      {
        label: 'BTC',
        address: EPolygonAddresses.IBALLUOBTC,
        sign: '₿',
      },
      {
        label: 'ETH',
        address: EPolygonAddresses.IBALLUOETH,
        sign: 'Ξ',
      },
    ],
  },
  {
    label: 'Your ETH farm',
    address: EPolygonAddresses.IBALLUOETH,
    decimals: 18,
    sign: 'Ξ',
    isStreamable: true,
    canStreamTo: [
      {
        label: 'USD',
        address: EPolygonAddresses.IBALLUOUSD,
        sign: '$',
      },
    ],
  },
  {
    label: 'WETH',
    address: EPolygonAddresses.WETH,
    decimals: 18,
    sign: 'Ξ',
    canStreamTo: [
      {
        label: 'USD',
        address: EPolygonAddresses.IBALLUOUSD,
        sign: '$',
      },
    ],
  },
  {
    label: 'Your BTC farm',
    address: EPolygonAddresses.IBALLUOBTC,
    decimals: 18,
    sign: '₿',
    isStreamable: true,
    canStreamTo: [
      {
        label: 'USD',
        address: EPolygonAddresses.IBALLUOUSD,
        sign: '$',
      },
    ],
  },
  {
    label: 'WBTC',
    address: EPolygonAddresses.WBTC,
    decimals: 18,
    sign: '₿',
    canStreamTo: [
      {
        label: 'USD',
        address: EPolygonAddresses.IBALLUOUSD,
        sign: '$',
      },
    ],
  },
];

const possibleStreamCreationSteps: TStreamCreationStep[] = [
  { id: 0, label: 'Approve' },
  { id: 1, label: 'Deposit' },
  { id: 2, label: 'Ricochet exchange set-up' },
  { id: 3, label: 'Start stream' },
];

export const useAutoInvestTab = () => {
  // react
  const navigate = useNavigate();

  // atoms
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const [isSafeAppAtom] = useRecoilState(isSafeApp);
  const [, setWantedChainAtom] = useRecoilState(wantedChain);

  // other state control files
  const { setNotificationt } = useNotification();

  // biconomy
  const [useBiconomy, setUseBiconomy] = useState(false); //useState(isSafeAppAtom ? false : true);

  // stream
  const [possibleStreamOptions, setPossibleStreamOptions] = useState<
    TStreamOption[]
  >([]);
  const [selectedStreamCombination, setSelectedStreamCombination] =
    useState<any>();

  // stream from
  const [supportedFromTokens, setSupportedFromTokens] =
    useState<TSupportedStreamToken[]>();
  const [selectedSupportedFromToken, setSelectedSupportedFromToken] =
    useState<TSupportedStreamToken>();

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
  const [selectedStreamCombinationSteps, setSelectedStreamCombinationSteps] =
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
  const [
    isUpdatingSelectedStreamCombination,
    setIsUpdatingSelectedStreamCombination,
  ] = useState<boolean>(false);

  // updates the entire modal
  useEffect(() => {
    if (walletAccountAtom) {
      (async () => {
        // sets the wanted chain as Polygon
        setWantedChainAtom(EChain.POLYGON);

        const possibleStreamOptionsArray: TStreamOption[] = [];

        // logic that saves the possible stream combinations
        for (let i = 0; i < streamOptions.length; i++) {
          const streamOption = streamOptions[i];

          // checks if there is any stream flow to that "to" address
          const streamFlow = await getStreamFlow(
            streamOption.fromStIbAlluoAddress,
            streamOption.ricochetMarketAddress,
          );
          // if there is no value streaming add a combination of every "from" to this "to"
          if (!(+streamFlow.flowPerSecond > 0)) {
            // push the "to" into the possible "to" tokens

            // push the combination into the possible stream combinations array
            possibleStreamOptionsArray.push(streamOption);
          }
        }

        // these are now the possible combinations till the user refreshes or the account changes
        setPossibleStreamOptions(possibleStreamOptionsArray);

        // these are now the possible "from" choises till the user refreshes or the account changes
        const possibleStreamOptionsArrayFromAddresses =
          possibleStreamOptionsArray.map(psoafa => psoafa.fromAddress);
        const possibleStreamOptionsArrayToAddresses =
          possibleStreamOptionsArray.map(psoafa => psoafa.toIbAlluoAddress);
        const supportedFromTokensArray: TSupportedStreamToken[] =
          await Promise.all(
            streamFromOptions
              .filter(streamFromOption =>
                possibleStreamOptionsArrayFromAddresses.find(
                  psoafa => psoafa == streamFromOption.address,
                ),
              )
              .map(async streamFromOption => {
                return {
                  ...streamFromOption,
                  balance: streamFromOption.isStreamable
                    ? await getBalance(
                        streamFromOption.address,
                        streamFromOption.decimals,
                      )
                    : await getBalanceOf(
                        streamFromOption.address,
                        streamFromOption.decimals,
                      ),
                  canStreamTo: streamFromOption.canStreamTo.filter(cst =>
                    possibleStreamOptionsArrayToAddresses.find(
                      psoata => psoata == cst.address,
                    ),
                  ),
                };
              }),
          );

        setSupportedFromTokens(supportedFromTokensArray);
        // set the first from the possible "from" tokens as the selected
        const selectedFrom = supportedFromTokensArray[0];
        setSelectedSupportedFromToken(selectedFrom);

        // sets the "to" tokens as the ones that can be streamed to from the first possible "from"
        setSupportedToTokens(selectedFrom.canStreamTo);
        // sets the selected "to" token as the first from the possible "to"
        const selectedTo = selectedFrom.canStreamTo[0];
        setSelectedSupportedToToken(selectedTo);

        //update the farm info aswell
        const targetFarmInfo = await fetchFarmInfo(selectedTo);
        setTargetFarmInfo(targetFarmInfo);

        setIsUpdating(false);
      })();
    }
  }, [walletAccountAtom]);

  // updates the selectes stream option when either the "from" or "to" tokens change
  useEffect(() => {
    if (
      walletAccountAtom &&
      selectedSupportedFromToken &&
      selectedSupportedToToken
    ) {
      const updateSelectedStreamCombination = async () => {
        setIsUpdatingSelectedStreamCombination(true);

        const newSelectedStreamCombination = possibleStreamOptions.find(
          pstc =>
            pstc.fromAddress == selectedSupportedFromToken.address &&
            pstc.toIbAlluoAddress == selectedSupportedToToken.address,
        );
        if (newSelectedStreamCombination) {
          setSelectedStreamCombination(newSelectedStreamCombination);

          let neededSteps: TStreamCreationStep[] = [];
          // First step is always approve when there is a need for deposit
          if (!selectedSupportedFromToken.isStreamable) {
            const allowance = await getAllowance(
              selectedSupportedFromToken.address,
              newSelectedStreamCombination.toIbAlluoAddress,
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
          const subscriptionOperations =
            await getUnapprovedSuperfluidSubscriptions(
              newSelectedStreamCombination.fromIbAlluoAddress,
              newSelectedStreamCombination.fromStIbAlluoAddress,
              newSelectedStreamCombination.toStIbAlluoAddress,
              newSelectedStreamCombination.ricochetMarketAddress,
            );
          if (subscriptionOperations.length > 0) {
            setUnapprovedSuperfluidSubscriptions(subscriptionOperations);
            neededSteps.push(possibleStreamCreationSteps[2]);
          }
          // start stream finishs the steps
          neededSteps.push(possibleStreamCreationSteps[3]);

          setSelectedStreamCombinationSteps(neededSteps);
        }
        setIsUpdatingSelectedStreamCombination(false);
      };
      // Check the stream value against the new "from" token
      if (+streamValue > 0) {
        validateInputs(streamValue);
      }
      // Only update if we didn't take the first step yet, after that info is updated on a need basis
      if (!(currentStep > 0)) {
        updateSelectedStreamCombination();
      }
    }
  }, [selectedSupportedFromToken, selectedSupportedToToken]);

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

  // the "from" token was changed
  const selectSupportedFromToken = (
    supportedFromToken: TSupportedStreamToken,
  ) => {
    setSelectedSupportedFromToken(supportedFromToken);
    // updates the list of possible "to" tokens
    setSupportedToTokens(supportedFromToken.canStreamTo);
    // changes the "to" token to the first one on the list
    selectSupportedToToken(supportedFromToken.canStreamTo[0]);
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
        selectedStreamCombination.ibAlluoAddress,
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
      const selectedTo = selectedStreamCombination.to.find(
        sso => sso.ibAlluoAddress == selectedSupportedToToken.address,
      );
      await startStream(
        selectedStreamCombination.ibAlluoAddress,
        selectedStreamCombination.stIbAlluoAddress,
        selectedTo.stIbAlluoAddress,
        selectedTo.ricochetMarketAddress,
        +streamValue,
        endDate ? new Date(endDate).getTime() : null,
        useBiconomy,
      );
      setNotificationt('Stream started successfully', 'success');
      navigate('/autoinvest');
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
        selectedStreamCombinationSteps[currentStep].id,
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
    isUpdatingSelectedStreamCombination,
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
    selectedStreamCombinationSteps,
    handleCurrentStep,
  };
};
