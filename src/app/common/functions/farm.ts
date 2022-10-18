import { callContract, getCurrentWalletAddress, getTokenUSDCPrice } from './web3Client';

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
        const rewardByToken = pendingRewardsByToken.find(prbt => prbt.token == pendingRewards.token);
      if (rewardByToken) {
        rewardByToken.amount+=
          pendingRewards.amount.toNumber();
      } else {
        pendingRewardsByToken.push({token: pendingRewards.token, amount: 0});
      }
    }
  }

  const pendingRewardsInUSDC = await pendingRewardsByToken.reduce(async (prev,curr) => {
    console.log(prev, curr.amount, await getTokenUSDCPrice(curr.token))
    return prev.amount + curr.amount *  await getTokenUSDCPrice(curr.token);
  });

  return pendingRewardsInUSDC;
};
