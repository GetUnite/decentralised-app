import { EChain } from 'app/common/constants/chains';
import {
  approve,
  callContract,
  getCurrentWalletAddress,
  getPrice, sendTransaction
} from 'app/common/functions/web3Client';
import { ethers } from 'ethers';
import { EEthereumAddresses, EEthereumAddressesMainnet } from '../constants/addresses';
import { toExactFixed } from './utils';

export const getAlluoPrice = async () => {
  return getPrice(EEthereumAddressesMainnet.ALLUO, EEthereumAddressesMainnet.USDC, 18, 6);
};

export const alluoToUsd = async alluoValueInWei => {
  const alluoPrice = await getAlluoPrice();
  return toExactFixed(+(+alluoValueInWei * alluoPrice), 2);
};

export const getTotalAlluoLockedInLp = async () => {
  const abi = [
    {
      inputs: [],
      name: 'totalLocked',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const totalLocked = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'totalLocked()',
    null,
    EChain.ETHEREUM,
  );

  return totalLocked;
};

export const getAlluoStakingRewardPerDistribution = async () => {
  const abi = [
    {
      inputs: [],
      name: 'rewardPerDistribution',
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

  return ethers.utils.formatEther(rewardPerDistribution);
};

export const getAlluoStakingAPR = async (totalAlluoLocked = null) => {
  const alluoPrice = await getAlluoPrice();
  if (!alluoPrice) return "0";

  const alluoStakingRewardPerDistribution =
    await getAlluoStakingRewardPerDistribution();

  const totalAlluoStaked = totalAlluoLocked ? totalAlluoLocked : await getTotalAlluoLocked();

  const exactApr =
    (+alluoStakingRewardPerDistribution / +totalAlluoStaked) * 100 * 365;

  return toExactFixed(exactApr, 2);
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

  // 18 is the number of decimals of alluo
  return ethers.utils.formatUnits(balance, 18);
};

export const getEarnedAlluo = async () => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_locker', type: 'address' }],
      name: 'getClaim',
      outputs: [{ internalType: 'uint256', name: 'reward', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const earnedAlluo = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'getClaim(address)',
    [getCurrentWalletAddress()],
    EChain.ETHEREUM,
  );

  // 18 is the number of decimals of alluo
  return ethers.utils.formatUnits(earnedAlluo, 18);
};

export const getUnlockedAlluo = async () => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
      name: 'unlockedBalanceOf',
      outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const earnedAlluo = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'unlockedBalanceOf(address)',
    [getCurrentWalletAddress()],
    EChain.ETHEREUM,
  );

  return ethers.utils.formatEther(earnedAlluo);
};

export const getAlluoStakingWalletAddressInfo = async () => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
      name: 'getInfoByAddress',
      outputs: [
        { internalType: 'uint256', name: 'locked_', type: 'uint256' },
        { internalType: 'uint256', name: 'unlockAmount_', type: 'uint256' },
        { internalType: 'uint256', name: 'claim_', type: 'uint256' },
        {
          internalType: 'uint256',
          name: 'depositUnlockTime_',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'withdrawUnlockTime_',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
      name: 'convertLpToAlluo',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];
  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const alluoStakingWalletAddressInfo = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'getInfoByAddress(address)',
    [getCurrentWalletAddress()],
    EChain.ETHEREUM,
  );

  const walletLockedAlluo = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'convertLpToAlluo(uint256)',
    [alluoStakingWalletAddressInfo.locked_],
    EChain.ETHEREUM,
  );

  return {
    locked: ethers.utils.formatEther(walletLockedAlluo),
    lockedInLp: ethers.utils.formatEther(alluoStakingWalletAddressInfo.locked_),
    lockedInUsd: alluoToUsd(ethers.utils.formatEther(walletLockedAlluo)),
    withdrawUnlockTime:
      alluoStakingWalletAddressInfo.withdrawUnlockTime_.toString(),
    depositUnlockTime:
      alluoStakingWalletAddressInfo.depositUnlockTime_.toString(),
  };
};

export const getTotalAlluoLocked = async () => {
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

  const totalAlluoLockedInLp = await getTotalAlluoLockedInLp();

  const totalAlluoLocked = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'convertLpToAlluo(uint256)',
    [totalAlluoLockedInLp],
    EChain.ETHEREUM,
  );

  return ethers.utils.formatEther(totalAlluoLocked);
};

export const getTotalAlluoLockedInUsd = async () => {
  const totalAlluoStaked = await getTotalAlluoLocked();
  return await alluoToUsd(totalAlluoStaked);
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
  const tx = await approve(
    EEthereumAddresses.ALLUO,
    EEthereumAddresses.VLALLUO,
    EChain.ETHEREUM,
  );

  return tx;
};

export const lockAlluo = async alluoAmount => {
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

export const unlockAlluo = async value => {
  const abi = [
    {
      inputs: [{ internalType: 'uint256', name: '_amount', type: 'uint256' }],
      name: 'unlock',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const alluoAmountInWei = ethers.utils.parseUnits(value + '');

  const tx = await sendTransaction(
    abi,
    ethereumVlAlluoAddress,
    'unlock(uint256)',
    [alluoAmountInWei],
    EChain.ETHEREUM,
  );

  return tx;
};

export const unlockAllAlluo = async () => {
  const abi = [
    {
      inputs: [],
      name: 'unlockAll',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const tx = await sendTransaction(
    abi,
    ethereumVlAlluoAddress,
    'unlockAll()',
    [],
    EChain.ETHEREUM,
  );

  return tx;
};

export const withdrawAlluo = async () => {
  const abi = [
    {
      inputs: [],
      name: 'withdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const tx = await sendTransaction(
    abi,
    ethereumVlAlluoAddress,
    'withdraw()',
    [],
    EChain.ETHEREUM,
  );

  return tx;
};
