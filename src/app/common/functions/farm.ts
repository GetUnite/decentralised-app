import { ethers } from 'ethers';
import { EEthereumAddresses } from '../constants/addresses';
import { EChain } from '../constants/chains';
import { fromDecimals, roundNumberDown, toDecimals } from './utils';
import {
  callContract,
  getCurrentWalletAddress,
  getPrice,
  sendTransaction
} from './web3Client';

export const withdrawFromBoosterFarm = async (
  farmAddress,
  tokenAddress,
  amount,
  decimals,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  try {
    const abi = [
      {
        inputs: [
          { internalType: 'uint256', name: 'assets', type: 'uint256' },
          { internalType: 'address', name: 'receiver', type: 'address' },
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'address', name: 'exitToken', type: 'address' },
        ],
        name: 'withdrawToNonLp',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const amountInDecimals = toDecimals(amount, decimals);

    const tx = await sendTransaction(
      abi,
      farmAddress,
      'withdrawToNonLp(uint256,address,address,address)',
      [
        amountInDecimals,
        getCurrentWalletAddress(),
        getCurrentWalletAddress(),
        tokenAddress,
      ],
      chain,
      useBiconomy,
    );

    return tx.blockNumber;
  } catch (error) {
    throw error;
  }
};

export const getBoosterFarmPendingRewards = async (farmAddress, chain) => {
  const abi = [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'shareholder',
          type: 'address',
        },
      ],
      name: 'shareholderAccruedRewards',
      outputs: [
        {
          components: [
            {
              internalType: 'address',
              name: 'token',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          internalType: 'struct AlluoVaultUpgradeable.RewardData[]',
          name: '',
          type: 'tuple[]',
        },
        {
          components: [
            {
              internalType: 'address',
              name: 'token',
              type: 'address',
            },
            {
              internalType: 'uint256',
              name: 'amount',
              type: 'uint256',
            },
          ],
          internalType: 'struct IAlluoPool.RewardData[]',
          name: '',
          type: 'tuple[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const shareholderAccruedRewards = await callContract(
    abi,
    farmAddress,
    'shareholderAccruedRewards(address)',
    [getCurrentWalletAddress()],
    chain,
  );

  let pendingRewardsByToken = [];
  for (const pendingRewardsArray of shareholderAccruedRewards) {
    for (const pendingRewards of pendingRewardsArray) {
      const rewardByToken = pendingRewardsByToken.find(
        prbt => prbt.token == pendingRewards.token,
      );  
      if (rewardByToken) {
        rewardByToken.amount = rewardByToken.amount.add(pendingRewards.amount);
      } else {
        pendingRewardsByToken.push({
          token: pendingRewards.token,
          amount: pendingRewards.amount,
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
      return +ethers.utils.formatUnits(prbt.amount.toString(), 18) * tokenPrice;
    }),
  );

  return pendingRewardsInUSDC.reduce(
    (previous, current) => previous + current,
    0,
  );
};

export const getBoosterFarmRewards = async (
  farmAddress,
  valueOf1LPinUSDC,
  chain,
) => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'earned',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const value = await callContract(
    abi,
    farmAddress,
    'earned(address)',
    [getCurrentWalletAddress()],
    chain,
  );

  const valueAmountInDecimals = fromDecimals(value, 18);

  const stableValue = +valueAmountInDecimals * valueOf1LPinUSDC;

  return {
    value: roundNumberDown(valueAmountInDecimals, 8),
    stableValue: stableValue,
  };
};

export const convertFromUSDC = async (tokenAddress, decimals, valueInUSDC) => {
  if (tokenAddress == EEthereumAddresses.USDC) {
    return valueInUSDC;
  }
  const tokenPrice = await getPrice(
    EEthereumAddresses.USDC,
    tokenAddress,
    6,
    decimals,
  );

  return valueInUSDC * tokenPrice;
};

export const convertToLP = async (
  value,
  tokenAddress,
  decimals,
  valueOf1LPinUSDC,
) => {
  const usdcPrice = await getPrice(
    tokenAddress,
    EEthereumAddresses.USDC,
    decimals,
    6,
  );
  return (usdcPrice * value) / valueOf1LPinUSDC;
};
