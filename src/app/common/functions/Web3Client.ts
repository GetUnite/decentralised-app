import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/ethereum-provider';
import { Biconomy } from '@biconomy/mexa';
import polygonIbAlluoUSDAbi from 'app/common/abis/polygonIbAlluoUSD.json';
import polygonIbAlluoEURAbi from 'app/common/abis/polygonIbAlluoEUR.json';
import polygonIbAlluoETHAbi from 'app/common/abis/polygonIbAlluoETH.json';
import polygonIbAlluoBTCAbi from 'app/common/abis/polygonIbAlluoBTC.json';
import ethereumIbAlluoUSDAbi from 'app/common/abis/ethereumIbAlluoUSD.json';
import ethereumIbAlluoEURAbi from 'app/common/abis/ethereumIbAlluoEUR.json';
import ethereumIbAlluoETHAbi from 'app/common/abis/ethereumIbAlluoETH.json';
import ethereumIbAlluoBTCAbi from 'app/common/abis/ethereumIbAlluoBTC.json';
import polygonHandlerAbi from 'app/common/abis/polygonHandler.json';
import { TTokenInfo } from 'app/common/state/atoms';
import { fromDecimals, maximumUint256Value, toDecimals } from './utils';
import Onboard from '@web3-onboard/core';
import gnosisModule from '@web3-onboard/gnosis';
import coinbaseWalletModule from '@web3-onboard/coinbase';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import {
  EEthereumAddresses,
  EPolygonAddresses,
} from 'app/common/constants/addresses';
import logo from 'app/modernUI/images/logo.svg';

const ethereumTestnetProviderUrl = 'https://rpc.sepolia.org';
const ethereumMainnetProviderUrl =
  'https://eth-mainnet.g.alchemy.com/v2/BQ85p2q56v_fKcKachiDuBCdmpyNCWZr';
const ethereumProviderUrl =
  process.env.REACT_APP_NET === 'mainnet'
    ? ethereumMainnetProviderUrl
    : ethereumTestnetProviderUrl;

const polygonTestnetProviderUrl =
  'https://polygon-mumbai.g.alchemy.com/v2/AyoeA90j3ZUTAePwtDKNWP24P7F67LzM';
const polygonMainnetProviderUrl = 'https://polygon-rpc.com/';
const polygonProviderUrl =
  process.env.REACT_APP_NET === 'mainnet'
    ? polygonMainnetProviderUrl
    : polygonTestnetProviderUrl;

export enum EChain {
  ETHEREUM,
  POLYGON,
}

export enum EChainId {
  ETH_MAINNET = '0x1',
  ETH_SEPOLIA = '0xaa36a7',
  POL_MAINNET = '0x89',
  POL_MUMBAI = '0x13881',
}

const injected = injectedModule();
const walletConnect = walletConnectModule({
  qrcodeModalOptions: {
    mobileLinks: [
      'rainbow',
      'metamask',
      'argent',
      'trust',
      'imtoken',
      'pillar',
    ],
  },
});
const gnosis = gnosisModule();
const coinbase = coinbaseWalletModule();

const chains = [
  {
    id: EChainId.ETH_MAINNET,
    token: 'ETH',
    label: 'Ethereum Mainnet',
    rpcUrl: ethereumMainnetProviderUrl,
  },
  {
    id: EChainId.ETH_SEPOLIA,
    token: 'ETH',
    label: 'Ethereum Sepolia',
    rpcUrl: ethereumTestnetProviderUrl,
  },
  {
    id: EChainId.POL_MAINNET,
    token: 'MATIC',
    label: 'Matic Mainnet',
    rpcUrl: polygonMainnetProviderUrl,
  },
  {
    id: EChainId.POL_MUMBAI,
    token: 'MATIC',
    label: 'Matic Mumbai',
    rpcUrl: polygonTestnetProviderUrl,
  },
];

const onboard = Onboard({
  wallets: [],
  chains: chains,
  appMetadata: {
    name: 'Alluo',
    icon: logo,
    description: 'A description here',
    recommendedInjectedWallets: [
      { name: 'MetaMask', url: 'https://metamask.io' },
    ],
  },
  accountCenter: {
    desktop: {
      enabled: false,
    },
    mobile: {
      enabled: false,
    },
  },
});

onboard.state.actions.setWalletModules([
  injected,
  walletConnect,
  gnosis,
  coinbase,
]);

declare let window: any;

const permitOnlyTokenAddresses = [
  '0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c',
  //'0x4bf7737515EE8862306Ddc221cE34cA9d5C91200',
];

const usesNoncesAddresses = [
  //mumbai
  '0xB579C5ba3Bc8EA2F5DD5622f1a5EaC6282516fB1', //tUSDC
  '0x4bf7737515EE8862306Ddc221cE34cA9d5C91200', //tjEUR
  '0x8EE1eDEE93B10e9b02628254eBd610D6b42020A8', //wETH
  //mainnet
  '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
  '0x4e3Decbb3645551B8A19f0eA1678079FCB33fB4c', // jEUR
];

let walletAddress;
let web3: WalletConnectProvider | any;

export const connectToWallet = async (connectOptions?) => {
  let wallets;

  wallets = await onboard.connectWallet(connectOptions);

  if (wallets[0]) {
    web3 = new Web3(wallets[0].provider as any);
    walletAddress = wallets[0].accounts[0].address;
    return walletAddress;
  }
};

const gnosisLabel = 'Gnosis Safe';
const onboardState = onboard.state.get();
console.log(onboardState);
if (
  onboardState.walletModules.find(
    walletModule => walletModule.label == gnosisLabel,
  )
) {
  connectToWallet({
    autoSelect: { label: gnosisLabel, disableModals: true },
  });
}

export const changeNetwork = async (chain: EChain) => {
  let chainId;

  if (chain === EChain.ETHEREUM) {
    chainId =
      process.env.REACT_APP_NET === 'mainnet'
        ? EChainId.ETH_MAINNET
        : EChainId.ETH_SEPOLIA;
  }

  if (chain === EChain.POLYGON) {
    chainId = chainId =
      process.env.REACT_APP_NET === 'mainnet'
        ? EChainId.POL_MAINNET
        : EChainId.POL_MUMBAI;
  }

  const success = await onboard.setChain({ chainId: chainId });

  return { success, chainId };
};

export const getChainById = chainId => {
  return chainId === EChainId.POL_MAINNET || chainId === EChainId.POL_MUMBAI
    ? EChain.POLYGON
    : chainId === EChainId.ETH_MAINNET || chainId === EChainId.ETH_SEPOLIA
    ? EChain.ETHEREUM
    : null;
};

export const onWalletUpdated = async callback => {
  const wallets = onboard.state.select('wallets');
  wallets.subscribe(wallets => {
    if (wallets[0]) {
      walletAddress = wallets[0].accounts[0].address;
      callback(wallets[0].chains[0].id, wallets[0].accounts[0].address);
    }
  });
};

export const getCurrentChainId = async () => {
  const state = onboard.state.get();

  if (state.wallets[0]?.chains[0]) {
    return state.wallets[0].chains[0].id;
  }
};

export const getChainNameById = chainId => {
  return chains.find(chain => chain.id == chainId).label;
};

export const startOrGetBiconomy = async (chain, provider) => {
  try {
    const biconomy = new Biconomy(provider, {
      apiKey:
        chain === EChain.ETHEREUM
          ? process.env.REACT_APP_ETHEREUM_BICONOMY_KEY
          : process.env.REACT_APP_POLYGON_BICONOMY_KEY,
    });

    await waitForBiconomyReady(biconomy);

    return biconomy;
  } catch (error) {
    console.log(error);
  }
};

const waitForBiconomyReady = biconomy =>
  new Promise<void>(resolve => {
    biconomy
      .onEvent(biconomy.READY, () => {
        resolve();
      })
      .onEvent(biconomy.ERROR, error => {
        console.log(error);
      });
  });

const sendTransaction = async (
  abi,
  address,
  functionSignature,
  params,
  chain,
  useBiconomy = false,
) => {
  let web3ToUse;

  if (useBiconomy) {
    const biconomy = await startOrGetBiconomy(chain, web3.eth.currentProvider);
    web3ToUse = new Web3(biconomy);
  } else {
    web3ToUse = web3;
  }

  const contract = new web3ToUse.eth.Contract(abi as any, address);

  try {
    const method = contract.methods[functionSignature].apply(null, params);
    const tx = await method.send({
      from: walletAddress,
    });

    return tx;
  } catch (error) {
    console.log(error);
    if (error.code == 4001) {
      throw 'User denied message signature';
    }

    if (error.includes('reverted by EVM')) {
      throw 'Transaction has been reverted by the EVM';
    }

    throw 'Something went wrong with your transaction. Please try again';
  }
};

const callContract = async (abi, address, functionSignature, params, chain) => {
  const provider =
    chain === EChain.ETHEREUM ? ethereumProviderUrl : polygonProviderUrl;
  const web3ToUse = new Web3(new Web3.providers.HttpProvider(provider));
  const contract = new web3ToUse.eth.Contract(abi as any, address);

  try {
    const method = contract.methods[functionSignature].apply(null, params);
    const tx = await method.call({
      from: walletAddress,
    });

    return tx;
  } catch (error) {
    console.log(abi, address, functionSignature, params);
    // here do all error handling to readable stuff
    console.log(error);
  }
};

let alluoPriceInstance;

const alluoPriceUrl =
  process.env.REACT_APP_NET === 'mainnet'
    ? 'https://protocol-mainnet.gnosis.io/api'
    : 'https://protocol-mainnet.dev.gnosisdev.com/api';

export const getAlluoPrice = async (): Promise<number> => {
  const pathforUSDC =
    alluoPriceUrl +
    `/v1/markets/${EEthereumAddresses.ALLUO}-${EEthereumAddresses.USDC}/sell/1000000000000000000`;

  const usdcPrice = await fetch(pathforUSDC).then(res => res.json());

  alluoPriceInstance = +fromDecimals(usdcPrice.amount, 6);
  return alluoPriceInstance;
};

export const getAlluoPriceInWETH = async (value = 1): Promise<string> => {
  const valueInDecimals = toDecimals(value, 18);

  const pathforWETH =
    alluoPriceUrl +
    `/v1/markets/${EEthereumAddresses.WETH}-${EEthereumAddresses.ALLUO}/sell/${valueInDecimals}`;

  const wethPriceObj = await fetch(pathforWETH).then(res => res.json());
  const wethPrice = wethPriceObj?.amount || 0;

  return fromDecimals(wethPrice, 18);
};

const toAlluoValue = (alluoValueInWei): string =>
  alluoValueInWei ? Web3.utils.fromWei(alluoValueInWei) : '';

export const alluoToUsd = async alluoValueInWei => {
  const alluoPrice = alluoPriceInstance;
  return +(+toAlluoValue(alluoValueInWei) * alluoPrice);
};

export const usdToAlluo = async usd => {
  const alluoPrice = alluoPriceInstance;
  const alluoBalance = usd / alluoPrice;
  const alluoBalanceInBN = Web3.utils.toBN(alluoBalance);
  const alluoBalanceInWei = Web3.utils.toWei(alluoBalanceInBN.toString());

  return alluoBalanceInWei;
};

export const calculateApr = async (rewardPerDistribution, totalLockedInLP) => {
  const alluoPrice = alluoPriceInstance;
  if (!alluoPrice) return 0;

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

  const totalLockedLPToAlluo = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'convertLpToAlluo(uint256)',
    [totalLockedInLP],
    EChain.ETHEREUM,
  );

  const exactApr =
    ((+Web3.utils.fromWei(rewardPerDistribution) * alluoPrice) /
      (+Web3.utils.fromWei(totalLockedLPToAlluo) * alluoPrice)) *
    100 *
    365;

  return +exactApr.toFixed(2);
};

export const isExpectedPolygonEvent = (type, depositAddress) => {
  const ibAlluoAddress = getIbAlluoAddress(type);
  return depositAddress.toLowerCase() === ibAlluoAddress.toLowerCase();
};

export const approveAlluoTransaction = async alluoAmount => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: 'spender', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const alluoAmountInWei =
    alluoAmount === maximumUint256Value
      ? maximumUint256Value
      : Web3.utils.toWei(String(alluoAmount));

  const tx = await sendTransaction(
    abi,
    EEthereumAddresses.ALLUO,
    'approve(address,uint256)',
    [EEthereumAddresses.VLALLUO, alluoAmountInWei],
    EChain.ETHEREUM,
  );

  return tx;
};

export const lockAlluoToken = async alluoAmount => {
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

  const alluoAmountInWei = Web3.utils.toWei(String(alluoAmount));

  const tx = await sendTransaction(
    abi,
    ethereumVlAlluoAddress,
    'lock(uint256)',
    [alluoAmountInWei],
    EChain.ETHEREUM,
  );

  return tx;
};

export const getBalanceOfAlluoUser = async () => {
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
    [walletAddress],
    EChain.ETHEREUM,
  );

  return Web3.utils.fromWei(balance);
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

  const alluoAmountInWei = Web3.utils.toWei(value + '');

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
    null,
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
    null,
    EChain.ETHEREUM,
  );

  return tx;
};

export const getSupportedTokensList = async (
  type = 'usd',
  chain = EChain.POLYGON,
) => {
  try {
    const abi = [
      {
        inputs: [],
        name: 'getListSupportedTokens',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const ibAlluoAddress = getIbAlluoAddress(type, chain);

    const supportedTokenAddressesList = await callContract(
      abi,
      ibAlluoAddress,
      'getListSupportedTokens()',
      null,
      chain,
    );

    const supportedTokensWithBasicInfo = [];

    const requests = supportedTokenAddressesList.map(async tokenAddress => {
      const info = await getSupportedTokensBasicInfo(tokenAddress, chain);
      supportedTokensWithBasicInfo.push(info);
    });

    await Promise.allSettled(requests);

    supportedTokensWithBasicInfo.sort((a, b) => b.balance - a.balance);

    return supportedTokensWithBasicInfo;
  } catch (error) {
    console.log(error);
  }
};

export const getListSupportedTokens = async (
  type = 'usd',
  chain = EChain.POLYGON,
) => {
  try {
    const abi = [
      {
        inputs: [],
        name: 'getListSupportedTokens',
        outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const ibAlluoAddress = getIbAlluoAddress(type, chain);

    const supportedTokenList = await callContract(
      abi,
      ibAlluoAddress,
      'getListSupportedTokens()',
      null,
      chain,
    );

    const tokensWithInfo = [];

    const requests = supportedTokenList.map(async tokenAddress => {
      const info = await getStableCoinInfo(tokenAddress, type, chain);
      tokensWithInfo.push(info);
    });

    await Promise.allSettled(requests);

    tokensWithInfo.sort((a, b) => b.balance - a.balance);

    return tokensWithInfo;
  } catch (error) {
    console.log(error);
  }
};

const getIbAlluoAbi = (type, chain = EChain.POLYGON) => {
  let abi;
  switch (chain) {
    case EChain.POLYGON:
      abi = {
        usd: polygonIbAlluoUSDAbi as any,
        eur: polygonIbAlluoEURAbi as any,
        eth: polygonIbAlluoETHAbi as any,
        btc: polygonIbAlluoBTCAbi as any,
      };
      break;

    case EChain.ETHEREUM:
      abi = {
        usd: ethereumIbAlluoUSDAbi as any,
        eur: ethereumIbAlluoEURAbi as any,
        eth: ethereumIbAlluoETHAbi as any,
        btc: ethereumIbAlluoBTCAbi as any,
      };
      break;
    default:
      break;
  }
  return abi[type];
};

const getIbAlluoAddress = (type, chain = EChain.POLYGON) => {
  let VLALLUOAddr;
  switch (chain) {
    case EChain.POLYGON:
      VLALLUOAddr = {
        usd: EPolygonAddresses.IBALLUOUSD,
        eur: EPolygonAddresses.IBALLUOEUR,
        eth: EPolygonAddresses.IBALLUOETH,
        btc: EPolygonAddresses.IBALLUOBTC,
      };
      break;

    case EChain.ETHEREUM:
      VLALLUOAddr = {
        usd: EEthereumAddresses.IBALLUOUSD,
        eur: EEthereumAddresses.IBALLUOEUR,
        eth: EEthereumAddresses.IBALLUOETH,
        btc: EEthereumAddresses.IBALLUOBTC,
      };
      break;
    default:
      break;
  }

  return VLALLUOAddr[type];
};

export const getSupportedTokensBasicInfo = async (
  tokenAddress,
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      inputs: [],
      name: 'symbol',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'decimals',
      outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const symbol = await callContract(abi, tokenAddress, 'symbol()', null, chain);

  const decimals = await callContract(
    abi,
    tokenAddress,
    'decimals()',
    null,
    chain,
  );

  return {
    tokenAddress,
    symbol,
    decimals,
  };
};

export const getSupportedTokensAdvancedInfo = async (
  supportedToken,
  type,
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
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

  const balance = await callContract(
    abi,
    supportedToken.tokenAddress,
    'balanceOf(address)',
    [walletAddress],
    chain,
  );

  const ibAlluoAddress = getIbAlluoAddress(type, chain);

  const allowance = await callContract(
    abi,
    supportedToken.tokenAddress,
    'allowance(address,address)',
    [walletAddress, ibAlluoAddress],
    chain,
  );

  return {
    balance: fromDecimals(balance, supportedToken.decimals),
    allowance: fromDecimals(allowance, supportedToken.deciamls),
  };
};

export const getStableCoinInfo = async (
  tokenAddress,
  type,
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'decimals',
      outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
      stateMutability: 'view',
      type: 'function',
    },
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

  const symbol = await callContract(abi, tokenAddress, 'symbol()', null, chain);

  const decimals = await callContract(
    abi,
    tokenAddress,
    'decimals()',
    null,
    chain,
  );

  const balance = await callContract(
    abi,
    tokenAddress,
    'balanceOf(address)',
    [walletAddress],
    chain,
  );

  const ibAlluoAddress = getIbAlluoAddress(type, chain);

  const allowance = await callContract(
    abi,
    tokenAddress,
    'allowance(address,address)',
    [walletAddress, ibAlluoAddress],
    chain,
  );

  return {
    tokenAddress,
    symbol,
    decimals,
    balance: fromDecimals(balance, decimals),
    allowance: fromDecimals(allowance, decimals),
  };
};

/**
 * @description Get meta transaction nonce for on contract.
 * @param {string} metaTxContractAddress - Contract address to which nonce is requested.
 * @param {string} user - Address of user whose nonce is requested.
 * @returns {Promise<number>} User nonce.
 */
async function getAddressNonce(metaTxContractAddress, user) {
  // this is merged combination of abi of different contracts - nonces
  // are fetched differently on some contracts.
  const abi = [
    // get nonce of specific address for signing message
    // (increments on every successful tx)
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'nonces',
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
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
      ],
      name: 'getNonce',
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

  const metaTxContract = new web3.eth.Contract(abi, metaTxContractAddress);

  // get user nonce
  let nonce;
  try {
    if (usesNoncesAddresses.includes(metaTxContractAddress)) {
      nonce = await metaTxContract.methods.nonces(user).call();
    } else {
      nonce = await metaTxContract.methods.getNonce(user).call();
    }
  } catch (error) {
    console.log(error);
  }

  return nonce;
}

const getSignatureParameters = signature => {
  if (!web3.utils.isHexStrict(signature)) {
    throw new Error(
      'Given value "'.concat(signature, '" is not a valid hex string.'),
    );
  }
  let r = signature.slice(0, 66);
  let s = '0x'.concat(signature.slice(66, 130));
  let v = web3.utils.hexToNumber('0x'.concat(signature.slice(130, 132)));
  if (![27, 28].includes(v)) v += 27;

  return {
    r: r,
    s: s,
    v: v,
  };
};

export const approveStableCoin = async (
  tokenAddress,
  decimals,
  type = 'usd',
  chain = EChain.POLYGON,
) => {
  const ibAlluoAddress = getIbAlluoAddress(type, chain);

  if (chain == EChain.ETHEREUM) {
    const abi = getIbAlluoAbi(type, chain);
    const stableCoinInstanceFromWallet = new web3.eth.Contract(
      abi,
      tokenAddress,
    );

    const res = await stableCoinInstanceFromWallet.methods
      .approve(ibAlluoAddress, maximumUint256Value)
      .send({ from: walletAddress });

    return res;
  } else {
    const biconomy = await startOrGetBiconomy(chain, window.ethereum);
    const biconomyWeb3 = new Web3(biconomy);

    const nonce = await getAddressNonce(tokenAddress, walletAddress);

    let domain;
    let types;
    let message;
    let primaryType;
    let contract;

    const abiNameMethod = {
      inputs: [],
      name: 'name',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    };

    const chainId = await web3.eth.getChainId();

    let usePermit = false;

    if (permitOnlyTokenAddresses.includes(tokenAddress)) {
      usePermit = true;
      const abi = [
        {
          inputs: [
            { internalType: 'address', name: 'owner', type: 'address' },
            { internalType: 'address', name: 'spender', type: 'address' },
            { internalType: 'uint256', name: 'value', type: 'uint256' },
            { internalType: 'uint256', name: 'deadline', type: 'uint256' },
            { internalType: 'uint8', name: 'v', type: 'uint8' },
            { internalType: 'bytes32', name: 'r', type: 'bytes32' },
            { internalType: 'bytes32', name: 's', type: 'bytes32' },
          ],
          name: 'permit',
          outputs: [],
          stateMutability: 'nonpayable',
          type: 'function',
        },
        abiNameMethod,
      ];

      contract = new biconomyWeb3.eth.Contract(abi as any, tokenAddress);

      const name = await contract.methods.name().call();

      domain = {
        name: name,
        version: '1',
        chainId: chainId,
        verifyingContract: tokenAddress,
      };
      primaryType = 'Permit';
      const EIP712Domain = [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ];
      const permit = [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ];
      types = { Permit: permit, EIP712Domain: EIP712Domain };
      message = {
        owner: walletAddress,
        spender: ibAlluoAddress,
        value: maximumUint256Value,
        nonce: nonce,
        deadline: maximumUint256Value,
      };
    } else {
      const abi = [
        {
          inputs: [
            { internalType: 'address', name: 'userAddress', type: 'address' },
            { internalType: 'bytes', name: 'functionSignature', type: 'bytes' },
            { internalType: 'bytes32', name: 'sigR', type: 'bytes32' },
            { internalType: 'bytes32', name: 'sigS', type: 'bytes32' },
            { internalType: 'uint8', name: 'sigV', type: 'uint8' },
          ],
          name: 'executeMetaTransaction',
          outputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
          stateMutability: 'payable',
          type: 'function',
        },
        abiNameMethod,
      ];
      contract = new biconomyWeb3.eth.Contract(abi as any, tokenAddress);

      const name = await contract.methods.name().call();
      const functionSignature =
        '0x095ea7b3' +
        web3.utils.padLeft(ibAlluoAddress, 64).replace('0x', '') +
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
      const salt = web3.utils.padLeft(web3.utils.toHex(chainId), 64, '0');

      domain = {
        name: name,
        version: '1',
        verifyingContract: tokenAddress,
        salt: salt,
      };
      primaryType = 'MetaTransaction';
      const EIP712Domain = [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ];
      const metaTransaction = [
        { name: 'nonce', type: 'uint256' },
        { name: 'from', type: 'address' },
        { name: 'functionSignature', type: 'bytes' },
      ];
      types = { MetaTransaction: metaTransaction, EIP712Domain: EIP712Domain };
      message = {
        nonce: nonce,
        from: walletAddress,
        functionSignature: functionSignature,
      };
    }

    let msgParams = JSON.stringify({
      domain: domain,
      message: message,
      primaryType: primaryType,
      types: types,
    });

    let params = [walletAddress, msgParams];
    let method = 'eth_signTypedData_v4';

    const res = new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(
        {
          method,
          params,
          walletAddress,
        },
        async function (err, result) {
          if (err) {
            reject(err);
            return;
          }
          if (result.error) {
            reject(result);
            return;
          }

          const { r, s, v } = getSignatureParameters(result.result);

          try {
            let tx;
            if (usePermit) {
              tx = await contract.methods
                .permit(
                  message.owner,
                  message.spender,
                  message.value,
                  message.deadline,
                  v,
                  r,
                  s,
                )
                .send({
                  from: walletAddress,
                  signatureType: biconomy.PERSONAL_SIGN,
                });
            } else {
              tx = await contract.methods
                .executeMetaTransaction(
                  walletAddress,
                  message.functionSignature,
                  r,
                  s,
                  v,
                )
                .send({
                  from: walletAddress,
                  signatureType: biconomy.PERSONAL_SIGN,
                });
            }
            resolve(tx);
          } catch (err) {
            console.log('handle errors like signature denied here');
            console.log(err);
            reject(err);
          }
        },
      );
    });

    return await res;
  }
};

export const depositStableCoin = async (
  tokenAddress,
  amount,
  decimals,
  type = 'usd',
  chain = EChain.POLYGON,
  useBiconomy,
) => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: '_token', type: 'address' },
        { internalType: 'uint256', name: '_amount', type: 'uint256' },
      ],
      name: 'deposit',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];
  const ibAlluoAddress = getIbAlluoAddress(type, chain);

  const amountInDecimals = toDecimals(amount, decimals);

  const tx = await sendTransaction(
    abi,
    ibAlluoAddress,
    'deposit(address,uint256)',
    [tokenAddress, amountInDecimals],
    chain,
    useBiconomy,
  );

  return tx;
};

export const depositIntoBoosterFarm = async (
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

export const approveToken = async (
  tokenAddress,
  spender,
  chain = EChain.ETHEREUM,
  useBiconomy = false,
) => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: 'spender', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const tx = await sendTransaction(
    abi,
    tokenAddress,
    'depositWithoutLP(uint256,address)',
    [spender, maximumUint256Value],
    chain,
    useBiconomy,
  );

  return tx;
};

export const getUserDepositedAmount = async (
  type = 'usd',
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
      name: 'getBalance',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const address = getIbAlluoAddress(type, chain);

  const userDepositedAmount = await callContract(
    abi,
    address,
    'getBalance(address)',
    [walletAddress],
    chain,
  );

  return Web3.utils.fromWei(userDepositedAmount);
};

export const getTotalAssetSupply = async (type, chain = EChain.POLYGON) => {
  const abi = [
    {
      inputs: [],
      name: 'totalAssetSupply',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ibAlluoAddress = getIbAlluoAddress(type, chain);

  const totalAssetSupply = await callContract(
    abi,
    ibAlluoAddress,
    'totalAssetSupply()',
    null,
    chain,
  );

  return Web3.utils.fromWei(totalAssetSupply);
};

export const getTotalSupplyVlAlluo = async () => {
  const abi = [
    {
      inputs: [],
      name: 'totalSupply',
      outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const totalAssetSupply = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'totalSupply()',
    null,
    EChain.ETHEREUM,
  );

  return Web3.utils.fromWei(totalAssetSupply);
};

export const getUserDepositedTransferAmount = async (
  type = 'usd',
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
      name: 'getBalanceForTransfer',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ibAlluoAddress = getIbAlluoAddress(type, chain);

  const userDepositedAmount = await callContract(
    abi,
    ibAlluoAddress,
    'getBalanceForTransfer(address)',
    [walletAddress],
    chain,
  );

  return Web3.utils.fromWei(userDepositedAmount);
};

export const getInterest = async (type = 'usd', chain = EChain.POLYGON) => {
  const abi = [
    {
      inputs: [],
      name: 'annualInterest',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ibAlluoAddress = getIbAlluoAddress(type, chain);

  const interest = await callContract(
    abi,
    ibAlluoAddress,
    'annualInterest()',
    null,
    chain,
  );

  return fromDecimals(interest, 2);
};

export const withdrawStableCoin = async (
  coinAddress,
  amount,
  type = 'usd',
  chain = EChain.POLYGON,
  useBiconomy,
) => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: '_targetToken', type: 'address' },
        { internalType: 'uint256', name: '_amount', type: 'uint256' },
      ],
      name: 'withdraw',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const ibAlluoAddress = getIbAlluoAddress(type, chain);

  const amountInWei = Web3.utils.toWei(amount);

  const tx = await sendTransaction(
    abi,
    ibAlluoAddress,
    'withdraw(address,uint256)',
    [coinAddress, amountInWei],
    chain,
    useBiconomy,
  );

  return tx.blockNumber;
};

export const withdrawFromBoosterFarm = async (
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
    [amountInDecimals, , , tokenAddress],
    chain,
    useBiconomy,
  );

  return tx.blockNumber;
};

export const claimBoosterFarmRewards = async (
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
    [amountInDecimals, , , tokenAddress],
    chain,
    useBiconomy,
  );

  return tx.blockNumber;
};

export const listenToHandler = blockNumber => {
  const handlerInstance = new web3.eth.Contract(
    polygonHandlerAbi as any,
    EPolygonAddresses.HANDLER,
  );

  return handlerInstance.events;
};

export const getIfUserHasWithdrawalRequest = async (
  walletAddress,
  type = 'usd',
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: '_ibAlluo', type: 'address' },
        { internalType: 'address', name: '_user', type: 'address' },
      ],
      name: 'isUserWaiting',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'ibAlluoToWithdrawalSystems',
      outputs: [
        {
          internalType: 'uint256',
          name: 'lastWithdrawalRequest',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'lastSatisfiedWithdrawal',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'totalWithdrawalAmount',
          type: 'uint256',
        },
        { internalType: 'bool', name: 'resolverTrigger', type: 'bool' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        { internalType: 'address', name: '_ibAlluo', type: 'address' },
        { internalType: 'uint256', name: '_id', type: 'uint256' },
      ],
      name: 'getWithdrawal',
      outputs: [
        {
          components: [
            { internalType: 'address', name: 'user', type: 'address' },
            { internalType: 'address', name: 'token', type: 'address' },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'uint256', name: 'time', type: 'uint256' },
          ],
          internalType: 'struct LiquidityHandler.Withdrawal',
          name: '',
          type: 'tuple',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const polygonHandlerAddress = EPolygonAddresses.HANDLER;

  const ibAlluoAddress = getIbAlluoAddress(type, chain);

  const isUserWaiting = await callContract(
    abi,
    polygonHandlerAddress,
    'isUserWaiting(address,address)',
    [ibAlluoAddress, walletAddress],
    chain,
  );

  if (!isUserWaiting) return [];

  const ibAlluoToWithdrawalSystems = await callContract(
    abi,
    polygonHandlerAddress,
    'ibAlluoToWithdrawalSystems(address)',
    [ibAlluoAddress],
    chain,
  );

  const { lastSatisfiedWithdrawal, lastWithdrawalRequest } =
    ibAlluoToWithdrawalSystems;
  const allWithdrawalRequests = [];

  for (let i = +lastSatisfiedWithdrawal + 1; i <= +lastWithdrawalRequest; i++) {
    const withdrawal = await callContract(
      abi,
      polygonHandlerAddress,
      'getWithdrawal(address,uint256)',
      [ibAlluoAddress, i],
      chain,
    );
    allWithdrawalRequests.push(withdrawal);
  }

  const allWithdrawals = await Promise.all(allWithdrawalRequests);
  const usersWithdrawals = allWithdrawals.filter(
    w => w.user.toLowerCase() === walletAddress.toLowerCase(),
  );

  return usersWithdrawals;
};

export const getWEthBalance = async () => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const wEthAddress = EEthereumAddresses.WETH;

  const balance = await callContract(
    abi,
    wEthAddress,
    'balanceOf(address)',
    [walletAddress],
    EChain.ETHEREUM,
  );

  return Web3.utils.fromWei(balance);
};

export const getVlAlluoBalance = async () => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ethereumVlAlluoAddress = EEthereumAddresses.VLALLUO;

  const balance = await callContract(
    abi,
    ethereumVlAlluoAddress,
    'balanceOf(address)',
    [walletAddress],
    EChain.ETHEREUM,
  );

  return Web3.utils.fromWei(balance);
};

export const approveAlluoPurchaseInWETH = async () => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: 'guy', type: 'address' },
        { internalType: 'uint256', name: 'wad', type: 'uint256' },
      ],
      name: 'approve',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ];

  const wEthAddress = EEthereumAddresses.WETH;
  const vaultAddress = EEthereumAddresses.VAULT;

  try {
    const tx = await sendTransaction(
      abi,
      wEthAddress,
      'approve(address,uint256)',
      [vaultAddress, maximumUint256Value],
      EChain.ETHEREUM,
    );

    return tx;
  } catch (error) {
    throw error;
  }
};

export const getWETHAllowance = async () => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: '', type: 'address' },
        { internalType: 'address', name: '', type: 'address' },
      ],
      name: 'allowance',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const wEthAddress = EEthereumAddresses.WETH;
  const vaultAddress = EEthereumAddresses.VAULT;

  const balance = await callContract(
    abi,
    wEthAddress,
    'allowance(address,address)',
    [walletAddress, vaultAddress],
    EChain.ETHEREUM,
  );

  return Web3.utils.fromWei(balance);
};

export const buyAlluoWithWETH = async value => {
  const abi = [
    {
      inputs: [
        {
          components: [
            { internalType: 'bytes32', name: 'poolId', type: 'bytes32' },
            {
              internalType: 'enum IVault.SwapKind',
              name: 'kind',
              type: 'uint8',
            },
            {
              internalType: 'contract IAsset',
              name: 'assetIn',
              type: 'address',
            },
            {
              internalType: 'contract IAsset',
              name: 'assetOut',
              type: 'address',
            },
            { internalType: 'uint256', name: 'amount', type: 'uint256' },
            { internalType: 'bytes', name: 'userData', type: 'bytes' },
          ],
          internalType: 'struct IVault.SingleSwap',
          name: 'singleSwap',
          type: 'tuple',
        },
        {
          components: [
            { internalType: 'address', name: 'sender', type: 'address' },
            {
              internalType: 'bool',
              name: 'fromInternalBalance',
              type: 'bool',
            },
            {
              internalType: 'address payable',
              name: 'recipient',
              type: 'address',
            },
            {
              internalType: 'bool',
              name: 'toInternalBalance',
              type: 'bool',
            },
          ],
          internalType: 'struct IVault.FundManagement',
          name: 'funds',
          type: 'tuple',
        },
        { internalType: 'uint256', name: 'limit', type: 'uint256' },
        { internalType: 'uint256', name: 'deadline', type: 'uint256' },
      ],
      name: 'swap',
      outputs: [
        {
          internalType: 'uint256',
          name: 'amountCalculated',
          type: 'uint256',
        },
      ],
      stateMutability: 'payable',
      type: 'function',
    },
  ];

  const ethereumVaultAddress = EEthereumAddresses.VAULT;

  const ethereumWETHAddress = EEthereumAddresses.WETH.toLowerCase();
  const ethereumAlluoAddress = EEthereumAddresses.ALLUO.toLowerCase();

  const swap_struct = {
    poolId:
      process.env.REACT_APP_NET === 'mainnet'
        ? '0x85be1e46283f5f438d1f864c2d925506571d544f0002000000000000000001aa'
        : '0xb157a4395d28c024a0e2e5fa142a53b3eb726bc6000200000000000000000713',
    kind: 0,
    assetIn: Web3.utils.toChecksumAddress(ethereumWETHAddress),
    assetOut: Web3.utils.toChecksumAddress(ethereumAlluoAddress),
    amount: String(value * Math.pow(10, 18)).toString(),
    userData: '0x',
  };
  const deadline = String(999999999999999999);
  const fund_struct = {
    sender: Web3.utils.toChecksumAddress(walletAddress),
    recipient: Web3.utils.toChecksumAddress(walletAddress),
    fromInternalBalance: false,
    toInternalBalance: false,
  };
  const token_limit = String(0 * Math.pow(10, 18)).toString();

  const tx = await sendTransaction(
    abi,
    ethereumVaultAddress,
    'swap((bytes32,uint8,address,address,uint256,bytes),(address,bool,address,bool),uint256,uint256)',
    [swap_struct, fund_struct, token_limit, deadline.toString()],
    EChain.ETHEREUM,
  );

  return tx;
};

export const getTokenInfo = async (walletAddress, idxOfCall = 0) => {
  let tokenInfo: TTokenInfo = {
    isLoading: false,
  };
  try {
    const alluoAbi = [
      {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
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

    const vlAlluoAbi = [
      {
        inputs: [],
        name: 'totalLocked',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [{ internalType: 'address', name: '_locker', type: 'address' }],
        name: 'getClaim',
        outputs: [{ internalType: 'uint256', name: 'reward', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'rewardPerDistribution',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [
          { internalType: 'address', name: '_address', type: 'address' },
        ],
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
        inputs: [
          { internalType: 'address', name: '_address', type: 'address' },
        ],
        name: 'unlockedBalanceOf',
        outputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'withdrawLockDuration',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
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

    const getTotalLockedInLB = await callContract(
      vlAlluoAbi,
      ethereumVlAlluoAddress,
      'totalLocked()',
      null,
      EChain.ETHEREUM,
    );

    const [
      getBalanceOfAlluo,
      getAllowance,
      getEarnedAlluo,
      getRewardPerDistribution,
      getInfoByAddress,
      getUnlockedBalanceOf,
      getWithdrawLockDuration,
      getTotalLockedInAlluo,
    ] = await Promise.all([
      callContract(
        alluoAbi,
        ethereumAlluoAddress,
        'balanceOf(address)',
        [walletAddress],
        EChain.ETHEREUM,
      ),
      callContract(
        alluoAbi,
        ethereumAlluoAddress,
        'allowance(address,address)',
        [walletAddress, ethereumVlAlluoAddress],
        EChain.ETHEREUM,
      ),
      callContract(
        vlAlluoAbi,
        ethereumVlAlluoAddress,
        'getClaim(address)',
        [walletAddress],
        EChain.ETHEREUM,
      ),
      callContract(
        vlAlluoAbi,
        ethereumVlAlluoAddress,
        'rewardPerDistribution()',
        null,
        EChain.ETHEREUM,
      ),
      callContract(
        vlAlluoAbi,
        ethereumVlAlluoAddress,
        'getInfoByAddress(address)',
        [walletAddress],
        EChain.ETHEREUM,
      ),
      callContract(
        vlAlluoAbi,
        ethereumVlAlluoAddress,
        'unlockedBalanceOf(address)',
        [walletAddress],
        EChain.ETHEREUM,
      ),
      callContract(
        vlAlluoAbi,
        ethereumVlAlluoAddress,
        'withdrawLockDuration()',
        null,
        EChain.ETHEREUM,
      ),
      callContract(
        vlAlluoAbi,
        ethereumVlAlluoAddress,
        'convertLpToAlluo(uint256)',
        [getTotalLockedInLB],
        EChain.ETHEREUM,
      ),
    ]);

    // Change all user vesting infos to human-readable allue value
    const lockedAlluoBalanceOfUser = await callContract(
      vlAlluoAbi,
      ethereumVlAlluoAddress,
      'convertLpToAlluo(uint256)',
      [getInfoByAddress.locked_],
      EChain.ETHEREUM,
    );

    const [
      claimedAlluoInUsd,
      alluoBalanceInUsd,
      apr,
      totalLockedInUsd,
      lockedAlluoValueOfUserInUsd,
      unlockedAlluoValueOfUserInUsd,
    ] = await Promise.all([
      alluoToUsd(getEarnedAlluo),
      alluoToUsd(getBalanceOfAlluo),
      calculateApr(getRewardPerDistribution, getTotalLockedInLB),
      alluoToUsd(getTotalLockedInAlluo),
      alluoToUsd(lockedAlluoBalanceOfUser),
      alluoToUsd(getUnlockedBalanceOf),
    ]);
    tokenInfo = {
      isLoading: false,
      allowance: toAlluoValue(getAllowance),
      claimedAlluo: toAlluoValue(getEarnedAlluo),
      claimedAlluoInUsd,
      alluoBalance: toAlluoValue(getBalanceOfAlluo),
      alluoBalanceInUsd,
      apr,
      totalLocked: toAlluoValue(getTotalLockedInAlluo),
      totalLockedInUsd,
      infoByAddress: getInfoByAddress,
      lockedLPValueOfUser: !!walletAddress
        ? Web3.utils.fromWei(getInfoByAddress.locked_)
        : null,
      lockedAlluoValueOfUser: toAlluoValue(lockedAlluoBalanceOfUser),
      lockedAlluoValueOfUserInUsd,
      unlockedAlluoValueOfUser: toAlluoValue(getUnlockedBalanceOf),
      unlockedAlluoValueOfUserInUsd,
      withdrawLockDuration: getWithdrawLockDuration,
    };

    return tokenInfo;
  } catch (err) {
    console.log('error', err.message);
  }
  return { isLoading: false };
};

export const getIbAlluoInfo = async type => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
      name: 'getBalanceForTransfer',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [{ internalType: 'string', name: '', type: 'string' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'decimals',
      outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const ibAlluoAddress = getIbAlluoAddress(type);

  const symbol = await callContract(
    abi,
    ibAlluoAddress,
    'symbol()',
    null,
    EChain.POLYGON,
  );

  const decimals = await callContract(
    abi,
    ibAlluoAddress,
    'decimals()',
    null,
    EChain.POLYGON,
  );

  const balance = await callContract(
    abi,
    ibAlluoAddress,
    'getBalanceForTransfer(address)',
    [walletAddress],
    EChain.POLYGON,
  );

  return {
    ibAlluoAddress,
    symbol,
    decimals,
    balance: fromDecimals(balance, decimals),
  };
};

export const transferToAddress = async (
  tokenAddress,
  amount,
  decimals,
  toAddress,
  useBiconomy,
) => {
  try {
    const abi = [
      {
        inputs: [
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        name: 'transferAssetValue',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];

    const amountInDecimals = toDecimals(amount, decimals);

    const tx = await sendTransaction(
      abi,
      tokenAddress,
      'transferAssetValue(address,uint256)',
      [toAddress, amountInDecimals],
      EChain.POLYGON,
      useBiconomy,
    );

    return tx;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
