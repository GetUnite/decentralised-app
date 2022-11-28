import { Biconomy } from '@biconomy/mexa';
import { Framework } from '@superfluid-finance/sdk-core';
import coinbaseWalletModule from '@web3-onboard/coinbase';
import Onboard from '@web3-onboard/core';
import gnosisModule from '@web3-onboard/gnosis';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import polygonHandlerAbi from 'app/common/abis/polygonHandler.json';
import {
  EEthereumAddresses,
  EPolygonAddresses
} from 'app/common/constants/addresses';
import logo from 'app/modernUI/images/logo.svg';
import { ethers } from 'ethers';
import Web3 from 'web3';
import { EChain, EChainId } from '../constants/chains';
import { heapTrack } from './heapClient';
import { fromDecimals, maximumUint256Value, toDecimals } from './utils';

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
    label: 'Polygon Mainnet',
    rpcUrl: polygonMainnetProviderUrl,
  },
  {
    id: EChainId.POL_MUMBAI,
    token: 'MATIC',
    label: 'Polygon Mumbai',
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
let walletProvider;
let web3;

export const trySafeAppConnection = async callback => {
  const gnosisLabel = 'Gnosis Safe';
  const onboardState = onboard.state.get();

  if (
    onboardState.walletModules.find(
      walletModule => walletModule.label == gnosisLabel,
    )
  ) {
    try {
      callback(
        await connectToWallet({
          autoSelect: { label: gnosisLabel, disableModals: true },
        }),
      );
    } catch (error) {
      console.log(error);
    }
  }
};

export const connectToWallet = async (connectOptions?) => {
  let wallets;

  try {
    wallets = await onboard.connectWallet(connectOptions);

    if (wallets[0]) {
      walletProvider = new ethers.providers.Web3Provider(wallets[0].provider, "any");
      web3 = new Web3(walletProvider);
      walletAddress = wallets[0].accounts[0].address;
      heapTrack('walletConnected', {
        walletType: wallets[0].label,
        chain: wallets[0].chains[0].id,
      });
      return walletAddress;
    }
  } catch (error) {
    console.log(error);
  }
};

export const getCurrentWalletAddress = () => {
  return walletAddress;
};

export const changeNetwork = async (chain: EChain) => {
  let chainId;

  if (!walletAddress) return;

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

export const startBiconomy = async (chain, provider) => {
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
  new Promise<void>((resolve, reject) => {
    biconomy
      .onEvent(biconomy.READY, () => {
        resolve();
      })
      .onEvent(biconomy.ERROR, error => {
        console.log(error);
        reject(error);
      });
  });

export const getProvider = chain => {
  return walletProvider;
};

export const sendTransaction = async (
  abi,
  address,
  functionSignature,
  params = [],
  chain,
  useBiconomy = false,
) => {
  let provider;

  try {
    if (useBiconomy) {
      const biconomy = await startBiconomy(chain, walletProvider);
      provider = biconomy.getEthersProvider();
    } else {
      provider = walletProvider;
    }

    let contractInterface = new ethers.utils.Interface(abi);

    const data = contractInterface.encodeFunctionData(
      functionSignature,
      params,
    );

    let rawTx = {
      to: address,
      data: data,
      from: walletAddress,
    };

    let finalTx;
    if (useBiconomy) {
      const gasLimitEstimation = +(
        await provider.estimateGas(rawTx)
      ).toString();
      const gasLimit = Math.floor(
        gasLimitEstimation + gasLimitEstimation * 0.25,
      );
      const gasPriceEstimation = +(await provider.getGasPrice()).toString();
      const gasPrice = Math.floor(
        gasPriceEstimation + gasPriceEstimation * 0.25,
      );
      finalTx = { ...rawTx, gasLimit: gasLimit, gasPrice: gasPrice };
    } else {
      finalTx = rawTx;
    }

    let transactionHash = await provider.send('eth_sendTransaction', [finalTx]);
    let receipt = await provider.waitForTransaction(transactionHash);
    return receipt;
    /*const signer = provider.getSigner();
    console.log(signer)
    const signedTx = signer.signTransaction(rawTx);
    return;
    const contract = new ethers.Contract(address, abi as any, signer);

    const gasEstimationPromise = contract.connect("0x86c80a8aa58e0a4fa09a69624c31ab2a6cad56b8").estimateGas[functionSignature].apply(
      null,
      params,
    );
    const gasLimitEstimation = +(await gasEstimationPromise).toString();
    const gasLimit = Math.floor(gasLimitEstimation + gasLimitEstimation * 0.25);
    const gasPriceEstimation = +(await provider.getGasPrice()).toString();
    const gasPrice = Math.floor(gasPriceEstimation + gasPriceEstimation * 0.25);

    console.log("sadas");
    const method = contract[functionSignature].apply(null, [
      ...params,
      { gasLimit: gasLimit, gasPrice: gasPrice },
    ]);

    const tx = await method;

    const receipt = await tx.wait();

    return receipt;*/
  } catch (error) {
    console.log(error);
    console.log({
      abi: abi,
      address: address,
      functionSignature: functionSignature,
      params: params,
      walletAddress: walletAddress,
    });

    if (error.code == 4001) {
      throw 'User denied message signature';
    }

    if (error.code == 417) {
      throw 'Error while estimating gas. Please try again';
    }

    const errorString = error.toString();

    if (errorString.includes('user rejected signing')) {
      throw 'User denied message signature';
    }

    if (errorString.includes('reverted by the EVM')) {
      throw 'Transaction has been reverted by the EVM. Please try again';
    }

    throw 'Something went wrong with your transaction. Please try again';
  }
};

/*export const sendMetaTransaction = async (
  abi,
  address,
  functionSignature,
  params = [],
  chain,
  useBiconomy = false,
) => {
  let provider;

  try {
    if (useBiconomy) {
      const biconomy = await startBiconomy(chain, walletProvider);
      provider = biconomy.getEthersProvider();
      console.log(provider);
    } else {
      provider = walletProvider;
    }

    let contractInterface = new ethers.utils.Interface(abi);

    let nonce = await contract.getNonce(userAddress);

    const data = contractInterface.encodeFunctionData(
      functionSignature,
      params,
    );
                
let message = {nonce: parseInt(nonce),from: userAddress, functionSignature: data};

const dataToSign = JSON.stringify({
  types: {
    EIP712Domain: domainType,
    MetaTransaction: metaTransactionType
  },
  domain: domainData,
  primaryType: "MetaTransaction",
  message: message
});

    let transactionHash = await provider.send('eth_sendTransaction', [finalTx]);
    let receipt = await provider.waitForTransaction(transactionHash);
    return receipt;
  } catch (error) {
    console.log(error);
    console.log({
      abi: abi,
      address: address,
      functionSignature: functionSignature,
      params: params,
      walletAddress: walletAddress,
    });

    if (error.code == 4001) {
      throw 'User denied message signature';
    }

    if (error.code == 417) {
      throw 'Error while estimating gas. Please try again';
    }

    const errorString = error.toString();

    if (errorString.includes('user rejected transaction')) {
      throw 'User denied message signature';
    }

    if (errorString.includes('reverted by the EVM')) {
      throw 'Transaction has been reverted by the EVM. Please try again';
    }

    throw 'Something went wrong with your transaction. Please try again';
  }
};*/

export const getReadOnlyProvider = chain => {
  const providerUrl =
    chain === EChain.ETHEREUM ? ethereumProviderUrl : polygonProviderUrl;
  return new ethers.providers.JsonRpcProvider(providerUrl, "any");
};

export const callContract = async (
  abi,
  address,
  functionSignature,
  params,
  chain,
) => {
  const readOnlyProvider = getReadOnlyProvider(chain);
  const contract = new ethers.Contract(address, abi, readOnlyProvider);

  try {
    const method = contract[functionSignature].apply(null, params);
    const txResult = await method;

    if (ethers.BigNumber.isBigNumber(txResult)) {
      return txResult.toString();
    }

    return txResult;
  } catch (error) {
    console.log(abi, address, functionSignature, params);
    // here do all error handling to readable stuff
    console.log(error);
  }
};

export const QueryFilter = async (
  abi,
  address,
  eventSignature,
  params,
  blockNumber,
  chain,
) => {
  const readOnlyProvider = getReadOnlyProvider(chain);
  const contract = new ethers.Contract(address, abi, readOnlyProvider);

  try {
    const event = contract.filters[eventSignature].apply(null, params);

    const logs = await contract.queryFilter(event, blockNumber, blockNumber);

    return logs;
  } catch (error) {
    console.log(abi, address, eventSignature, params);
    // here do all error handling to readable stuff
    console.log(error);
  }
};

export const binarySearchForBlock = async (
  startTimestamp: number,
  chain: EChain,
): Promise<number> => {
  const provider = getReadOnlyProvider(chain);
  let highestEstimatedBlockNumber = await provider.getBlockNumber();
  let highestEstimatedBlock = await provider.getBlock(
    highestEstimatedBlockNumber,
  );
  let lowestEstimatedBlock = await provider.getBlock(
    highestEstimatedBlock.number -
      Math.floor(highestEstimatedBlock.timestamp - startTimestamp),
  );
  let closestBlock;

  while (lowestEstimatedBlock.number <= highestEstimatedBlock.number) {
    closestBlock = await provider.getBlock(
      Math.floor(
        (highestEstimatedBlock.number + lowestEstimatedBlock.number) / 2,
      ),
    );
    if (closestBlock.timestamp == startTimestamp) {
      return closestBlock.number;
    } else if (closestBlock.timestamp > startTimestamp) {
      highestEstimatedBlock = closestBlock;
    } else {
      lowestEstimatedBlock = closestBlock;
    }
  }
  return 0;
};

const marketApiURl =
  process.env.REACT_APP_NET === 'mainnet'
    ? 'https://protocol-mainnet.gnosis.io/api'
    : 'https://protocol-mainnet.dev.gnosisdev.com/api';

export const getPrice = async (
  sellToken,
  buyToken,
  sellDecimals,
  buyDecimals,
) => {
  const url = marketApiURl + `/v1/quote`;

  // quote returns the value accounting with fee so using 10000 to prevent the fee being higher than the actual value
  const value = toDecimals(10000, sellDecimals);

  try {
    const priceResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify({
        sellToken: sellToken,
        buyToken: buyToken,
        sellAmountBeforeFee: value,
        from: walletAddress,
        kind: 'sell',
      }),
    }).then(res => res.json());

    const price = +fromDecimals(priceResponse.quote.buyAmount, buyDecimals);

    // We multiplied the value by 1000 so now divide it
    return price / 10000;
  } catch (error) {
    throw 'Something went wrong while fetching data. Please try again later';
  }
};

export const isExpectedPolygonEvent = (type, depositAddress) => {
  const ibAlluoAddress = getIbAlluoAddress(type);
  return depositAddress.toLowerCase() === ibAlluoAddress.toLowerCase();
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

const getIbAlluoAddress = (type, chain = EChain.POLYGON) => {
  let ibAlluoAddresses;
  switch (chain) {
    case EChain.POLYGON:
      ibAlluoAddresses = {
        usd: EPolygonAddresses.IBALLUOUSD,
        eur: EPolygonAddresses.IBALLUOEUR,
        eth: EPolygonAddresses.IBALLUOETH,
        btc: EPolygonAddresses.IBALLUOBTC,
      };
      break;

    case EChain.ETHEREUM:
      ibAlluoAddresses = {
        usd: EEthereumAddresses.IBALLUOUSD,
        eur: EEthereumAddresses.IBALLUOEUR,
        eth: EEthereumAddresses.IBALLUOETH,
        btc: EEthereumAddresses.IBALLUOBTC,
      };
      break;
    default:
      break;
  }

  return ibAlluoAddresses[type];
};

export const getSupportedTokensBasicInfo = async (
  tokenAddress,
  chain = EChain.POLYGON,
) => {
  try {
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

    const symbol = await callContract(
      abi,
      tokenAddress,
      'symbol()',
      null,
      chain,
    );

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
  } catch (error) {
    throw error;
  }
};

export const getSupportedTokensAdvancedInfo = async (
  farmAddress,
  supportedToken,
  chain = EChain.POLYGON,
) => {
  try {
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

    const allowance = await callContract(
      abi,
      supportedToken.tokenAddress,
      'allowance(address,address)',
      [walletAddress, farmAddress],
      chain,
    );

    return {
      balance: fromDecimals(balance, supportedToken.decimals),
      allowance: allowance,
    };
  } catch (error) {
    throw error;
  }
};

export const getStableCoinInfo = async (
  tokenAddress,
  type,
  chain = EChain.POLYGON,
) => {
  try {
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

    const symbol = await callContract(
      abi,
      tokenAddress,
      'symbol()',
      null,
      chain,
    );

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
  } catch (error) {
    throw error;
  }
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
  if (!Web3.utils.isHexStrict(signature)) {
    throw new Error(
      'Given value "'.concat(signature, '" is not a valid hex string.'),
    );
  }
  let r = signature.slice(0, 66);
  let s = '0x'.concat(signature.slice(66, 130));
  let v = Web3.utils.hexToNumber('0x'.concat(signature.slice(130, 132)));
  if (![27, 28].includes(v)) v += 27;

  return {
    r: r,
    s: s,
    v: v,
  };
};

export const approveStableCoin = async (
  farmAddress,
  tokenAddress,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  if (chain == EChain.ETHEREUM || !useBiconomy) {
    try {
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
        'approve(address,uint256)',
        [farmAddress, maximumUint256Value],
        chain,
      );

      return tx;
    } catch (error) {
      throw error;
    }
  } else {
    const biconomy = await startBiconomy(chain, walletProvider);
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
        spender: farmAddress,
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
        web3.utils.padLeft(farmAddress, 64).replace('0x', '') +
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
  try {
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
  } catch (error) {
    throw error;
  }
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

export const approve = async (
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
    'approve(address,uint256)',
    [spender, maximumUint256Value],
    chain,
    useBiconomy,
  );

  return tx;
};

export const getBalanceOf = async (
  tokenAddress,
  tokenDecimals,
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
  ];

  const balance = await callContract(
    abi,
    tokenAddress,
    'balanceOf(address)',
    [walletAddress],
    chain,
  );

  return fromDecimals(balance, tokenDecimals);
};

export const getBalance = async (
  tokenAddress,
  tokenDecimals,
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'getBalance',
      outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const balance = await callContract(
    abi,
    tokenAddress,
    'getBalance(address)',
    [walletAddress],
    chain,
  );

  return fromDecimals(balance, tokenDecimals);
};

export const getAllowance = async (
  tokenAddress,
  spenderAddress,
  chain = EChain.POLYGON,
) => {
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

  const allowance = await callContract(
    abi,
    tokenAddress,
    'allowance(address,address)',
    [walletAddress, spenderAddress],
    chain,
  );

  return ethers.utils.formatEther(allowance);
};

export const getDecimals = async (tokenAddress, chain = EChain.POLYGON) => {
  try {
    const abi = [
      {
        inputs: [],
        name: 'decimals',
        outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const decimals = await callContract(
      abi,
      tokenAddress,
      'decimals()',
      null,
      chain,
    );

    return decimals;
  } catch (error) {
    throw error;
  }
};

export const getSymbol = async (tokenAddress, chain = EChain.POLYGON) => {
  try {
    const abi = [
      {
        inputs: [],
        name: 'symbol',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
    ];

    const symbol = await callContract(
      abi,
      tokenAddress,
      'symbol()',
      null,
      chain,
    );

    return symbol;
  } catch (error) {
    throw error;
  }
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

export const getUserDepositedLPAmount = async (farmAddress, chain) => {
  const abi = [
    {
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const userDepositedLPAmount = await callContract(
    abi,
    farmAddress,
    'balanceOf(address)',
    [walletAddress],
    chain,
  );

  return Web3.utils.fromWei(userDepositedLPAmount);
};

const boosterFarmInterestApiUrl = 'https://yields.llama.fi/chart/';
export const getBoosterFarmInterest = async (
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

  return ethers.utils.formatEther(totalAssetSupply);
};

export const getTotalAssets = async (farmAddress, chain = EChain.POLYGON) => {
  const abi = [
    {
      inputs: [],
      name: 'totalAssets',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const totalAssetSupply = await callContract(
    abi,
    farmAddress,
    'totalAssets()',
    null,
    chain,
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
  try {
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

    return tx;
  } catch (error) {
    throw error;
  }
};

export const claimBoosterFarmLPRewards = async (
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

export const claimBoosterFarmNonLPRewards = async (
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

export const listenToHandler = blockNumber => {
  const handlerInstance = new web3.eth.Contract(
    polygonHandlerAbi as any,
    EPolygonAddresses.HANDLER,
  );

  return handlerInstance.events;
};

export const getIfUserHasWithdrawalRequest = async (
  walletAddress,
  farmAddress,
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

  const isUserWaiting = await callContract(
    abi,
    polygonHandlerAddress,
    'isUserWaiting(address,address)',
    [farmAddress, walletAddress],
    chain,
  );

  if (!isUserWaiting) return [];

  const ibAlluoToWithdrawalSystems = await callContract(
    abi,
    polygonHandlerAddress,
    'ibAlluoToWithdrawalSystems(address)',
    [farmAddress],
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
      [farmAddress, i],
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

export const getSuperfluidFramework = async () => {
  try {
    const superfluid = await Framework.create({
      chainId: parseInt(await getCurrentChainId()),
      provider: walletProvider,
    });

    return superfluid;
  } catch (error) {
    throw error;
  }
};

export const getValueOf1LPinUSDC = async (lPTokenAddress, chain) => {
  const abi = [
    {
      inputs: [
        { internalType: 'address', name: 'token', type: 'address' },
        { internalType: 'uint256', name: 'fiatId', type: 'uint256' },
      ],
      name: 'getPrice',
      outputs: [
        { internalType: 'uint256', name: 'value', type: 'uint256' },
        { internalType: 'uint8', name: 'decimals', type: 'uint8' },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const priceFeedRouter = EEthereumAddresses.PRICEFEEDROUTER;

  // The fiatId for USDC is 1
  const priceInUSDC = await callContract(
    abi,
    priceFeedRouter,
    'getPrice(address,uint256)',
    [lPTokenAddress, 1],
    chain,
  );

  return +fromDecimals(priceInUSDC.value.toString(), priceInUSDC.decimals);
};
