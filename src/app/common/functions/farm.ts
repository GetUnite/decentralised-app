import { EChain } from '../constants/chains';
import { fromDecimals, toDecimals } from './utils';
import {
    callContract,
    getCurrentWalletAddress,
    getTokenUSDCPrice,
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

  let shareholderAccruedRewards = await callContract(
    abi,
    farmAddress,
    'shareholderAccruedRewards(address)',
    [getCurrentWalletAddress()],
    chain,
  );

shareholderAccruedRewards = [
    [
      {
        token: '0xd533a949740bb3306d119cc777fa900ba034cd52',
        amount: '478075760298449',
      },
    ],
    [
      {
        token: '0xd533a949740bb3306d119cc777fa900ba034cd52',
        amount: '0',
      },
      {
        token: '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b',
        amount: '0',
      },
    ],
  ];

  let pendingRewardsByToken = [];
  for (const pendingRewardsArray of shareholderAccruedRewards) {
    for (const pendingRewards of pendingRewardsArray) {
      const rewardByToken = pendingRewardsByToken.find(
        prbt => prbt.token == pendingRewards.token,
      );
      if (rewardByToken) {
        rewardByToken.amount += pendingRewards.amount;
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
      const tokenPrice = await getTokenUSDCPrice(prbt.token);
      return +fromDecimals(prbt.amount, 18) * tokenPrice;
    }),
  );
  console.log(pendingRewardsInUSDC);

  return pendingRewardsInUSDC.reduce(
    (previous, current) => previous + current,
    0,
  );
};
