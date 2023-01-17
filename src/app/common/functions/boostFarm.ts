import { EEthereumAddresses } from '../constants/addresses';
import { EChain } from '../constants/chains';
import { fromDecimals, toDecimals, toExactFixed } from './utils';
import {
  callContract,
  getCurrentWalletAddress,
  getPrice,
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

    return tx.blockNumber;
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
    stableValue: toExactFixed(stableValue,2)
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

const boosterFarmInterestApiUrl = 'https://yields.llama.fi/chart/';
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
    boosterFarmInterestApiUrl + apyFarmAddresses.baseApyAddress,
  ).then(res => res.json());
  const baseApyData = baseApyJsonResult.data[baseApyJsonResult.data.length - 1];

  const boostApyJsonResult = await fetch(
    boosterFarmInterestApiUrl + apyFarmAddresses.boostApyAddress,
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
