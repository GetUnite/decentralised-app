import { ethers } from 'ethers';
import moment from 'moment';
import { EEthereumAddresses } from '../constants/addresses';
import { EChain } from '../constants/chains';
import { fromDecimals, toDecimals, toExactFixed } from './utils';
import {
  callContract,
  callStatic,
  getCurrentWalletAddress,
  getPrice,
  getReadOnlyProvider,
  QueryFilter,
  sendTransaction
} from './web3Client';

export const depositIntoBoostFarm = async (
  farmAddress,
  tokenAddress,
  amount,
  decimals,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  const abi = [
    {
      inputs: [
        { internalType: 'uint256', name: 'assets', type: 'uint256' },
        { internalType: 'address', name: 'entryToken', type: 'address' },
      ],
      name: 'depositWithoutLP',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const amountInDecimals = toDecimals(amount, decimals);

  const tx = await sendTransaction(
    abi,
    farmAddress,
    'depositWithoutLP(uint256,address)',
    [amountInDecimals, tokenAddress],
    chain,
    useBiconomy,
  );

  return tx;
};

export const withdrawFromBoostFarm = async (
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

    return tx;
  } catch (error) {
    throw error;
  }
};

export const unlockFromLockedBoostFarm = async (
  farmAddress,
  amount,
  decimals,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  try {
    const abi = [
      {
        inputs: [
          {
            internalType: 'uint256',
            name: 'assets',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
        ],
        name: 'withdraw',
        outputs: [
          {
            internalType: 'uint256',
            name: 'shares',
            type: 'uint256',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const amountInDecimals = toDecimals(amount, decimals);

    const tx = await sendTransaction(
      abi,
      farmAddress,
      'withdraw(uint256,address,address)',
      [amountInDecimals, getCurrentWalletAddress(), getCurrentWalletAddress()],
      chain,
      useBiconomy,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};

export const withdrawFromLockedBoostFarm = async (
  farmAddress,
  tokenAddress,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  try {
    const abi = [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'exitToken',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'receiver',
            type: 'address',
          },
        ],
        name: 'claim',
        outputs: [
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const tx = await sendTransaction(
      abi,
      farmAddress,
      'claim(address,address)',
      [tokenAddress, getCurrentWalletAddress()],
      chain,
      useBiconomy,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};

export const getBoostFarmPendingRewards = async (farmAddress, chain) => {
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

  let shareholderAccruedRewards = await callContract(
    abi,
    farmAddress,
    'shareholderAccruedRewards(address)',
    [getCurrentWalletAddress()],
    chain,
  );

  let pendingRewardsByToken = [];
  if (shareholderAccruedRewards != undefined) {
    for (const pendingRewardsArray of shareholderAccruedRewards) {
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

export const getBoostFarmRewards = async (
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
    value: toExactFixed(valueAmountInDecimals, 8),
    stableValue: toExactFixed(stableValue, 2),
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

export const getMaximumLPValueAsToken = async (
  farmAddress,
  tokenAddress,
  tokenDecimals,
  amount,
  isLocked = false,
) => {
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
    {
      inputs: [
        {
          internalType: 'address',
          name: 'exitToken',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'receiver',
          type: 'address',
        },
      ],
      name: 'claim',
      outputs: [
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const amountInDecimals = toDecimals(amount, 18);

  let valueInDecimals;
  if (isLocked) {
    valueInDecimals = await callStatic(
      abi,
      farmAddress,
      'claim(address,address)',
      [tokenAddress, getCurrentWalletAddress()],
    );
  } else {
    valueInDecimals = await callStatic(
      abi,
      farmAddress,
      'withdrawToNonLp(uint256,address,address,address)',
      [
        amountInDecimals,
        getCurrentWalletAddress(),
        getCurrentWalletAddress(),
        tokenAddress,
      ],
    );
  }

  const value = fromDecimals(valueInDecimals, tokenDecimals);

  return value;
};

export const convertToLP = async (
  value,
  tokenAddress,
  decimals,
  valueOf1LPinUSDC,
) => {
  let usdcPrice = 1;
  // the value already comes as usdc
  if (tokenAddress != EEthereumAddresses.USDC) {
    usdcPrice = await getPrice(
      tokenAddress,
      EEthereumAddresses.USDC,
      decimals,
      6,
    );
  }
  return (usdcPrice * value) / valueOf1LPinUSDC;
};

const boostFarmInterestApiUrl = 'https://yields.llama.fi/chart/';
export const getBoostFarmInterest = async (
  farmVaultAddress,
  apyFarmAddresses,
  chain,
) => {
  const abi = [
    {
      inputs: [],
      name: 'adminFee',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const fee =
    1 -
    (await callContract(abi, farmVaultAddress, 'adminFee()', null, chain)) /
      10000;

  const baseApyJsonResult = await fetch(
    boostFarmInterestApiUrl + apyFarmAddresses.baseApyAddress,
  ).then(res => res.json());
  const baseApyData = baseApyJsonResult.data[baseApyJsonResult.data.length - 1];

  const boostApyJsonResult = await fetch(
    boostFarmInterestApiUrl + apyFarmAddresses.boostApyAddress,
  ).then(res => res.json());
  const boostApyData =
    boostApyJsonResult.data[boostApyJsonResult.data.length - 1];

  const baseApy = baseApyData.apyBase / 100;
  const boostApy = boostApyData.apyBase / 100;
  const baseRewardsAPR = baseApyData.apyReward / 100;
  const boostRewardsAPR = boostApyData.apyReward / 100;

  return (
    (baseApy +
      baseRewardsAPR *
        fee *
        (1 + boostApy) *
        Math.pow(1 + boostRewardsAPR / 52, 52)) *
    100
  );
};

export const claimBoostFarmLPRewards = async (
  farmAddress,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  try {
    const abi = [
      {
        inputs: [],
        name: 'claimRewards',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const tx = await sendTransaction(
      abi,
      farmAddress,
      'claimRewards()',
      [],
      chain,
      useBiconomy,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};

export const claimBoostFarmNonLPRewards = async (
  farmAddress,
  tokenAddress,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  try {
    const abi = [
      {
        inputs: [
          { internalType: 'address', name: 'exitToken', type: 'address' },
        ],
        name: 'claimRewardsInNonLp',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const tx = await sendTransaction(
      abi,
      farmAddress,
      'claimRewardsInNonLp(address)',
      [tokenAddress],
      chain,
      useBiconomy,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};

export const claimLockedBoostFarmRewards = async (
  farmAddress,
  tokenAddress,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  try {
    const abi = [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'exitToken',
            type: 'address',
          },
        ],
        name: 'claimRewards',
        outputs: [
          {
            internalType: 'uint256',
            name: 'rewardTokens',
            type: 'uint256',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const tx = await sendTransaction(
      abi,
      farmAddress,
      'claimRewards(address)',
      [tokenAddress],
      chain,
      useBiconomy,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};

export const getLockedBoostWithdrawalsInfo = async (farmAddress, chain) => {
  const abi = [
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'userWithdrawals',
      outputs: [
        {
          internalType: 'uint256',
          name: 'withdrawalRequested',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'withdrawalAvailable',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const userWithdrawals = await callContract(
    abi,
    farmAddress,
    'userWithdrawals(address)',
    [getCurrentWalletAddress()],
    chain,
  );

  const unlockingBalance = +ethers.utils.formatEther(
    userWithdrawals.withdrawalRequested,
  );
  return {
    unlockedBalance: +ethers.utils.formatEther(
      userWithdrawals.withdrawalAvailable,
    ),
    unlockingBalance,
    isUnlocking: unlockingBalance > 0,
  };
};

export const getLastHarvestDateTimestamp = async (farmAddress, chain) => {
  var startFirstTimer = performance.now()
  const abi = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'uint256',
          name: 'timestamp',
          type: 'uint256',
        },
      ],
      name: 'Looped',
      type: 'event',
    },
  ];
  const EthDater = require('ethereum-block-by-date');
  const provider = await getReadOnlyProvider(chain);
  // Always start the search at the last sunday at 12pm
  const sunday = moment().startOf('week').set('hour', 12);
  let block = await new EthDater(
    provider, // Ethers provider, required.
  ).getDate(
    sunday, // Date, required. Any valid moment.js value: string, milliseconds, Date() object, moment() object.
    true, // Block after, optional. Search for the nearest block before or after the given date. By default true.
    false, // Refresh boundaries, optional. Recheck the latest block before request. By default false.
  );
  let toBlock = block.block + 5000;
  let fromBlock = block.block;
  // this is the last block we will check. 
  // swap with toBlock + average amount by day to check from sunday to monday and give up
  const lastBlock = await provider.getBlockNumber();

  let looped = [];
  while (looped.length == 0) {
    looped = await QueryFilter(
      abi,
      farmAddress,
      'Looped',
      [],
      fromBlock,
      chain,
      toBlock,
    );
    fromBlock = toBlock;
    toBlock = toBlock + 5000 > lastBlock ? lastBlock : toBlock + 5000;
  }
  return looped[0].args[0].toNumber();
};

export const unlockUserFunds = async (
  farmAddress,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  try {
    const abi = [
      {
        inputs: [],
        name: 'unlockUserFunds',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const tx = await sendTransaction(
      abi,
      farmAddress,
      'unlockUserFunds()',
      [],
      chain,
      useBiconomy,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};
