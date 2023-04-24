import { ethers } from 'ethers';
import { EEthereumAddresses, EPolygonAddresses, EOptimismAddresses } from '../constants/addresses';
import { EChain } from '../constants/chains';
import { toDecimals } from './utils';
import {
  callContract,
  getCurrentWalletAddress, QueryFilter,
  sendTransaction
} from './web3Client';

export const deposit = async (
  tokenAddress,
  farmAddress,
  amount,
  decimals,
  chain = EChain.POLYGON,
  useBiconomy,
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

    const amountInDecimals = toDecimals(amount, decimals);

    const tx = await sendTransaction(
      abi,
      farmAddress,
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

export const withdraw = async (
  tokenAddress,
  farmAddress,
  amount,
  chain = EChain.POLYGON,
  useBiconomy,
) => {
  try {
    const abi = [
      {
        inputs: [
          { internalType: 'address', name: '_targetToken', type: 'address' },
          { internalType: 'uint256', name: '_amount', type: 'uint256' },
        ],
        name: 'withdraw',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const amountInWei = ethers.utils.parseUnits(amount.toString(), 'ether');

    const tx = await sendTransaction(
      abi,
      farmAddress,
      'withdraw(address,uint256)',
      [tokenAddress, amountInWei],
      chain,
      useBiconomy,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};

export const getIfUserHasWithdrawalRequest = async (farmAddress, chain) => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: '_ibAlluo', type: 'address' },
        { internalType: 'address', name: '_user', type: 'address' },
      ],
      name: 'isUserWaiting',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const handlerAddress =
    chain == EChain.POLYGON
      ? EPolygonAddresses.HANDLER
      : chain == EChain.ETHEREUM ? 
      EEthereumAddresses.HANDLER 
      : EOptimismAddresses.HANDLER;

  const isUserWaiting = await callContract(
    abi,
    handlerAddress,
    'isUserWaiting(address,address)',
    [farmAddress, getCurrentWalletAddress()],
    chain,
  );

  return isUserWaiting;
};

export const getIfWithdrawalWasAddedToQueue = async (blockNumber, chain) => {
  const abi = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'ibAlluo',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'user',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'token',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'queueIndex',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'satisfiedTime',
          type: 'uint256',
        },
      ],
      name: 'WithdrawalSatisfied',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'ibAlluo',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'user',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'token',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'queueIndex',
          type: 'uint256',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'requestTime',
          type: 'uint256',
        },
      ],
      name: 'AddedToQueue',
      type: 'event',
    },
  ];
  
  const handlerAddress =
    chain == EChain.POLYGON
      ? EPolygonAddresses.HANDLER
      : chain == EChain.ETHEREUM 
      ? EEthereumAddresses.HANDLER
      : EOptimismAddresses.HANDLER;

  let events = await QueryFilter(
    abi,
    handlerAddress,
    'WithdrawalSatisfied',
    [],
    blockNumber,
    chain,
  );

  if (
    events.find(event => {
      return event.args?.user.toLowerCase() == getCurrentWalletAddress();
    })
  ) {
    return false;
  }

  events = await QueryFilter(
    abi,
    handlerAddress,
    'AddedToQueue',
    [],
    blockNumber,
    chain,
  );
  if (
    events.find(event => {
      return event.args?.user.toLowerCase() == getCurrentWalletAddress();
    })
  ) {
    return true;
  }

  return false;
};
