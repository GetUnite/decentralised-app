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
import { heapTrack } from 'app/common/functions/heapClient';
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
  const { setNotification } = useNotification();

  // biconomy
  const [useBiconomy, setUseBiconomy] = useState(false);//useState(isSafeAppAtom ? false : true);

  // stream
  const [possibleStreamOptions, setPossibleStreamOptions] = useState<
    TStreamOption[]
  >([]);
  const [selectedStreamOption, setSelectedStreamOption] =
    useState<TStreamOption>();

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

  // updates the entire modal
  useEffect(() => {
    if (walletAccountAtom) {
      heapTrack('clickAutoInvest');
      (async () => {
        // sets the wanted chain as Polygon
        setWantedChainAtom(EChain.POLYGON);

        const ricochetMarketAddressesWithStreams = [];

        // logic that saves the possible stream combinations
        for (let i = 0; i < streamOptions.length; i++) {
          const streamOption = streamOptions[i];

          // checks if there is any stream flow to that "to" address
          const streamFlow = await getStreamFlow(
            streamOption.fromStIbAlluoAddress,
            streamOption.ricochetMarketAddress,
          );
          // if there is no value streaming add a combination of every "from" to this "to"
          if (+streamFlow.flowPerSecond > 0) {
            // save the ricochet market addresses that already have a stream running
            ricochetMarketAddressesWithStreams.push(streamOption.ricochetMarketAddress);
          }
        }

        // the possible streams are all the options that don't have already one stream running
        const possibleStreamOptionsArray = streamOptions.filter(streamOption => !ricochetMarketAddressesWithStreams.find(rmaws => rmaws == streamOption.ricochetMarketAddress));

        // If there aren't any possible stream options, redirect to auto invest
        if(possibleStreamOptionsArray.length == 0){
          navigate('/autoinvest');
          setNotification('No available stream options', 'info');
          return;
        }

        // these are now the possible combinations till the user refreshes or the account changes
        setPossibleStreamOptions(possibleStreamOptionsArray);

        // these are now the possible "from" choises till the user refreshes or the account changes
        const possibleStreamOptionsArrayAddresses =
          possibleStreamOptionsArray.map(psoafa => {
            return {
              fromAddress: psoafa.fromAddress,
              toAddress: psoafa.toIbAlluoAddress,
            };
          });
        const supportedFromTokensArray: TSupportedStreamToken[] =
          await Promise.all(
            streamFromOptions
              .filter(streamFromOption =>
                possibleStreamOptionsArrayAddresses.find(
                  psoafa => psoafa.fromAddress == streamFromOption.address,
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
                    possibleStreamOptionsArrayAddresses.find(
                      psoata => psoata.toAddress == cst.address,
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
        setIsUpdatingSelectedStreamOption(true);

        const newSelectedStreamOption = possibleStreamOptions.find(
          pstc =>
            pstc.fromAddress == selectedSupportedFromToken.address &&
            pstc.toIbAlluoAddress == selectedSupportedToToken.address,
        );
        if (newSelectedStreamOption) {
          setSelectedStreamOption(newSelectedStreamOption);

          let neededSteps: TStreamCreationStep[] = [];
          // First step is always approve when there is a need for deposit
          if (!selectedSupportedFromToken.isStreamable) {
            const allowance = await getAllowance(
              selectedSupportedFromToken.address,
              newSelectedStreamOption.fromIbAlluoAddress,
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
              newSelectedStreamOption.fromIbAlluoAddress,
              newSelectedStreamOption.fromStIbAlluoAddress,
              newSelectedStreamOption.toStIbAlluoAddress,
              newSelectedStreamOption.ricochetMarketAddress,
            );
          if (subscriptionOperations.length > 0) {
            setUnapprovedSuperfluidSubscriptions(subscriptionOperations);
            neededSteps.push(possibleStreamCreationSteps[2]);
          }
          // start stream finishs the steps
          neededSteps.push(possibleStreamCreationSteps[3]);

          setSelectedStreamOptionSteps(neededSteps);
        }
        setIsUpdatingSelectedStreamOption(false);
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

  useEffect(() => {
    validateInputs(streamValue);
  }, [endDate]);

  const validateInputs = value => {
    if (!(currentStep > 0)) {
      setStreamValueError('');
      setEndDateError('');
      if (value) {
        if (!(isNumeric(value) || value === '' || value === '.')) {
          setStreamValueError('Write a valid number');
        } else if (+value > +selectedSupportedFromToken?.balance) {
          setStreamValueError('Insufficient balance');
        }
        setStreamValue(value);
      }
      if (useEndDate) {
        if (new Date().getTime() > new Date(endDate).getTime()) {
          setEndDateError(`The end date of the stream can't be in the past`);
        }
      }
    }
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
    heapTrack('autoInvestTokenSelected', {token: supportedFromToken.label})
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
      const tx = await approve(
        selectedSupportedFromToken.address,
        selectedStreamOption.fromIbAlluoAddress,
        EChain.POLYGON,
        //useBiconomy,
      );
      // Next step
      setCurrentStep(currentStep + 1);
      setNotification('Approved successfully', 'success', tx.transactionHash, EChain.POLYGON);
    } catch (err) {
      setNotification(err, 'error');
    }

    setIsApproving(false);
  };

  // approve superfluid subscriptions that allow the creation of streams
  const handleSuperfluidStreamApprove = async () => {
    setIsApproving(true);

    try {
      heapTrack('approvedTransactionMined',  {currency: selectedStreamOption.fromIbAlluoAddress, amount: streamValue})
      // TODO: currently biconomy doesn't work here
      const tx = await approveSuperfluidSubscriptions(
        unapprovedSuperfluidSubscriptions,
        useBiconomy,
      );
      // Next step
      setCurrentStep(currentStep + 1);
      setNotification('Approved successfully', 'success', tx.transactionHash, EChain.POLYGON);
    } catch (err) {
      setNotification(err, 'error');
    }

    setIsApproving(false);
  };

  // deposit form the "from" token into the underlying iballuo token
  const handleDeposit = async () => {
    setIsDepositing(true);

    try {
      heapTrack('startedAutoinvestDeposit', { token: selectedSupportedFromToken.label, amount: streamValue });
      const tx = await depositIntoAlluo(
        selectedSupportedFromToken.address,
        selectedStreamOption.fromIbAlluoAddress,
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
      heapTrack('depositTransactionMined', { currency: selectedSupportedFromToken.label, amount: streamValue });
      setNotification('Deposit successful', 'success', tx.transactionHash, EChain.POLYGON);
    } catch (err) {
      setNotification(err, 'error');
    }

    setIsDepositing(false);
  };

  // start stream functions
  const handleStartStream = async () => {
    setIsStartingStream(true);

    try {
      const timeToStreamInSeconds = Math.floor(
        (new Date(endDate).getTime() - new Date().getTime()) / 1000);
      // data from the selected output
      const tx = await startStream(
        selectedStreamOption.fromIbAlluoAddress,
        selectedStreamOption.fromStIbAlluoAddress,
        selectedStreamOption.toStIbAlluoAddress,
        selectedStreamOption.ricochetMarketAddress,
        +streamValue,
        useEndDate ? timeToStreamInSeconds : null,
        useBiconomy,
      );
      setNotification('Stream started successfully', 'success',tx.transactionHash, EChain.POLYGON);
      navigate('/autoinvest');
    } catch (error) {
      setNotification(error, 'error');
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
    isLoading: isUpdating,
    isStartingStream ,
    isApproving ,
    isDepositing,
    isFetchingFarmInfo,
    isUpdatingSelectedStreamOption,
    // error control
    hasErrors: streamValueError != '' || endDateError != '',
    endDateError,
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
