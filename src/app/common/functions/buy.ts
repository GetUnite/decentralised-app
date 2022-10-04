import { EChain } from 'app/common/constants/chains';
import {
    callContract,
    getCurrentWalletAddress,
    sendTransaction
} from 'app/common/functions/web3Client';
import { ethers } from 'ethers';
import { EEthereumAddresses } from '../constants/addresses';
import { maximumUint256Value } from './utils';

export const getWEthBalance = async () => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const wEthAddress = EEthereumAddresses.WETH;

  const balance = await callContract(
    abi,
    wEthAddress,
    'balanceOf(address)',
    [getCurrentWalletAddress()],
    EChain.ETHEREUM,
  );

  return ethers.utils.formatEther(balance);
};

export const getVlAlluoTotalSupply = async () => {
  const abi = [
    {
      inputs: [],
      name: 'totalSupply',
      outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const totalAssetSupply = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'totalSupply()',
    null,
    EChain.ETHEREUM,
  );

  return ethers.utils.formatEther(totalAssetSupply);
};

export const getVlAlluoBalance = async () => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const balance = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'balanceOf(address)',
    [getCurrentWalletAddress()],
    EChain.ETHEREUM,
  );

  return ethers.utils.formatEther(balance);
};

export const getAlluoBalance = async () => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const alluoAddress = EEthereumAddresses.ALLUO;

  const balance = await callContract(
    abi,
    alluoAddress,
    'balanceOf(address)',
    [getCurrentWalletAddress()],
    EChain.ETHEREUM,
  );

  return ethers.utils.formatEther(balance);
};

export const getWETHAllowance = async () => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: '', type: 'address' },
        { internalType: 'address', name: '', type: 'address' },
      ],
      name: 'allowance',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const wEthAddress = EEthereumAddresses.WETH;
  const vaultAddress = EEthereumAddresses.VAULT;

  const balance = await callContract(
    abi,
    wEthAddress,
    'allowance(address,address)',
    [getCurrentWalletAddress(), vaultAddress],
    EChain.ETHEREUM,
  );

  return ethers.utils.formatEther(balance);
};

export const approveAlluoPurchaseInWETH = async () => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: 'guy', type: 'address' },
        { internalType: 'uint256', name: 'wad', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const wEthAddress = EEthereumAddresses.WETH;
  const vaultAddress = EEthereumAddresses.VAULT;

  try {
    const tx = await sendTransaction(
      abi,
      wEthAddress,
      'approve(address,uint256)',
      [vaultAddress, maximumUint256Value],
      EChain.ETHEREUM,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};

export const buyAlluoWithWETH = async value => {
  try {
    const abi = [
      {
        inputs: [
          {
            components: [
              { internalType: 'bytes32', name: 'poolId', type: 'bytes32' },
              {
                internalType: 'enum IVault.SwapKind',
                name: 'kind',
                type: 'uint8',
              },
              {
                internalType: 'contract IAsset',
                name: 'assetIn',
                type: 'address',
              },
              {
                internalType: 'contract IAsset',
                name: 'assetOut',
                type: 'address',
              },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
              { internalType: 'bytes', name: 'userData', type: 'bytes' },
            ],
            internalType: 'struct IVault.SingleSwap',
            name: 'singleSwap',
            type: 'tuple',
          },
          {
            components: [
              { internalType: 'address', name: 'sender', type: 'address' },
              {
                internalType: 'bool',
                name: 'fromInternalBalance',
                type: 'bool',
              },
              {
                internalType: 'address payable',
                name: 'recipient',
                type: 'address',
              },
              {
                internalType: 'bool',
                name: 'toInternalBalance',
                type: 'bool',
              },
            ],
            internalType: 'struct IVault.FundManagement',
            name: 'funds',
            type: 'tuple',
          },
          { internalType: 'uint256', name: 'limit', type: 'uint256' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
        ],
        name: 'swap',
        outputs: [
          {
            internalType: 'uint256',
            name: 'amountCalculated',
            type: 'uint256',
          },
        ],
        stateMutability: 'payable',
        type: 'function',
      },
    ];

    const ethereumVaultAddress = EEthereumAddresses.VAULT;

    const ethereumWETHAddress = EEthereumAddresses.WETH.toLowerCase();
    const ethereumAlluoAddress = EEthereumAddresses.ALLUO.toLowerCase();

    const swap_struct = {
      poolId:
        process.env.REACT_APP_NET === 'mainnet'
          ? '0x85be1e46283f5f438d1f864c2d925506571d544f0002000000000000000001aa'
          : '0xb157a4395d28c024a0e2e5fa142a53b3eb726bc6000200000000000000000713',
      kind: 0,
      assetIn: ethers.utils.getAddress(ethereumWETHAddress),
      assetOut: ethers.utils.getAddress(ethereumAlluoAddress),
      amount: String(value * Math.pow(10, 18)).toString(),
      userData: '0x',
    };
    const deadline = String(999999999999999999);
    const fund_struct = {
      sender: ethers.utils.getAddress(getCurrentWalletAddress()),
      recipient: ethers.utils.getAddress(getCurrentWalletAddress()),
      fromInternalBalance: false,
      toInternalBalance: false,
    };
    const token_limit = String(0 * Math.pow(10, 18)).toString();

    const tx = await sendTransaction(
      abi,
      ethereumVaultAddress,
      'swap((bytes32,uint8,address,address,uint256,bytes),(address,bool,address,bool),uint256,uint256)',
      [swap_struct, fund_struct, token_limit, deadline.toString()],
      EChain.ETHEREUM,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};
