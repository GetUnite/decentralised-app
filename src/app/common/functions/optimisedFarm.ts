import { EOptimismAddresses } from '../constants/addresses';
import { EChain } from '../constants/chains';
import { fromDecimals, toDecimals } from './utils';
import {
  callContract,
  getCurrentWalletAddress,
  sendTransaction,
  getTokenValueUsingPriceFeedRouter,
  getDecimals,
} from './web3Client';
import { EFiatId } from '../constants/utils';

export const depositIntoOptimised = async (
  tokenAddress,
  farmAddress,
  amount,
  decimals,
  chain = EChain.OPTIMISM,
  useBiconomy = false,
) => {
  try {
    const abi = [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'tokenAddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
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

export const withdrawFromOptimised = async (
  tokenAddress,
  farmAddress,
  percentage,
  chain = EChain.OPTIMISM,
  useBiconomy = false,
) => {
  try {
    const abi = [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'tokenAddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'percentage',
            type: 'uint256',
          },
        ],
        name: 'withdraw',
        outputs: [
          {
            internalType: 'uint256',
            name: 'totalTokens',
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
      'withdraw(address,uint256)',
      [tokenAddress, percentage],
      chain,
      useBiconomy,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};

export const getUserOptimisedFarmDepositedAmount = async (
  farmAddress,
  underlyingTokenAddress,
  chain,
) => {
  const abi = [
    {
      inputs: [
        {
          internalType: 'address',
          name: 'user',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          internalType: 'address[]',
          name: 'vaults',
          type: 'address[]',
        },
        {
          internalType: 'uint256[]',
          name: 'vaultBalances',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const balanceOf = await callContract(
    abi,
    farmAddress,
    'balanceOf(address)',
    [getCurrentWalletAddress()],
    chain,
  );

  const fiatId =
    underlyingTokenAddress == EOptimismAddresses.USDC
      ? EFiatId.USD
      : EFiatId.ETH;

  const balancesInUnderlying = await Promise.all(
    balanceOf.vaults.map(async (vault, index) => {
      let tokenPrice;

      tokenPrice = await getTokenValueUsingPriceFeedRouter(
        vault,
        fiatId,
        EChain.OPTIMISM,
      );

      const vaultDecimals = await getDecimals(vault, EChain.OPTIMISM);
      return (
        +fromDecimals(
          balanceOf.vaultBalances[index].toString(),
          vaultDecimals,
        ) * tokenPrice
      );
    }),
  );

  return balancesInUnderlying.reduce(
    (previous, current) => previous + current,
    0,
  );
};

const optimisedFarmInterestApiUrl = 'https://yields.llama.fi/chart/';
const optimisedYearnFarmInterestApiUrl =
  'https://api.yearn.finance/v1/chains/10/vaults/all';
const compoundingApy = (baseApy, rewardApy, fee, vaultPercentage) => {
  const apy =
    Math.pow(
      1 + fee * (Math.pow(1 + baseApy, 1 / 365) - 1 + rewardApy / 365),
      365,
    ) - 1;
  // the 100 cancel each other but it's just to make clear that
  // the first expression needs to be converted into % so * 100
  // the second expressions needs to be converted into decimal so / 100
  return apy * 100 * (vaultPercentage / 100);
};
export const getOptimisedFarmInterest = async (
  farmAddress,
  farmType,
  apyAddresses,
  chain = EChain.OPTIMISM,
) => {
  const abi = [
    {
      inputs: [],
      name: 'getActiveUnderlyingVaults',
      outputs: [
        {
          internalType: 'address[]',
          name: '',
          type: 'address[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getUnderlyingVaultsPercents',
      outputs: [
        {
          internalType: 'uint256[]',
          name: '',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'feeOnYield',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const fee =
    1 -
    (await callContract(abi, farmAddress, 'feeOnYield()', null, chain)) / 10000;

  const underlyingVaultsPercents = await callContract(
    abi,
    farmAddress,
    'getUnderlyingVaultsPercents()',
    [],
    chain,
  );

  // beefy uses defillama pool addresses (which are part of the farm type) to get the apy data
  // yearn uses it's own api to get the apy foreach of the active underlying vaults (which we get from chain)
  let underlyingVaultsApys;
  if (farmType == 'beefy') {
    underlyingVaultsApys = await Promise.all(
      underlyingVaultsPercents.map(async (underlyingVaultsPercent, index) => {
        const apyJsonResult = await fetch(
          optimisedFarmInterestApiUrl + apyAddresses[index],
        ).then(res => res.json());
        const baseApyData = apyJsonResult.data[apyJsonResult.data.length - 1];

        // if there are rewards use the base + rewards to calculate apy
        if (baseApyData.apyReward != null) {
          const base = baseApyData.apyBase / 100;
          const reward = baseApyData.apyReward / 100;

          return compoundingApy(
            base,
            reward,
            fee,
            underlyingVaultsPercent.toNumber(),
          );
        }

        return baseApyData.apy * (underlyingVaultsPercent.toNumber() / 100) * fee;
      }),
    );
  }
  //yearn
  else {
    // gets underlying vaults addresses
    const activeUnderlyingVaults = await callContract(
      abi,
      farmAddress,
      'getActiveUnderlyingVaults()',
      [],
      chain,
    );

    // calls yearn api which returns all vaults at once
    const apyJsonResult = await fetch(optimisedYearnFarmInterestApiUrl).then(
      res => res.json(),
    );

    // for each underlying vault get apy from the json return on the apy call * the vault percentage
    underlyingVaultsApys = activeUnderlyingVaults.map(
      (activeUnderlyingVault, index) => {
        const activeUnderlyingVaultApy = apyJsonResult.find(
          ajr => ajr.address == activeUnderlyingVault,
        ).apy;

        const base =
          activeUnderlyingVaultApy != undefined
            ? activeUnderlyingVaultApy.net_apy
            : 0;
        const reward =
          activeUnderlyingVaultApy != undefined
            ? activeUnderlyingVaultApy.staking_rewards_apr
            : 0;

        return compoundingApy(
          base,
          reward,
          fee,
          underlyingVaultsPercents[index].toNumber(),
        );
      },
    );
  }

  return underlyingVaultsApys.reduce(
    (previous, current) => previous + current,
    0,
  );
};

export const getOptimisedTotalAssetSupply = async (
  farmAddress,
  underlyingTokenAddress,
  chain = EChain.OPTIMISM,
) => {
  try {
    const abi = [
      {
        inputs: [],
        name: 'getActiveUnderlyingVaults',
        outputs: [
          {
            internalType: 'address[]',
            name: '',
            type: 'address[]',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'vaultAddress',
            type: 'address',
          },
        ],
        name: 'getVaultBalanceOf',
        outputs: [
          {
            internalType: 'uint256',
            name: 'total',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const activeUnderlyingVaults = await callContract(
      abi,
      farmAddress,
      'getActiveUnderlyingVaults()',
      [],
      chain,
    );

    const fiatId =
      underlyingTokenAddress == EOptimismAddresses.USDC
        ? EFiatId.USD
        : EFiatId.ETH;

    const underlyingVaultsTVL = await Promise.all(
      activeUnderlyingVaults.map(async underlyingVault => {
        const vaultBalanceOf = await callContract(
          abi,
          farmAddress,
          'getVaultBalanceOf(address)',
          [underlyingVault],
          chain,
        );

        const tokenValue = await getTokenValueUsingPriceFeedRouter(
          underlyingVault,
          fiatId,
          EChain.OPTIMISM,
        );

        const underlyingVaultDecimals = await getDecimals(
          underlyingVault,
          EChain.OPTIMISM,
        );
        return (
          +fromDecimals(vaultBalanceOf.toString(), underlyingVaultDecimals) *
          tokenValue
        );
      }),
    );

    return underlyingVaultsTVL.reduce(
      (previous, current) => previous + current,
      0,
    );
  } catch (error) {
    throw error;
  }
};
