import { EOptimismAddresses } from '../constants/addresses';
import { EChain } from '../constants/chains';
import { fromDecimals, toDecimals } from './utils';
import {
  callContract,
  getCurrentWalletAddress,
  sendTransaction,
  getTokenAmountValueUsingPriceFeedRouter,
} from './web3Client';
import { EFiatId } from '../constants/utils';
import { ethers } from 'ethers';

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
        stateMutability: 'payable',
        type: 'function',
      },
    ];

    const amountInDecimals = toDecimals(amount, decimals);

    const tx = await sendTransaction(
      abi,
      farmAddress,
      'deposit(address,uint256)',
      [
        tokenAddress == EOptimismAddresses.ETH
          ? ethers.constants.AddressZero // this is native
          : tokenAddress,
        amountInDecimals,
      ],
      chain,
      useBiconomy,
      tokenAddress == EOptimismAddresses.ETH ? +amountInDecimals : undefined,
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
      [
        tokenAddress == EOptimismAddresses.ETH
          ? ethers.constants.AddressZero
          : tokenAddress,
        percentage,
      ],
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
      const amountInDecimals = balanceOf.vaultBalances[index].toString();

      const tokenAmountValue =
        +amountInDecimals > 0
          ? await getTokenAmountValueUsingPriceFeedRouter(
            vault,
            balanceOf.vaultBalances[index].toString(),
            fiatId,
            EChain.OPTIMISM,
          )
          : 0;

      return tokenAmountValue;
    }),
  );

  return balancesInUnderlying.reduce(
    (previous, current) => previous + current,
    0,
  );
};

const optimisedYearnFarmInterestApiUrl =
  'https://ydaemon.yearn.fi/10/vaults/all';
const optimisedBeefyFarmInterestApiUrl = 'https://api.beefy.finance/';

const compoundingApy = (baseApy, rewardApy, fee, vaultPercentage) => {
  const apy =
    Math.pow(
      1 + fee * (Math.pow(1 + baseApy, 1 / 365) - 1 + rewardApy / 365),
      365,
    ) - 1;
  // the 100 cancel each other but it's just to make clear that
  // the first expression needs to be converted into % so * 100
  // the second expressions needs to be converted into decimal so / 100
  return apy * 100 * (vaultPercentage / 10000);
};

export const getOptimisedFarmInterest = async (
  farmAddress,
  farmType,
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

  // gets underlying vaults addresses
  const activeUnderlyingVaults = await callContract(
    abi,
    farmAddress,
    'getActiveUnderlyingVaults()',
    [],
    chain,
  );

  let beefyVaults = [];
  let yearnVaults = [];
  let beefyVaultsApys = [];

  const vaultsJsonResult = await fetch(
    farmType == 'beefy'
      ? optimisedBeefyFarmInterestApiUrl + 'vaults'
      : optimisedYearnFarmInterestApiUrl,
  ).then(res => res.json());

  if (farmType == 'beefy') {
    beefyVaults = vaultsJsonResult;

    const beefyVaultsApysJsonResult = await fetch(
      optimisedBeefyFarmInterestApiUrl + 'apy',
    ).then(res => res.json());

    beefyVaultsApys = beefyVaultsApysJsonResult;
  } else {
    yearnVaults = vaultsJsonResult;
  }

  // for each underlying vault get apy from the json return on the apy call * the vault percentage
  const underlyingVaultsApys = await Promise.all(
    activeUnderlyingVaults.map(async (activeUnderlyingVault, index) => {
      let activeUnderlyingVaultInfo;
      let baseApy;
      let rewardsApy;
      if (farmType == 'beefy') {
        activeUnderlyingVaultInfo = beefyVaults.find(
          ajr => ajr.earnedTokenAddress == activeUnderlyingVault,
        );

        const vaultId = activeUnderlyingVaultInfo.id;

        return (
          beefyVaultsApys[vaultId] *
          fee *
          underlyingVaultsPercents[index].toNumber() / 100
        );
        // These lines will be for compounding when we figure out how to get boost % from beefy
        const activeUnderlyingVaultApyBreakdown = beefyVaultsApys[vaultId];

        baseApy = activeUnderlyingVaultApyBreakdown.net_apy;
        rewardsApy = activeUnderlyingVaultApyBreakdown.staking_rewards_apr;
      } else {
        activeUnderlyingVaultInfo = yearnVaults.find(
          ajr => ajr.address == activeUnderlyingVault,
        );

        const activeUnderlyingVaultApy = activeUnderlyingVaultInfo.apy;
        baseApy = activeUnderlyingVaultApy.net_apy;
        rewardsApy = activeUnderlyingVaultApy.staking_rewards_apr;
      }

      return compoundingApy(
        baseApy,
        rewardsApy,
        fee,
        underlyingVaultsPercents[index].toNumber(),
      );
    }),
  );

  return underlyingVaultsApys.reduce(
    (previous, current) => previous + current,
    0,
  );
};

export const getOptimisedTotalAssetSupply = async (
  farmAddress,
  fiatId,
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

    const underlyingVaultsTVL = await Promise.all(
      activeUnderlyingVaults.map(async underlyingVault => {
        const vaultBalanceOf = await callContract(
          abi,
          farmAddress,
          'getVaultBalanceOf(address)',
          [underlyingVault],
          chain,
        );

        const amountInDecimals = vaultBalanceOf.toString();

        const tokenAmountValue =
          +amountInDecimals > 0
            ? await getTokenAmountValueUsingPriceFeedRouter(
              underlyingVault,
              amountInDecimals,
              fiatId,
              EChain.OPTIMISM,
            )
            : 0;

        return tokenAmountValue;
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
