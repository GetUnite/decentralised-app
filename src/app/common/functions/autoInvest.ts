import { EChain } from 'app/common/constants/chains';
import {
  binarySearchForBlock,
  callContract,
  getBalanceOf,
  getCurrentWalletAddress,
  getDecimals,
  getReadOnlyProvider,
  getSuperfluidFramework,
  QueryFilter,
  sendTransaction
} from 'app/common/functions/web3Client';
import { ethers } from 'ethers';
import { EPolygonAddresses } from '../constants/addresses';
import { toDecimals } from './utils';

export const getDepositedAmount = async (
  tokenAddress,
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
      name: 'getBalance',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const depositedAmount = await callContract(
    abi,
    tokenAddress,
    'getBalance(address)',
    [getCurrentWalletAddress()],
    chain,
  );

  return ethers.utils.formatEther(depositedAmount);
};

export const getStreamFlow = async (
  superFluidToken,
  ricochetMarketAddress,
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      inputs: [
        {
          internalType: 'contract ISuperfluidToken',
          name: 'token',
          type: 'address',
        },
        { internalType: 'address', name: 'sender', type: 'address' },
        { internalType: 'address', name: 'receiver', type: 'address' },
      ],
      name: 'getFlow',
      outputs: [
        { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        { internalType: 'int96', name: 'flowRate', type: 'int96' },
        { internalType: 'uint256', name: 'deposit', type: 'uint256' },
        { internalType: 'uint256', name: 'owedDeposit', type: 'uint256' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const polygonRicochetStreamsAddress = EPolygonAddresses.RICOCHETSTREAMS;

  const flow = await callContract(
    abi,
    polygonRicochetStreamsAddress,
    'getFlow(address,address,address)',
    [superFluidToken, getCurrentWalletAddress(), ricochetMarketAddress],
    chain,
  );

  const flowPerSecond = ethers.utils.formatUnits(flow.flowRate, 18);

  return {
    flowPerSecond: flowPerSecond,
    flowPerMonth: +flowPerSecond * 60,
    timestamp: flow.timestamp.toString(),
  };
};

export const getStreamEndDate = async (
  ibAlluoAddress,
  ricochetMarketAddress,
  startDateTimestamp,
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'int96',
          name: 'amountPerSecond',
          type: 'int96',
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'endTimestamp',
          type: 'uint256',
        },
      ],
      name: 'CreateFlowWithTimestamp',
      type: 'event',
    },
  ];

  const blockNumber = await binarySearchForBlock(
    startDateTimestamp,
    EChain.POLYGON,
  );

  if (blockNumber) {
    const eventLogs = await QueryFilter(
      abi,
      ibAlluoAddress,
      'CreateFlowWithTimestamp(address,address,int96,uint256)',
      [getCurrentWalletAddress(), ricochetMarketAddress],
      blockNumber,
      chain,
    );

    if (eventLogs[0]) {
      const endTimestamp = eventLogs[0].args.endTimestamp;
      return Number(endTimestamp);
    }
  }

  return null;
};

const getRicochetStreamIndexes = (inputAddress, outputAddress) => {
  switch (inputAddress) {
    case EPolygonAddresses.STIBALLUOUSD:
      if (outputAddress == EPolygonAddresses.STIBALLUOETH) {
        return { subsidyIndex: 3, inputIndex: 0, outputIndex: 1 };
      }
      if (outputAddress == EPolygonAddresses.STIBALLUOBTC) {
        return { subsidyIndex: 3, inputIndex: 0, outputIndex: 1 };
      }
      break;

    case EPolygonAddresses.STIBALLUOETH:
      if (outputAddress == EPolygonAddresses.STIBALLUOUSD) {
        return { subsidyIndex: 2, inputIndex: 1, outputIndex: 0 };
      }
      break;

    case EPolygonAddresses.STIBALLUOBTC:
      if (outputAddress == EPolygonAddresses.STIBALLUOUSD) {
        return { subsidyIndex: 2, inputIndex: 1, outputIndex: 0 };
      }
      break;
    default:
      break;
  }
};

export const depositIntoAlluo = async (
  tokenAddress,
  ibAlluoAddress,
  amount,
  useBiconomy,
  chain = EChain.POLYGON,
) => {
  try {
    const abi = [
      {
        inputs: [
          { internalType: 'address', name: '_token', type: 'address' },
          { internalType: 'uint256', name: '_amount', type: 'uint256' },
        ],
        name: 'deposit',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const decimals = await getDecimals(tokenAddress);
    const amountInDecimals = toDecimals(amount, decimals);

    const tx = await sendTransaction(
      abi,
      ibAlluoAddress,
      'deposit(address,uint256)',
      [tokenAddress, amountInDecimals],
      chain,
      useBiconomy,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};

export const getUnapprovedSuperfluidSubscriptions = async (
  ibAlluoInputAddress,
  superfluidInputAddress,
  superfluidOutputAddress,
  ricochetMarketAddress,
) => {
  try {
    const provider = getReadOnlyProvider(EChain.POLYGON);
    const walletAddress = getCurrentWalletAddress();

    const superfluidFramework = await getSuperfluidFramework();

    const subsidyAddress = EPolygonAddresses.RICOCHETSUBSIDY;
    const { subsidyIndex, inputIndex, outputIndex } = getRicochetStreamIndexes(
      superfluidInputAddress,
      superfluidOutputAddress,
    );
    const userData = '0x';

    let subscriptionOperations = [];

    const outputAddressSubscription =
      await superfluidFramework.idaV1.getSubscription({
        superToken: superfluidOutputAddress,
        publisher: ricochetMarketAddress,
        indexId: outputIndex.toString(),
        subscriber: walletAddress,
        providerOrSigner: provider,
      });

    if (!outputAddressSubscription.approved) {
      subscriptionOperations.push(
        superfluidFramework.idaV1.approveSubscription({
          superToken: superfluidOutputAddress,
          indexId: outputIndex.toString(),
          publisher: ricochetMarketAddress,
          userData,
        }),
      );
    }

    const subsidyAddressSubscription =
      await superfluidFramework.idaV1.getSubscription({
        superToken: subsidyAddress,
        publisher: ricochetMarketAddress,
        indexId: subsidyIndex.toString(),
        subscriber: walletAddress,
        providerOrSigner: provider,
      });

    if (!subsidyAddressSubscription.approved) {
      subscriptionOperations.push(
        superfluidFramework.idaV1.approveSubscription({
          superToken: subsidyAddress,
          indexId: subsidyIndex.toString(),
          publisher: ricochetMarketAddress,
          userData,
        }),
      );
    }

    const flowOperatorData =
      await superfluidFramework.cfaV1.getFlowOperatorData({
        superToken: superfluidInputAddress,
        flowOperator: ibAlluoInputAddress,
        sender: walletAddress,
        providerOrSigner: provider,
      });

    if (
      +flowOperatorData.permissions != 7 ||
      !(+flowOperatorData.flowRateAllowance > 0)
    ) {
      subscriptionOperations.push(
        superfluidFramework.cfaV1.authorizeFlowOperatorWithFullControl({
          superToken: superfluidInputAddress,
          flowOperator: ibAlluoInputAddress,
          userData: userData,
        }),
      );
    }

    return subscriptionOperations;
  } catch (error) {
    throw error;
  }
};

export const approveSuperfluidSubscriptions = async (
  subscriptionOperations,
  useBiconomy,
) => {
  try {
    const superfluidAbi = [
      {
        inputs: [
          {
            components: [
              {
                internalType: 'uint32',
                name: 'operationType',
                type: 'uint32',
              },
              { internalType: 'address', name: 'target', type: 'address' },
              { internalType: 'bytes', name: 'data', type: 'bytes' },
            ],
            internalType: 'struct ISuperfluid.Operation[]',
            name: 'operations',
            type: 'tuple[]',
          },
        ],
        name: 'forwardBatchCall',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          {
            components: [
              {
                internalType: 'uint32',
                name: 'operationType',
                type: 'uint32',
              },
              { internalType: 'address', name: 'target', type: 'address' },
              { internalType: 'bytes', name: 'data', type: 'bytes' },
            ],
            internalType: 'struct ISuperfluid.Operation[]',
            name: 'operations',
            type: 'tuple[]',
          },
        ],
        name: 'batchCall',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const superfluidAddress = EPolygonAddresses.SUPERFLUID;

    const iface = new ethers.utils.Interface([
      'function callAgreement(address agreementClass, bytes callData, bytes userData)',
    ]);

    const operationTransactions = await Promise.all(
      subscriptionOperations.map(async x => {
        const transaction = await x.populateTransactionPromise;

        let parsed = iface.decodeFunctionData(
          'callAgreement',
          transaction.data,
        );

        const operationData = ethers.utils.defaultAbiCoder.encode(
          ['bytes', 'bytes'],
          [parsed.callData, parsed.userData],
        );

        return {
          operationType: 201,
          target: parsed.agreementClass,
          data: operationData,
        };
      }),
    );

    if (subscriptionOperations.length > 0) {
      const tx = await sendTransaction(
        superfluidAbi,
        superfluidAddress,
        useBiconomy
          ? 'forwardBatchCall((uint32,address,bytes)[])'
          : 'batchCall((uint32,address,bytes)[])',
        [operationTransactions],
        EChain.POLYGON,
        useBiconomy,
      );

      return tx;
    }
  } catch (error) {
    throw error;
  }
};

export const startStream = async (
  ibAlluoInputAddress,
  superfluidInputAddress,
  superfluidOutputAddress,
  ricochetMarketAddress,
  flowRatePerMonth,
  endDateTimestamp = null,
  useBiconomy,
) => {
  try {
    const { outputIndex } = getRicochetStreamIndexes(
      superfluidInputAddress,
      superfluidOutputAddress,
    );

    const streamExhangeAbi = [
      {
        inputs: [{ internalType: 'uint32', name: '_index', type: 'uint32' }],
        name: 'getOutputPool',
        outputs: [
          {
            components: [
              {
                internalType: 'contract ISuperToken',
                name: 'token',
                type: 'address',
              },
              { internalType: 'uint128', name: 'feeRate', type: 'uint128' },
              {
                internalType: 'uint256',
                name: 'emissionRate',
                type: 'uint256',
              },
              { internalType: 'uint128', name: 'shareScaler', type: 'uint128' },
            ],
            internalType: 'struct REXMarket.OutputPool',
            name: '',
            type: 'tuple',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const outputPool = await callContract(
      streamExhangeAbi,
      ricochetMarketAddress,
      'getOutputPool(uint32)',
      [outputIndex],
      EChain.POLYGON,
    );

    const shareScaler = outputPool.shareScaler * 1e3;

    const ibAlluoAbi = [
      {
        inputs: [
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'int96', name: 'flowRate', type: 'int96' },
          { internalType: 'uint256', name: 'toWrap', type: 'uint256' },
        ],
        name: 'createFlow',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
      {
        inputs: [
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'int96', name: 'flowRate', type: 'int96' },
          { internalType: 'uint256', name: 'toWrap', type: 'uint256' },
          { internalType: 'uint256', name: 'timestamp', type: 'uint256' },
        ],
        name: 'createFlow',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const actualFlowRatePerSecond =
      Math.floor(((flowRatePerMonth / 2592000) * 1e18) / shareScaler) *
      shareScaler;

    let params = [
      ricochetMarketAddress,
      actualFlowRatePerSecond,
      toDecimals(await getBalanceOf(ibAlluoInputAddress, 18), 18),
    ];

    let tx;

    if (endDateTimestamp) {
      params.push(endDateTimestamp);
      tx = await sendTransaction(
        ibAlluoAbi,
        ibAlluoInputAddress,
        'createFlow(address,int96,uint256,uint256)',
        params,
        EChain.POLYGON,
        useBiconomy,
      );
    } else {
      tx = await sendTransaction(
        ibAlluoAbi,
        ibAlluoInputAddress,
        'createFlow(address,int96,uint256)',
        params,
        EChain.POLYGON,
        useBiconomy,
      );
    }

    return tx;
  } catch (error) {
    throw error;
  }
};

export const stopStream = async (
  ibAlluoAddress,
  ricochetMarketAddress,
  useBiconomy,
) => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: 'receiver', type: 'address' }],
      name: 'deleteFlow',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const tx = await sendTransaction(
    abi,
    ibAlluoAddress,
    'deleteFlow(address)',
    [ricochetMarketAddress],
    EChain.POLYGON,
    useBiconomy,
  );

  return tx;
};
