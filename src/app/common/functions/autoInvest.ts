import { EChain } from 'app/common/constants/chains';
import {
  callContract,
  getCurrentWalletAddress
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
