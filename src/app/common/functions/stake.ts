import { EChain } from 'app/common/constants/chains';
import {
  approve,
  callContract,
  getCurrentWalletAddress,
  getPrice,
  sendTransaction
} from 'app/common/functions/web3Client';
import { ethers } from 'ethers';
import {
  EEthereumAddresses,
  EEthereumAddressesMainnet
} from '../constants/addresses';
import { fromDecimals, toExactFixed } from './utils';

export const getAlluoPrice = async () => {
  try {
    return getPrice(
      EEthereumAddressesMainnet.ALLUO,
      EEthereumAddressesMainnet.USDC,
      18,
      6,
    );
  } catch (error) {
    throw error;
  }
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

export const getAlluoStakingAPR = async () => {
  const alluoPrice = await getAlluoPrice();
  if (!alluoPrice) return 0;

  const alluoStakingRewardPerDistribution =
    await getAlluoStakingRewardPerDistribution();

  const totalAlluoStaked = await getTotalAlluoLocked();

  const exactApr =
    (+alluoStakingRewardPerDistribution / +totalAlluoStaked) * 100 * 365;

  return +exactApr.toFixed(2);
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

  return ethers.utils.formatEther(earnedAlluo);
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
        { internalType: 'uint256', name: 'claimCvx_', type: 'uint256' },
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
  ];
  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const alluoStakingWalletAddressInfo = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'getInfoByAddress(address)',
    [getCurrentWalletAddress()],
    EChain.ETHEREUM,
  );

  return {
    locked: ethers.utils.formatEther(alluoStakingWalletAddressInfo.locked_),
    lockedInLp: ethers.utils.formatEther(alluoStakingWalletAddressInfo.locked_),
    lockedInUsd: alluoToUsd(
      ethers.utils.formatEther(alluoStakingWalletAddressInfo.locked_),
    ),
    withdrawUnlockTime:
      alluoStakingWalletAddressInfo.withdrawUnlockTime_.toString(),
    depositUnlockTime:
      alluoStakingWalletAddressInfo.depositUnlockTime_.toString(),
    cvxRewards: ethers.utils.formatEther(
      alluoStakingWalletAddressInfo.claimCvx_,
    ),
  };
};

export const getTotalAlluoLocked = async () => {
  const totalAlluoLockedInLp = await getTotalAlluoLockedInLp();

  return ethers.utils.formatEther(totalAlluoLockedInLp);
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

export const claimStakingRewards = async () => {
  const abi = [
    {
      inputs: [],
      name: 'claim',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const tx = await sendTransaction(
    abi,
    ethereumVlAlluoAddress,
    'claim()',
    [],
    EChain.ETHEREUM,
  );

  return tx;
};

export const getStakingPendingRewards = async chain => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_staker', type: 'address' }],
      name: 'stakerAccruedRewards',
      outputs: [
        {
          components: [
            { internalType: 'address', name: 'token', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
          ],
          internalType: 'struct IAlluoVault.RewardData[]',
          name: '',
          type: 'tuple[]',
        },
        {
          components: [
            { internalType: 'address', name: 'token', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
          ],
          internalType: 'struct IAlluoVault.RewardData[]',
          name: '',
          type: 'tuple[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const cvxDistributorAddress = EEthereumAddresses.CVXDISTRIBUTOR;

  const stakerAccruedRewards = await callContract(
    abi,
    cvxDistributorAddress,
    'stakerAccruedRewards(address)',
    [getCurrentWalletAddress()],
    chain,
  );

  let pendingRewardsByToken = [];
  for (const pendingRewardsArray of stakerAccruedRewards) {
    for (const pendingRewards of pendingRewardsArray) {
      const rewardByToken = pendingRewardsByToken.find(
        prbt => prbt.token == pendingRewards.token,
      );
      if (rewardByToken) {
        rewardByToken.amount += +pendingRewards.amount;
      } else {
        pendingRewardsByToken.push({
          token: pendingRewards.token,
          amount: +pendingRewards.amount,
        });
      }
    }
  }

  const pendingRewardsInUSDC = await Promise.all(
    pendingRewardsByToken.map(async prbt => {
      const tokenPrice = await getPrice(
        prbt.token,
        EEthereumAddresses.USDC,
        18,
        6,
      );
      return +fromDecimals(prbt.amount.toString(), 18) * tokenPrice;
    }),
  );

  return pendingRewardsInUSDC.reduce(
    (previous, current) => previous + current,
    0,
  );
};
