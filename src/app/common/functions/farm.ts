import { ethers } from 'ethers';
import { EChain } from '../constants/chains';
import { toDecimals } from './utils';
import { sendTransaction } from './web3Client';

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

    const amountInWei = ethers.utils.parseUnits(amount, 'ether');

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
