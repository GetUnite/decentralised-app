import { EChain } from 'app/common/constants/chains';
import { fromDecimals, toDecimals } from './utils';
import {
  callContract,
  getCurrentWalletAddress,
  sendTransaction,
} from 'app/common/functions/w';

export const getIbAlluoInfo = async address => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
      name: 'getBalanceForTransfer',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'decimals',
      outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const symbol = await callContract(
    abi,
    address,
    'symbol()',
    null,
    EChain.POLYGON,
  );

  const decimals = await callContract(
    abi,
    address,
    'decimals()',
    null,
    EChain.POLYGON,
  );

  const balance = await callContract(
    abi,
    address,
    'getBalanceForTransfer(address)',
    [getCurrentWalletAddress()],
    EChain.POLYGON,
  );

  return {
    address,
    symbol,
    decimals,
    balance: fromDecimals(balance, decimals),
  };
};

export const transferToAddress = async (
  tokenAddress,
  amount,
  decimals,
  toAddress,
  useBiconomy,
) => {
  try {
    const abi = [
      {
        inputs: [
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'transferAssetValue',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const amountInDecimals = toDecimals(amount, decimals);

    const tx = await sendTransaction(
      abi,
      tokenAddress,
      'transferAssetValue(address,uint256)',
      [toAddress, amountInDecimals],
      EChain.POLYGON,
      useBiconomy,
    );

    return tx;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
