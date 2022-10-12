import { EChain } from 'app/common/constants/chains';
import {
  callContract,
  getBalanceOf,
  getCurrentWalletAddress,
  getSuperfluidFramework,
  sendTransaction
} from 'app/common/functions/web3Client';
import { ethers } from 'ethers';
import { EPolygonAddresses } from '../constants/addresses';
import { fromDecimals } from './utils';

export const getInterest = async (tokenAddress, chain = EChain.POLYGON) => {
  const abi = [
    {
      inputs: [],
      name: 'annualInterest',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const interest = await callContract(
    abi,
    tokenAddress,
    'annualInterest()',
    null,
    chain,
  );

  return fromDecimals(interest, 2);
};

export const getTotalAssetSupply = async (
  tokenAddress,
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      inputs: [],
      name: 'totalAssetSupply',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const totalAssetSupply = await callContract(
    abi,
    tokenAddress,
    'totalAssetSupply()',
    null,
    chain,
  );

  return ethers.utils.formatEther(totalAssetSupply);
};

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
  ricochetMarketContract,
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

  const ethereumRicochetStreamsAddress = EPolygonAddresses.RICOCHETSTREAMS;

  const flow = await callContract(
    abi,
    ethereumRicochetStreamsAddress,
    'getFlow(address,address,address)',
    [superFluidToken, getCurrentWalletAddress(), ricochetMarketContract],
    chain,
  );

  return {
    flowPerSecond: flow.flowRate,
    flowPerMinute: flow.flowRate.toNumber() * 60,
    timestamp: flow.timestamp.toString(),
  };
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

export const startStream = async (
  ibAlluoInputAddress,
  superfluidInputAddress,
  superfluidOutputAddress,
  ricochetMarketContract,
  flowRatePerSecond,
  endDateTimestamp = null,
) => {
  try {
    const { superfluid, signer, provider } = await getSuperfluidFramework(
      EChain.POLYGON,
    );
    const walletAddress = getCurrentWalletAddress();

    const subsidyAddress = EPolygonAddresses.RICOCHETSUBSIDY;
    const { subsidyIndex, inputIndex, outputIndex } = getRicochetStreamIndexes(
      superfluidInputAddress,
      superfluidOutputAddress,
    );
    const userData = '0x';

    let operations = [];

    const outputAddressSubscription = await superfluid.idaV1.getSubscription({
      superToken: superfluidOutputAddress,
      publisher: ricochetMarketContract,
      indexId: outputIndex.toString(),
      subscriber: walletAddress,
      providerOrSigner: provider,
    });

    if (!outputAddressSubscription.approved) {
      operations.push(
        superfluid.idaV1.approveSubscription({
          superToken: superfluidOutputAddress,
          indexId: outputIndex.toString(),
          publisher: ricochetMarketContract,
          userData,
        }),
      );
    }

    const subsidyAddressSubscription = await superfluid.idaV1.getSubscription({
      superToken: subsidyAddress,
      publisher: ricochetMarketContract,
      indexId: subsidyIndex.toString(),
      subscriber: walletAddress,
      providerOrSigner: provider,
    });

    if (!subsidyAddressSubscription.approved) {
      operations.push(
        superfluid.idaV1.approveSubscription({
          superToken: subsidyAddress,
          indexId: subsidyIndex.toString(),
          publisher: ricochetMarketContract,
          userData,
        }),
      );
    }

    const flowOperatorData = await superfluid.cfaV1.getFlowOperatorData({
      superToken: superfluidInputAddress,
      flowOperator: ibAlluoInputAddress,
      sender: walletAddress,
      providerOrSigner: provider,
    });

    if (
      +flowOperatorData.permissions != 7 ||
      +flowOperatorData.flowRateAllowance < 365 * 246060 * flowRatePerSecond
    ) {
      operations.push(
        superfluid.cfaV1.authorizeFlowOperatorWithFullControl({
          superToken: superfluidInputAddress,
          flowOperator: ibAlluoInputAddress,
          userData: userData,
        }),
      );
    }

    await superfluid.batchCall(operations).exec(signer);

    const abi = [
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

    let tx;

    let params = [
      superfluidOutputAddress,
      flowRatePerSecond,
      await getBalanceOf(ibAlluoInputAddress, 18),
    ];
    if (endDateTimestamp) {
      params.push(endDateTimestamp);
      tx = await sendTransaction(
        abi,
        ibAlluoInputAddress,
        'createFlow(address,int96,uint256,uint256)',
        params,
        EChain.POLYGON,
      );
    } else {
      tx = await sendTransaction(
        abi,
        ibAlluoInputAddress,
        'createFlow(address,int96,uint256)',
        params,
        EChain.POLYGON,
      );
    }

    return tx;
  } catch (error) {
    throw error;
  }
};
