import { ethers } from 'ethers';
import { EEthereumAddresses, EPolygonAddresses } from '../constants/addresses';
import { EChain } from '../constants/chains';
import { toDecimals } from './utils';
import {
  callContract,
  getCurrentWalletAddress,
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
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'ibAlluoToWithdrawalSystems',
      outputs: [
        {
          internalType: 'uint256',
          name: 'lastWithdrawalRequest',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'lastSatisfiedWithdrawal',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'totalWithdrawalAmount',
          type: 'uint256',
        },
        { internalType: 'bool', name: 'resolverTrigger', type: 'bool' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: '_ibAlluo', type: 'address' },
        { internalType: 'uint256', name: '_id', type: 'uint256' },
      ],
      name: 'getWithdrawal',
      outputs: [
        {
          components: [
            { internalType: 'address', name: 'user', type: 'address' },
            { internalType: 'address', name: 'token', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'uint256', name: 'time', type: 'uint256' },
          ],
          internalType: 'struct LiquidityHandler.Withdrawal',
          name: '',
          type: 'tuple',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const handlerAddress =
    chain == EChain.POLYGON ? EPolygonAddresses.HANDLER : EEthereumAddresses.HANDLER;

  const isUserWaiting = await callContract(
    abi,
    handlerAddress,
    'isUserWaiting(address, address)',
    [farmAddress, getCurrentWalletAddress()],
    chain,
  );

  if (!isUserWaiting) return [];

  // const ibAlluoToWithdrawalSystems =
  const ibAlluoToWithdrawalSystems = await callContract(
    abi,
    handlerAddress,
    'ibAlluoToWithdrawalSystems(address)',
    [farmAddress],
    chain,
  );

  const { lastSatisfiedWithdrawal, lastWithdrawalRequest } =
    ibAlluoToWithdrawalSystems;
  const allWithdrawalRequests = [];

  for (let i = +lastSatisfiedWithdrawal + 1; i <= +lastWithdrawalRequest; i++) {
    const withdrawal = await callContract(
      abi,
      handlerAddress,
      'getWithdrawal(address,uint256)',
      [farmAddress, i],
      chain,
    );
    allWithdrawalRequests.push(withdrawal);
  }

  const allWithdrawals = await Promise.all(allWithdrawalRequests);
  const usersWithdrawals = allWithdrawals.filter(
    w => w.user.toLowerCase() === getCurrentWalletAddress().toLowerCase(),
  );
  return usersWithdrawals;
};
