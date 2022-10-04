import { EChain } from 'app/common/constants/chains';
import {
    approveToken,
    callContract,
    getAlluoPrice,
    getCurrentWalletAddress,
    sendTransaction
} from 'app/common/functions/web3Client';
import { ethers } from 'ethers';
import { EEthereumAddresses } from '../constants/addresses';

export const getAlluoStakingAPR = async () => {
  const abi = [
    {
      inputs: [],
      name: 'rewardPerDistribution',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalLocked',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const rewardPerDistribution = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'rewardPerDistribution()',
    null,
    EChain.ETHEREUM,
  );

  const totalLockedInLB = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'totalLocked()',
    null,
    EChain.ETHEREUM,
  );

  return calculateApr(rewardPerDistribution, totalLockedInLB);
};

export const calculateApr = async (rewardPerDistribution, totalLockedInLP) => {
  const alluoPrice = await getAlluoPrice();
  if (!alluoPrice) return 0;

  const abi = [
    {
      inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
      name: 'convertLpToAlluo',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const totalLockedLPToAlluo = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'convertLpToAlluo(uint256)',
    [totalLockedInLP],
    EChain.ETHEREUM,
  );

  const exactApr =
    ((+ethers.utils.formatEther(rewardPerDistribution) * alluoPrice) /
      (+ethers.utils.formatEther(totalLockedLPToAlluo) * alluoPrice)) *
    100 *
    365;

  return +exactApr.toFixed(2);
};

export const getAlluoStakingAllowance = async () => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: 'owner', type: 'address' },
        { internalType: 'address', name: 'spender', type: 'address' },
      ],
      name: 'allowance',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumAlluoAddress = EEthereumAddresses.ALLUO;

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const allowance = callContract(
    abi,
    ethereumAlluoAddress,
    'allowance(address,address)',
    [getCurrentWalletAddress(), ethereumVlAlluoAddress],
    EChain.ETHEREUM,
  );

  return allowance;
};

export const approveAlluoStaking = async () => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: 'spender', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const tx = await approveToken(
    EEthereumAddresses.ALLUO,
    EEthereumAddresses.VLALLUO,
    EChain.ETHEREUM,
  );

  return tx;
};

export const stakeAlluo = async alluoAmount => {
  const abi = [
    {
      inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
      name: 'lock',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const alluoAmountInWei = ethers.utils.parseUnits(alluoAmount);

  const tx = await sendTransaction(
    abi,
    ethereumVlAlluoAddress,
    'lock(uint256)',
    [alluoAmountInWei],
    EChain.ETHEREUM,
  );

  return tx;
};
