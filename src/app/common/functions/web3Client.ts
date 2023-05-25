import { Biconomy } from '@biconomy/mexa';
import { Framework } from '@superfluid-finance/sdk-core';
import coinbaseWalletModule from '@web3-onboard/coinbase';
import Onboard from '@web3-onboard/core';
import gnosisModule from '@web3-onboard/gnosis';
import injectedModule from '@web3-onboard/injected-wallets';
import uauthModule from '@web3-onboard/uauth';
import walletConnectModule from '@web3-onboard/walletconnect';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import Quoter from '@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json';
import {
  EEthereumAddresses,
  EOptimismAddresses,
  EPolygonAddresses,
} from 'app/common/constants/addresses';
import logo from 'app/modernUI/images/logo.svg';
import { BigNumber, ethers } from 'ethers';
import { EChain, EChainId } from '../constants/chains';
import { heapTrack } from './heapClient';
import {
  fromDecimals,
  maximumUint256Value,
  toDecimals,
  toHexString,
} from './utils';
import { getUniswapPoolAddress } from './uniswap';
import { EFiatId } from '../constants/utils';

const ethereumTestnetProviderUrl =
  'https://rpc.tenderly.co/fork/6e7b39bd-7219-4b05-8f65-8ab837da4f11';
const ethereumMainnetProviderUrl = 'https://eth.llamarpc.com/';
const ethereumProviderUrl =
  process.env.REACT_APP_NET === 'mainnet'
    ? ethereumMainnetProviderUrl
    : ethereumTestnetProviderUrl;

const polygonTestnetProviderUrl =
  'https://polygon-mumbai.g.alchemy.com/v2/AyoeA90j3ZUTAePwtDKNWP24P7F67LzM';
const polygonMainnetProviderUrl =
  'https://polygon-mainnet.g.alchemy.com/v2/rXD0-xC6kL_3_CSI5wHfWfrOI65MJe4A';
const polygonProviderUrl =
  process.env.REACT_APP_NET === 'mainnet'
    ? polygonMainnetProviderUrl
    : polygonTestnetProviderUrl;

const optimismMainnetProviderUrl =
  'https://opt-mainnet.g.alchemy.com/v2/bulnCy9Shi1gl0WeTmDIlUC3vxOYzxLy';
const optimismTestnetProviderUrl =
  'https://opt-mainnet.g.alchemy.com/v2/bulnCy9Shi1gl0WeTmDIlUC3vxOYzxLy';
const optimisimProviderUrl =
  process.env.REACT_APP_NET === 'mainnet'
    ? optimismMainnetProviderUrl
    : optimismTestnetProviderUrl;

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
const uauth = uauthModule({
  clientID: process.env.REACT_APP_CLIENT_ID!,
  redirectUri: process.env.REACT_APP_REDIRECT_URI!,
});

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
  {
    id: EChainId.OP_MAINNET,
    token: 'ETH',
    label: 'Optimisim Mainnet',
    rpcUrl: optimismMainnetProviderUrl,
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
  uauth,
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

export const tryAutoWalletConnection = async callback => {
  const gnosisLabel = 'Safe';
  const onboardState = onboard.state.get();

  let walletLabel = undefined;
  let isGnosisSafe = false;
  // first try safe app connection
  if (
    onboardState.walletModules.find(
      walletModule => walletModule.label == gnosisLabel,
    )
  ) {
    walletLabel = gnosisLabel;
    isGnosisSafe = true;
  }
  // check if there is a wallet saved on local storage
  const previouslyConnectedWallets = JSON.parse(
    window.localStorage.getItem('connectedWallets'),
  );
  if (previouslyConnectedWallets) {
    walletLabel = previouslyConnectedWallets[0];
  }
  // if its safe app or a wallet address is saved on local storage, auto connect
  if (walletLabel) {
    try {
      const connection = await connectToWallet({
        autoSelect: { label: walletLabel, disableModals: true },
      });
      callback(connection.address, isGnosisSafe);
    } catch (error) {
      console.log(error);
    }
  }
};

export const connectToWallet = async (connectOptions?) => {
  let wallets;
  let wa = { domain: null, address: null };

  try {
    wallets = await onboard.connectWallet(connectOptions);

    if (wallets[0]) {
      const unstoppableUser = wallets[0].label === 'Unstoppable' ? true : false;
      walletProvider = new ethers.providers.Web3Provider(
        wallets[0].provider,
        'any',
      );

      walletAddress = wallets[0].accounts[0].address;
      wa.domain = unstoppableUser ? wallets[0].instance.user.sub : null;
      wa.address = wallets[0].accounts[0].address;
      // save in local storage
      const connectedWallets = wallets.map(({ label }) => label);
      window.localStorage.setItem(
        'connectedWallets',
        JSON.stringify(connectedWallets),
      );
      heapTrack('walletConnected', {
        walletType: wallets[0].label,
        chain: wallets[0].chains[0].id,
      });
      return wa;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getCurrentWalletAddress = () => {
  // Use this line to force "get" methods for a specific wallet address
  // return '0xfb7A51c6f6A5116Ac748C1aDF4D4682c3D50889E';
  return walletAddress;
};

export const changeNetwork = async (chain: EChain) => {
  let chainId;

  if (!walletAddress) return { success: false, undefined };

  if (chain === EChain.ETHEREUM) {
    chainId = EChainId.ETH_MAINNET;
    /*process.env.REACT_APP_NET === 'mainnet'
        ? EChainId.ETH_MAINNET
        : EChainId.ETH_SEPOLIA;*/
  }

  if (chain === EChain.POLYGON) {
    chainId = EChainId.POL_MAINNET;
    /*process.env.REACT_APP_NET === 'mainnet'
        ? EChainId.POL_MAINNET
        : EChainId.POL_MUMBAI;*/
  }

  if (chain === EChain.OPTIMISM) {
    chainId = EChainId.OP_MAINNET;
    /*process.env.REACT_APP_NET === 'mainnet'
        ? EChainId.OP_MAINNET
        : EChainId.OP_TESTNET;*/
  }

  await onboard.setChain({ chainId: chainId });

  return chainId;
};

export const getChainById = chainId => {
  return chainId === EChainId.POL_MAINNET || chainId === EChainId.POL_MUMBAI
    ? EChain.POLYGON
    : chainId === EChainId.ETH_MAINNET || chainId === EChainId.ETH_SEPOLIA
    ? EChain.ETHEREUM
    : chainId === EChainId.OP_MAINNET
    ? EChain.ETHEREUM
    : null;
};

export const onWalletUpdated = async callback => {
  const wallets = onboard.state.select('wallets');
  wallets.subscribe(wallets => {
    if (wallets[0]) {
      walletAddress = wallets[0].accounts[0].address;
      // save in local storage
      const connectedWallets = wallets.map(({ label }) => label);
      window.localStorage.setItem(
        'connectedWallets',
        JSON.stringify(connectedWallets),
      );
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
  return chains.find(chain => chain.id == chainId)?.label;
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

export const getProvider = () => {
  return walletProvider;
};

export const processSendError = error => {
  if (error.code == 4001) {
    throw 'Transaction rejected in wallet';
  }

  if (error.code == 417) {
    throw 'Error while estimating gas';
  }

  const errorString = error.toString();

  if (errorString.includes('user rejected signing')) {
    throw 'Transaction rejected in wallet';
  }

  if (errorString.includes('reverted by the EVM')) {
    throw 'Transaction has been reverted by the EVM';
  }

  throw 'Something went wrong with your transaction';
};

export const sendTransaction = async (
  abi,
  address,
  functionSignature,
  params = [],
  chain,
  useBiconomy = false,
  txValue = 0,
) => {
  let provider;

  try {
    // uses tenderly on ethereum
    if (process.env.REACT_APP_NET === 'testnet' && chain == EChain.ETHEREUM) {
      provider = getReadOnlyProvider(chain);
    } else {
      if (useBiconomy) {
        const biconomy = await startBiconomy(chain, walletProvider);
        provider = biconomy.getEthersProvider();
      } else {
        provider = walletProvider;
      }
    }

    let contractInterface = new ethers.utils.Interface(abi);

    const data = contractInterface.encodeFunctionData(
      functionSignature,
      params,
    );

    let rawTx = {
      to: address,
      data: data,
      from: getCurrentWalletAddress(),
    };

    let finalTx;
    if (useBiconomy) {
      // Adding 5.000.000 as the internal gas limit because biconomy is awkward that way
      finalTx = {
        ...rawTx,
        gasLimit: 5000000,
        value: toHexString(txValue),
      };
    } else {
      finalTx = { ...rawTx, value: toHexString(txValue) };
    }

    let transactionHash = await provider.send('eth_sendTransaction', [finalTx]);
    let receipt = await provider.waitForTransaction(transactionHash);

    // status 0 means it failed
    if (receipt.status == 0) {
      throw '';
    }
    return receipt;
  } catch (error) {
    console.log(error);
    console.log({
      abi: abi,
      address: address,
      functionSignature: functionSignature,
      params: params,
      walletAddress: getCurrentWalletAddress(),
    });
    return processSendError(error);
  }
};

export const callStatic = async (
  abi,
  address,
  functionSignature,
  params = [],
  chain = EChain.ETHEREUM,
) => {
  try {
    let provider;
    if (process.env.REACT_APP_NET === 'testnet' && chain == EChain.ETHEREUM) {
      provider = getReadOnlyProvider(chain);
    } else {
      provider = walletProvider;
    }
    const signer = provider.getSigner();
    const contract = new ethers.Contract(address, abi, signer);

    const method = contract.callStatic[functionSignature].apply(null, params);

    let txResult = await method;

    if (ethers.BigNumber.isBigNumber(txResult)) {
      return txResult.toString();
    }

    return txResult;
  } catch (error) {
    console.log(error);
    console.log({
      abi: abi,
      address: address,
      functionSignature: functionSignature,
      params: params,
      walletAddress: walletAddress,
    });
    return processSendError(error);
  }
};

export const sendMetaTransaction = async (
  abi,
  address,
  functionSignature,
  params = [],
  chain,
  useBiconomy = false,
) => {
  let provider, signer;

  try {
    if (useBiconomy) {
      const biconomy = await startBiconomy(chain, walletProvider);
      provider = biconomy.getEthersProvider();
      signer = biconomy.getSignerByAddress(walletAddress);
    } else {
      provider = walletProvider;
      signer = provider.getSigner();
    }
    const metaTransactionAbi = [
      {
        inputs: [],
        name: 'name',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },

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
    ];

    const readOnlyProvider = await getReadOnlyProvider(chain);
    const readOnlyContract = new ethers.Contract(
      address,
      metaTransactionAbi,
      readOnlyProvider,
    );
    const contract = new ethers.Contract(address, metaTransactionAbi, signer);

    const domainType = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ];

    const metaTransactionType = [
      { name: 'nonce', type: 'uint256' },
      { name: 'from', type: 'address' },
      { name: 'functionSignature', type: 'bytes' },
    ];

    const domainData = {
      name: await readOnlyContract.name(),
      version: '1',
      verifyingContract: address,
      salt: ethers.utils.hexZeroPad(
        ethers.BigNumber.from(await getCurrentChainId()).toHexString(),
        32,
      ),
    };

    const contractInterface = new ethers.utils.Interface(abi);

    const nonce = await getAddressNonce(address, walletAddress, chain);

    const data = contractInterface.encodeFunctionData(
      functionSignature,
      params,
    );

    const message = {
      nonce: parseInt(nonce),
      from: walletAddress,
      functionSignature: data,
    };

    const dataToSign = JSON.stringify({
      types: {
        EIP712Domain: domainType,
        MetaTransaction: metaTransactionType,
      },
      domain: domainData,
      primaryType: 'MetaTransaction',
      message: message,
    });

    const signature = await provider.send('eth_signTypedData_v4', [
      walletAddress,
      dataToSign,
    ]);
    const { r, s, v } = getSignatureParameters(signature);
    const tx = await contract.executeMetaTransaction(
      walletAddress,
      data,
      r,
      s,
      v,
    );

    return { transactionHash: tx.hash };
  } catch (error) {
    console.log(error);
    console.log({
      abi: abi,
      address: address,
      functionSignature: functionSignature,
      params: params,
      walletAddress: walletAddress,
    });
    throw processSendError(error);
  }
};

export const sendPermit = async (
  address,
  spenderAddress,
  chain,
  useBiconomy = false,
) => {
  let provider, signer;

  try {
    if (useBiconomy) {
      const biconomy = await startBiconomy(chain, walletProvider);
      provider = biconomy.getEthersProvider();
      signer = biconomy.getSignerByAddress(walletAddress);
    } else {
      provider = walletProvider;
      signer = provider.getSigner();
    }

    const permitAbi = [
      {
        inputs: [],
        name: 'name',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
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
    ];

    const readOnlyProvider = await getReadOnlyProvider(chain);
    const readOnlyContract = new ethers.Contract(
      address,
      permitAbi,
      readOnlyProvider,
    );
    const contract = new ethers.Contract(address, permitAbi, signer);

    const domainType = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'verifyingContract', type: 'address' },
      { name: 'salt', type: 'bytes32' },
    ];

    const permitType = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ];

    const domainData = {
      name: await readOnlyContract.name(),
      version: '1',
      verifyingContract: address,
      salt: ethers.utils.hexZeroPad(
        ethers.BigNumber.from(await getCurrentChainId()).toHexString(),
        32,
      ),
    };

    const nonce = await getAddressNonce(address, walletAddress, chain);

    const message = {
      owner: walletAddress,
      spender: spenderAddress,
      value: maximumUint256Value,
      nonce: nonce,
      deadline: maximumUint256Value,
    };

    const dataToSign = JSON.stringify({
      types: {
        EIP712Domain: domainType,
        Permit: permitType,
      },
      domain: domainData,
      primaryType: 'MetaTransaction',
      message: message,
    });

    const signature = await provider.send('eth_signTypedData_v4', [
      walletAddress,
      dataToSign,
    ]);
    const { r, s, v } = getSignatureParameters(signature);
    const tx = await contract.permit(
      message.owner,
      message.spender,
      message.value,
      message.deadline,
      v,
      r,
      s,
    );

    return { transactionHash: tx.hash };
  } catch (error) {
    console.log(error);
    console.log({
      address: address,
      spenderAddress: spenderAddress,
      walletAddress: walletAddress,
    });
    throw processSendError(error);
  }
};

export const approve = async (
  farmAddress,
  tokenAddress,
  chain = EChain.POLYGON,
  useBiconomy = false,
) => {
  let tx;
  try {
    if (chain != EChain.POLYGON || !useBiconomy) {
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

      tx = await sendTransaction(
        abi,
        tokenAddress,
        'approve(address,uint256)',
        [farmAddress, maximumUint256Value],
        chain,
      );
    } else {
      // if the token can only be approved with permit
      if (permitOnlyTokenAddresses.includes(tokenAddress)) {
        tx = await sendPermit(tokenAddress, farmAddress, chain, useBiconomy);
      } else {
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

        tx = await sendMetaTransaction(
          abi,
          tokenAddress,
          'approve(address,uint256)',
          [farmAddress, maximumUint256Value],
          chain,
          useBiconomy,
        );
      }
    }
  } catch (error) {
    throw error;
  }

  return tx;
};

export const getReadOnlyProvider = chain => {
  const providerUrl =
    chain === EChain.ETHEREUM
      ? ethereumProviderUrl
      : chain === EChain.POLYGON
      ? polygonProviderUrl
      : optimisimProviderUrl;
  return new ethers.providers.JsonRpcProvider(providerUrl, 'any');
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
    console.log({
      abi: abi,
      address: address,
      functionSignature: functionSignature,
      params: params,
      error: error,
    });
  }
};

export const QueryFilter = async (
  abi,
  address,
  eventSignature,
  params,
  blockNumber,
  chain,
  toBlockNumber = undefined,
) => {
  const readOnlyProvider = getReadOnlyProvider(chain);
  const contract = new ethers.Contract(address, abi, readOnlyProvider);

  try {
    const logs = await contract.queryFilter(
      contract.filters[eventSignature].apply(null, params),
      blockNumber,
      toBlockNumber || blockNumber,
    );

    return logs;
  } catch (error) {
    console.log(abi, address, eventSignature, params);
    // here do all error handling to readable stuff
    console.log(error);
  }
};

export const QueryFilterWithoutBlock = async (
  abi,
  address,
  eventSignature,
  params,
  chain,
) => {
  const readOnlyProvider = getReadOnlyProvider(chain);
  const contract = new ethers.Contract(address, abi, readOnlyProvider);

  try {
    const filter = contract.filters[eventSignature].apply(null, params);
    const results = await contract.queryFilter(filter);

    return results;
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
    highestEstimatedBlock?.number -
      Math.floor(highestEstimatedBlock?.timestamp - startTimestamp),
  );
  let closestBlock;

  while (
    lowestEstimatedBlock?.number != undefined &&
    highestEstimatedBlock?.number != undefined &&
    lowestEstimatedBlock?.number <= highestEstimatedBlock?.number
  ) {
    closestBlock = await provider.getBlock(
      Math.floor(
        (highestEstimatedBlock?.number + lowestEstimatedBlock?.number) / 2,
      ),
    );
    if (closestBlock?.timestamp == startTimestamp) {
      return closestBlock?.number;
    } else if (closestBlock?.timestamp > startTimestamp) {
      highestEstimatedBlock = closestBlock;
    } else {
      lowestEstimatedBlock = closestBlock;
    }
  }
  return null;
};

export const getTokenValueUsingUniswap = async (
  sellTokenAddress: string,
  buyTokenAddress: string,
  sellDecimals: number,
  buyDecimals: number,
): Promise<number> => {
  try {
    const provider = getReadOnlyProvider(EChain.ETHEREUM);
    const quoterAddress = EEthereumAddresses.UNISWAPQUOTER;

    const quoterContract = new ethers.Contract(
      quoterAddress,
      Quoter.abi,
      provider,
    );

    let valueToConvert = toDecimals(1, sellDecimals);

    let fee;

    const sellToBuyPoolAddress = getUniswapPoolAddress(
      sellTokenAddress,
      buyTokenAddress,
    );

    if (sellToBuyPoolAddress) {
      const sellToBuyPoolContract = new ethers.Contract(
        sellToBuyPoolAddress,
        IUniswapV3PoolABI.abi,
        provider,
      );

      fee = await sellToBuyPoolContract.fee();
    } else {
      // there was no direct pool from sell to buy
      // let's go for sell -> eth -> buy
      const sellToEthPoolAddress = getUniswapPoolAddress(
        sellTokenAddress,
        EEthereumAddresses.WETH,
      );

      const sellToEthPoolContract = new ethers.Contract(
        sellToEthPoolAddress,
        IUniswapV3PoolABI.abi,
        provider,
      );

      fee = await sellToEthPoolContract.fee();

      const amountInETH = await quoterContract.callStatic.quoteExactInputSingle(
        sellTokenAddress,
        EEthereumAddresses.WETH,
        fee,
        valueToConvert,
        0,
      );

      // value to sell becomes the amount in eethereum
      valueToConvert = amountInETH.toNumber();
      // the sellTokenAddress becomes eth address
      sellTokenAddress = EEthereumAddresses.WETH;

      // gets pool to convert eth into buy token
      const ethToBuyPoolAddress = getUniswapPoolAddress(
        EEthereumAddresses.WETH,
        buyTokenAddress,
      );

      const ethToBuyPoolContract = new ethers.Contract(
        ethToBuyPoolAddress,
        IUniswapV3PoolABI.abi,
        provider,
      );

      fee = await ethToBuyPoolContract.fee();
    }

    const quotedAmountOut =
      await quoterContract.callStatic.quoteExactInputSingle(
        sellTokenAddress,
        buyTokenAddress,
        fee,
        valueToConvert,
        0,
      );

    const price = +fromDecimals(quotedAmountOut, buyDecimals);
    return price;
  } catch (error) {
    console.log(sellTokenAddress, buyTokenAddress, error);
    throw 'Something went wrong while fetching prices. Please try again later';
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

    case EChain.OPTIMISM:
      ibAlluoAddresses = {
        usd: EOptimismAddresses.IBALLUOUSD,
        eth: EOptimismAddresses.IBALLUOETH,
        btc: EOptimismAddresses.IBALLUOBTC,
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

/**
 * @description Get meta transaction nonce for on contract.
 * @param {string} metaTxContractAddress - Contract address to which nonce is requested.
 * @param {string} user - Address of user whose nonce is requested.
 * @returns {Promise<number>} User nonce.
 */
async function getAddressNonce(metaTxContractAddress, user, chain) {
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

  const metaTxContract = new ethers.Contract(
    metaTxContractAddress,
    abi,
    await getReadOnlyProvider(chain),
  );

  // get user nonce
  let nonce;
  try {
    if (usesNoncesAddresses.includes(metaTxContractAddress)) {
      nonce = await metaTxContract.nonces(user);
    } else {
      nonce = await metaTxContract.getNonce(user);
    }
  } catch (error) {
    console.log(error);
  }

  return nonce;
}

const getSignatureParameters = signature => {
  if (!ethers.utils.isHexString(signature)) {
    throw new Error(
      'Given value "'.concat(signature, '" is not a valid hex string.'),
    );
  }
  let r = signature.slice(0, 66);
  let s = '0x'.concat(signature.slice(66, 130));
  let v = ethers.BigNumber.from(
    '0x'.concat(signature.slice(130, 132)),
  ).toNumber();
  if (![27, 28].includes(v)) v += 27;

  return {
    r: r,
    s: s,
    v: v,
  };
};

export const getBalanceOf = async (
  tokenAddress,
  tokenDecimals = 18,
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
    [getCurrentWalletAddress()],
    chain,
  );

  return fromDecimals(balance, tokenDecimals);
};

export const getBalance = async (
  tokenAddress,
  tokenDecimals = 18,
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
    [getCurrentWalletAddress()],
    chain,
  );

  return fromDecimals(balance, tokenDecimals);
};

export const signerGetBalance = async (tokenDecimals = 18) => {
  const signer = await getProvider().getSigner();

  const balance = (await signer.getBalance()).toString();

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
    [getCurrentWalletAddress(), spenderAddress],
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

export const getTotalAssetSupply = async (
  farmAddress,
  chain = EChain.POLYGON,
) => {
  const abi = [
    {
      inputs: [],
      name: 'totalAssetSupply',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const totalAssetSupply = await callContract(
    abi,
    farmAddress,
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

  return ethers.utils.formatEther(totalAssetSupply);
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
    [getCurrentWalletAddress()],
    chain,
  );

  return ethers.utils.formatEther(userDepositedAmount);
};

export const getInterest = async (tokenAddress, chain = EChain.POLYGON) => {
  const abi = [
    {
      inputs: [],
      name: 'annualInterest',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const interest = await callContract(
    abi,
    tokenAddress,
    'annualInterest()',
    null,
    chain,
  );

  return fromDecimals(interest, 2);
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

// fiatIds:
// USD: 0
// EUR: 1
// ETH: 2
export const getTokenValueUsingPriceFeedRouter = async (
  lPTokenAddress: string,
  fiatId = EFiatId.USD,
  chain = EChain.ETHEREUM,
): Promise<number> => {
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

  const priceFeedRouter =
    chain == EChain.ETHEREUM
      ? EEthereumAddresses.PRICEFEEDROUTER
      : chain == EChain.POLYGON
      ? EPolygonAddresses.PRICEFEEDROUTER
      : EOptimismAddresses.PRICEFEEDROUTER;

  const valueInFiat = await callContract(
    abi,
    priceFeedRouter,
    'getPrice(address,uint256)',
    [lPTokenAddress, fiatId],
    chain,
  );

  return +fromDecimals(valueInFiat.value.toString(), valueInFiat.decimals);
};

export const getTokenAmountValueUsingPriceFeedRouter = async (
  tokenAddress: string,
  amountInDecimals,
  fiatId = EFiatId.USD,
  chain = EChain.ETHEREUM,
): Promise<number> => {
  const abi = [
    {
      inputs: [
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
        {
          internalType: 'uint256',
          name: 'fiatId',
          type: 'uint256',
        },
      ],
      name: 'getPriceOfAmount',
      outputs: [
        {
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
        {
          internalType: 'uint8',
          name: 'decimals',
          type: 'uint8',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  const priceFeedRouter =
    chain == EChain.ETHEREUM
      ? EEthereumAddresses.PRICEFEEDROUTER
      : chain == EChain.POLYGON
      ? EPolygonAddresses.PRICEFEEDROUTER
      : EOptimismAddresses.PRICEFEEDROUTER;

  const valueInFiat = await callContract(
    abi,
    priceFeedRouter,
    'getPriceOfAmount(address,uint256,uint256)',
    [tokenAddress, amountInDecimals, fiatId],
    chain,
  );

  return +fromDecimals(valueInFiat.value.toString(), valueInFiat.decimals);
};
