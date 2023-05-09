import { EOptimismAddresses } from '../constants/addresses';
import { EChain } from '../constants/chains';
import { fromDecimals, toDecimals } from './utils';
import {
  callContract,
  getCurrentWalletAddress,
  sendTransaction,
  getTokenValueUsingPriceFeedRouter,
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

      return (
        +fromDecimals(balanceOf.vaultBalances[index].toString(), 18) *
        tokenPrice
      );
    }),
  );

  return balancesInUnderlying.reduce(
    (previous, current) => previous + current,
    0,
  );
};

const optimisedFarmInterestApiUrl = 'https://yields.llama.fi/chart/';
export const getOptimisedFarmInterest = async (
  farmAddress,
  apyAddresses,
  chain = EChain.OPTIMISM,
) => {
  const abi = [
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
  ];

  const underlyingVaultsPercents = await callContract(
    abi,
    farmAddress,
    'getUnderlyingVaultsPercents()',
    [],
    chain,
  );

  const underlyingVaultsApys = await Promise.all(
    underlyingVaultsPercents.map(async (underlyingVaultsPercent, index) => {
      const apyJsonResult = await fetch(
        optimisedFarmInterestApiUrl + apyAddresses[index],
      ).then(res => res.json());
      const baseApyData = apyJsonResult.data[apyJsonResult.data.length - 1];

      return baseApyData.apy * (underlyingVaultsPercent.toNumber() / 100);
    }),
  );

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

        return +fromDecimals(vaultBalanceOf.toString(), 18) * tokenValue;
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
