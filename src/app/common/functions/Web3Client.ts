import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/ethereum-provider';
import { Biconomy } from '@biconomy/mexa';

import { EWallets } from 'app/common/constants';
import abiSCEth from 'app/common/constants/abiSCEth.json';
import abiAlluo from 'app/common/constants/abiAlluo.json';
import abiVesting from 'app/common/constants/abiVesting.json';
import abiSCPolygon from 'app/common/constants/abiSCPolygon.json';
import abiPolygonEUR from 'app/common/constants/abiPolygonEUR.json';
import abiPolygonETH from 'app/common/constants/abiPolygonETH.json';
import abiPolygonBTC from 'app/common/constants/abiPolygonBTC.json';
import abiBufferPolygon from 'app/common/constants/abiBufferPolygon.json';
import abiHandlerPolygon from 'app/common/constants/abiHandlerPolygon.json';
import abiVault from 'app/common/constants/abiVault.json';
import abiWETH from 'app/common/constants/abiWETH.json';
import EthIbAlluoUSDAbi from 'app/common/abis/EthIbAlluoUSD.json';
import EthIbAlluoEURAbi from 'app/common/abis/EthIbAlluoEUR.json';
import EthIbAlluoETHAbi from 'app/common/abis/EthIbAlluoETH.json';
import EthIbAlluoBTCAbi from 'app/common/abis/EthIbAlluoBTC.json';

import { TTokenInfo } from 'app/common/state/atoms';
import { fromDecimals, maximumUint256Value, toDecimals } from './utils';

enum EEthereumAddressesTestnet {
  IBALLUOUSD = '0xc622244881FF63d0b1C1Eb3cEad17F06fE066600',
  IBALLUOEUR = '0xefb6CA5c2b716C259EaBFa1Fb0517B46c02FE9d1',
  IBALLUOETH = '0x9d75C26Dd3B6B1Cf5B30A5BEF78bb7B08BA8f833',
  IBALLUOBTC = '0x72b7091A4272D2d23b3e7cBec3D1df85B72d7B12',
  VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8', //
  WETH = '0x66Ac11c106C3670988DEFDd24BC75dE786b91095',
  ALLUO = '0x8F45B571e310bCb61DDfe176C396e9109CF1b309',
  PROXY = '0xF295EE9F1FA3Df84493Ae21e08eC2e1Ca9DebbAf', //
  USDC = '0x0b6bb9E47179390B7Cf708b57ceF65a44a8038a9',
}

enum EEthereumAddressesMainnet {
  IBALLUOUSD = '0xf555b595d04ee62f0ea9d0e72001d926a736a0f6',
  IBALLUOEUR = '0xeb38D2f6a745Bd3f466F3F20A617D2C615b316eE',
  IBALLUOETH = '0x98f49aC358187116462BDEA748daD1Df480865d7',
  IBALLUOBTC = '0xb4FFDec68c297B278D757C49c5094dde53f2F878',
  VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  ALLUO = '0x1e5193ccc53f25638aa22a940af899b692e10b09',
  PROXY = '0xF295EE9F1FA3Df84493Ae21e08eC2e1Ca9DebbAf',
  USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
}
/**To Delete */
enum EEthAddressesRinkeby {
  ALLUO = '0x2963fC19f29F14d81434B4bF290Ed7e94b0c0E89',
  VESTING = '0x2CEB5c120ba472879973784dbb551a6F6ea79ab4',
  PROXY = '0xC8ac54Dcbc2115e2d491dFC63a3E8169f4a63725',
}
enum EEthAddressesKovan {
  PROXY_USD = '0xF555B595D04ee62f0EA9D0e72001D926a736A0f6',
  PROXY_EUR = '0xeb38D2f6a745Bd3f466F3F20A617D2C615b316eE',
  PROXY_ETH = '0x98f49aC358187116462BDEA748daD1Df480865d7',
  PROXY_BTC = '0xb4FFDec68c297B278D757C49c5094dde53f2F878',
  VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  WETH = '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1',
  ALLUO = '0x8fb4192942011c83df48d15800f22f7d3a6b0974',
  LINK = '0xa36085F69e2889c224210F603D836748e7dC0088', // CHAIN LINK TOKEN
  USDC = '0xc2569dd7d0fd715B054fBf16E75B001E5c0C1115',
}
enum EEthAddressesMainnet {
  PROXY_USD = '0xf555b595d04ee62f0ea9d0e72001d926a736a0f6',
  PROXY_EUR = '0xeb38D2f6a745Bd3f466F3F20A617D2C615b316eE',
  PROXY_ETH = '0x98f49aC358187116462BDEA748daD1Df480865d7',
  PROXY_BTC = '0xb4FFDec68c297B278D757C49c5094dde53f2F878',
  VAULT = '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
  WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  ALLUO = '0x1e5193ccc53f25638aa22a940af899b692e10b09',
  PROXY = '0xF295EE9F1FA3Df84493Ae21e08eC2e1Ca9DebbAf',
  LINK = '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
}
/***/
enum EPolygonAddressesMumbai {
  // PROXY = '0x8BB0660284eE22A11e9e511744d21A9e1E1b669E',
  IBALLUOUSD = '0x71402a46d78a10c8ee7e7cdef2affec8d1e312a1',
  IBALLUOEUR = '0xb1a6a9693381073168ee9A0dFcb8691F4cbf7f49',
  IBALLUOETH = '0xC7600AEECc60C72b22E28f77A584C40dD169aa2c',
  IBALLUOBTC = '0xC7600AEECc60C72b22E28f77A584C40dD169aa2c',
  BUFFER = '0xf9f9381fbc5225180015b1f0eab6c33dbf0b37ab',
  HANDLER = '0xF877605269bB018c96bD1c93F276F834F45Ccc3f',
}
enum EPolygonAddressesMainnet {
  IBALLUOUSD = '0xc2dbaaea2efa47ebda3e572aa0e55b742e408bf6',
  IBALLUOEUR = '0xc9d8556645853C465D1D5e7d2c81A0031F0B8a92',
  IBALLUOETH = '0xc677B0918a96ad258A68785C2a3955428DeA7e50',
  IBALLUOBTC = '0xf272ff86c86529504f0d074b210e95fc4cfcdce2',
  BUFFER = '0xa248Ba96d72005114e6C941f299D315757877c0e',
  HANDLER = '0x31a3439Ac7E6Ea7e0C0E4b846F45700c6354f8c1',
}

const EPolAddresses =
  process.env.REACT_APP_POL_NET === 'mainnet'
    ? EPolygonAddressesMainnet
    : EPolygonAddressesMumbai;

const EEthereumAddresses =
  process.env.REACT_APP_NET === 'mainnet'
    ? EEthereumAddressesMainnet
    : EEthereumAddressesTestnet;

/**To Delete */
const EEthAddresses =
  process.env.REACT_APP_ETH_NET === 'mainnet'
    ? EEthAddressesMainnet
    : EEthAddressesRinkeby;

const EEthAddressesForBuy =
  process.env.REACT_APP_ETH_NET === 'mainnet'
    ? EEthAddressesMainnet
    : EEthAddressesKovan;
/***/
export const isExpectedPolygonEvent = (type, depositAddress) => {
  if (type === 'usd') {
    return depositAddress === EPolAddresses.IBALLUOUSD;
  }
  if (type === 'eur') {
    return depositAddress === EPolAddresses.IBALLUOEUR;
  }
  if (type === 'eth') {
    return depositAddress === EPolAddresses.IBALLUOETH;
  }
  if (type === 'btc') {
    return depositAddress === EPolAddresses.IBALLUOBTC;
  }
  throw Error('isExpectedPolygonEvent: Wrong coin type');
};

const mutlipleProviderUrls = {
  polygon: {
    mainnet: [
      'https://polygon-rpc.com/',
      'https://polygon-mainnet.g.alchemy.com/v2/rXD0-xC6kL_3_CSI5wHfWfrOI65MJe4A',
      'https://matic.getblock.io/mainnet/?api_key=bc31946e-bc34-4af5-a215-449e3ef5a261',
    ],
    testnet: [
      'https://polygon-mumbai.g.alchemy.com/v2/AyoeA90j3ZUTAePwtDKNWP24P7F67LzM',
      'https://matic.getblock.io/testnet/?api_key=bc31946e-bc34-4af5-a215-449e3ef5a261',
    ],
  },
  ethereum: {
    mainnet: [
      'https://eth-mainnet.g.alchemy.com/v2/BQ85p2q56v_fKcKachiDuBCdmpyNCWZr',
      'https://eth.getblock.io/mainnet/?api_key=bc31946e-bc34-4af5-a215-449e3ef5a261',
    ],
    testnet: [
      'https://eth.getblock.io/testnet/?api_key=bc31946e-bc34-4af5-a215-449e3ef5a261',
      'https://eth-rinkeby.alchemyapi.io/v2/HZvZLbLvKsvsAkHX35r3LTLYEqsl4HpP',
    ],
  },
};

let ethRinkebyUrl = mutlipleProviderUrls.ethereum.testnet[0];

let ethKovanUrl = 'https://kovan.etherscan.io';
let ethMainnetUrl = mutlipleProviderUrls.ethereum.mainnet[0];
let ethProviderUrl =
  process.env.REACT_APP_ETH_NET === 'mainnet' ? ethMainnetUrl : ethRinkebyUrl;

let ethProviderUrlForKovan =
  process.env.REACT_APP_ETH_NET === 'mainnet' ? ethMainnetUrl : ethKovanUrl;

let polMainnetUrl = mutlipleProviderUrls.polygon.mainnet[0];
let polMumbaiUrl = mutlipleProviderUrls.polygon.testnet[0];

let polygonProviderUrl =
  process.env.REACT_APP_POL_NET === 'mainnet' ? polMainnetUrl : polMumbaiUrl;

declare let window: any;

export enum EChain {
  ETHEREUM,
  POLYGON,
}

export enum EChainId {
  ETH_MAINNET = 1,
  ETH_RINKEBY = 4,
  ETH_KOVAN = 42,
  POL_MAINNET = 137,
  POL_MUMBAI = 80001,
}

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
let walletName: EWallets;
let web3: WalletConnectProvider | any;
let wcProvider;

export const connectToMetamask = async () => {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });
  web3 = new Web3(window.ethereum);
  web3.eth.handleRevert = true;
  walletAddress = accounts[0];
  walletName = EWallets.METAMASK;

  return walletAddress;
};

export const connectToWalletconnect = async () => {
  wcProvider = new WalletConnectProvider({
    rpc: {
      [EChainId.ETH_MAINNET]: ethMainnetUrl,
      [EChainId.ETH_RINKEBY]: ethRinkebyUrl,
      [EChainId.POL_MAINNET]: polMainnetUrl,
      [EChainId.POL_MUMBAI]: polMumbaiUrl,
    },
    qrcode: true,
  });

  const accounts = await wcProvider.enable();

  web3 = new Web3(wcProvider as any);

  walletAddress = accounts[0];
  walletName = EWallets.WALLETCONNECT;
  return { walletAddress, provider: wcProvider };
};

export const changeNetwork = async (chain: EChain, testNet?: EChainId) => {
  if (walletName === EWallets.METAMASK) {
    let chainId, chainName, nativeCurrency, rpcUrls;

    if (chain === EChain.ETHEREUM) {
      nativeCurrency = { name: 'ETH', decimals: 18, symbol: 'ETH' };
      rpcUrls = [ethProviderUrl];
      if (process.env.REACT_APP_ETH_NET === 'mainnet') {
        chainId = EChainId.ETH_MAINNET;
      } else if (process.env.REACT_APP_ETH_NET === 'rinkeby') {
        chainId = testNet || EChainId.ETH_RINKEBY;
      }
    } else if (chain === EChain.POLYGON) {
      nativeCurrency = { name: 'MATIC', decimals: 18, symbol: 'MATIC' };
      rpcUrls = [polygonProviderUrl];
      if (process.env.REACT_APP_POL_NET === 'mainnet') {
        chainName = 'Polygon Mainnet';
        chainId = EChainId.POL_MAINNET;
      } else if (process.env.REACT_APP_POL_NET === 'mumbai') {
        chainName = 'Polygon Mumbai';

        chainId = EChainId.POL_MUMBAI;
      }
    }
    if ((await getCurrentChainId()) !== chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: Web3.utils.toHex(chainId) }],
        });
      } catch (err) {
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName,
                chainId: Web3.utils.toHex(chainId),
                nativeCurrency,
                rpcUrls,
              },
            ],
          });
        } else {
          throw new Error(err.message);
        }
      }
    }
  } else if (
    chain === EChain.POLYGON &&
    walletName === EWallets.WALLETCONNECT
  ) {
    const netId = await web3.eth.getChainId();

    if (netId !== EChainId.POL_MAINNET) {
      throw new Error('Change your wallet network to Polygon');
    }
  }
};

export const getCurrentChainId = async () => {
  const chainId = await web3?.eth.getChainId();

  return Web3.utils.hexToNumber(chainId);
};

export const getChainById = chainId => {
  return chainId === EChainId.POL_MAINNET || chainId === EChainId.POL_MUMBAI
    ? EChain.POLYGON
    : chainId === EChainId.ETH_MAINNET ||
      chainId === EChainId.ETH_KOVAN ||
      chainId === EChainId.ETH_RINKEBY
    ? EChain.ETHEREUM
    : null;
};

export const getCurrentChain = async () => {
  const chainId = await getCurrentChainId();

  return getChainById(chainId);
};

export const registerChainChanged = async callback => {
  if (walletName === EWallets.WALLETCONNECT) {
    wcProvider.on('chainChanged', callback);
  } else if (walletName === EWallets.METAMASK) {
    window.ethereum.on('chainChanged', callback);
  }
};

export const unregisterChainChanged = async callback => {
  if (walletName === EWallets.WALLETCONNECT) {
    wcProvider.removeListener('chainChanged', callback);
  } else if (walletName === EWallets.METAMASK) {
    window.ethereum.removeListener('chainChanged', callback);
  }
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
    // here do all error handling to readable stuff
    console.log(error);
    throw error;
  }
};

const callContract = async (abi, address, functionSignature, params, chain) => {
  const provider =
    chain === EChain.ETHEREUM ? ethProviderUrl : polygonProviderUrl;
  const web3ToUse = new Web3(new Web3.providers.HttpProvider(provider));
  const contract = new web3ToUse.eth.Contract(abi as any, address);

  try {
    const method = contract.methods[functionSignature].apply(null, params);
    const tx = await method.call({
      from: walletAddress,
    });

    return tx;
  } catch (error) {
    // here do all error handling to readable stuff
    console.log(error);
  }
};

let ethProvider = new Web3(new Web3.providers.HttpProvider(ethProviderUrl));
let ethProviderKovanOrMain = new Web3(
  new Web3.providers.HttpProvider(ethProviderUrlForKovan),
);
let polygonProvider = new Web3(
  new Web3.providers.HttpProvider(polygonProviderUrl),
);
const getEthContractInstance = () =>
  new ethProvider.eth.Contract(abiSCEth as any, EEthAddresses.PROXY);
// let ethContractInstance = getEthContractInstance();
const getWethContractInstance = () =>
  new ethProviderKovanOrMain.eth.Contract(
    abiWETH as any,
    EEthAddressesForBuy.WETH,
  );
let wethContractInstance = getWethContractInstance();
const getPolygonUSDContractInstance = () =>
  new polygonProvider.eth.Contract(
    abiSCPolygon as any,
    EPolAddresses.IBALLUOUSD,
  );
let polygonUSDContractInstance = getPolygonUSDContractInstance();
const getPolygonEURContractInstance = () =>
  new polygonProvider.eth.Contract(
    abiPolygonEUR as any,
    EPolAddresses.IBALLUOEUR,
  );
let polygonEURContractInstance = getPolygonEURContractInstance();

const getPolygonETHContractInstance = () =>
  new polygonProvider.eth.Contract(
    abiPolygonETH as any,
    EPolAddresses.IBALLUOETH,
  );
let polygonETHContractInstance = getPolygonETHContractInstance();

const getPolygonBTCContractInstance = () =>
  new polygonProvider.eth.Contract(
    abiPolygonBTC as any,
    EPolAddresses.IBALLUOBTC,
  );
let polygonBTCContractInstance = getPolygonBTCContractInstance();

const getEthereumContractInstance = type => {
  let abi, address;
  switch (type) {
    case 'usd':
      abi = abiSCPolygon as any;
      address = EEthAddressesForBuy.PROXY_USD;
      break;

    default:
      break;
  }

  return new ethProviderKovanOrMain.eth.Contract(abi as any, address);
};

const getAlluoTokenInstance = () =>
  new ethProvider.eth.Contract(abiAlluo as any, EEthAddresses.ALLUO);
let alluoTokenInstance = getAlluoTokenInstance();

let vaultContractInstance = new ethProvider.eth.Contract(
  abiVault as any,
  EEthAddressesForBuy.VAULT,
);

let bufferContractInstance = new polygonProvider.eth.Contract(
  abiBufferPolygon as any,
  EPolAddresses.BUFFER,
);

const getHandlerContractInstance = () =>
  new polygonProvider.eth.Contract(
    abiHandlerPolygon as any,
    EPolAddresses.HANDLER,
  );
let handlerContractInstance = getHandlerContractInstance();

export const getIbAlluoContractInstance = (type, chain = EChain.POLYGON) => {
  switch (chain) {
    case EChain.ETHEREUM:
      if (type === 'usd')
        return new ethProviderKovanOrMain.eth.Contract(
          EthIbAlluoUSDAbi as any,
          EEthAddressesForBuy.PROXY_USD,
        );
      if (type === 'eur')
        return new ethProviderKovanOrMain.eth.Contract(
          EthIbAlluoEURAbi as any,
          EEthAddressesForBuy.PROXY_EUR,
        );
      if (type === 'eth')
        return new ethProviderKovanOrMain.eth.Contract(
          EthIbAlluoETHAbi as any,
          EEthAddressesForBuy.PROXY_ETH,
        );
      if (type === 'btc')
        return new ethProviderKovanOrMain.eth.Contract(
          EthIbAlluoBTCAbi as any,
          EEthAddressesForBuy.PROXY_BTC,
        );
      return getEthereumContractInstance(type);
      break;

    case EChain.POLYGON:
    default:
      if (type === 'usd') return polygonUSDContractInstance;
      if (type === 'eur') return polygonEURContractInstance;
      if (type === 'eth') return polygonETHContractInstance;
      if (type === 'btc') return polygonBTCContractInstance;
      break;
  }

  throw new Error('Add instance for ' + type);
};

export const createPolygonProxyInstance = type => {
  if (type === 'usd')
    return new web3.eth.Contract(abiSCPolygon as any, EPolAddresses.IBALLUOUSD);
  if (type === 'eur')
    return new web3.eth.Contract(
      abiPolygonEUR as any,
      EPolAddresses.IBALLUOEUR,
    );
  if (type === 'eth')
    return new web3.eth.Contract(
      abiPolygonETH as any,
      EPolAddresses.IBALLUOETH,
    );
  if (type === 'btc')
    return new web3.eth.Contract(
      abiPolygonBTC as any,
      EPolAddresses.IBALLUOBTC,
    );
};

function wait(delay) {
  return new Promise(resolve => setTimeout(resolve, delay));
}
let triesLeft;
function fetchRetry(url, delay, tries, fetchOptions = {}) {
  function onError(err) {
    triesLeft = tries - 1;
    if (!triesLeft) {
      throw err;
    }
    return wait(delay).then(() =>
      fetchRetry(url, delay, triesLeft, fetchOptions),
    );
  }
  return fetch(url, fetchOptions).catch(onError);
}

let alluoPriceInstance;

const alluoPriceUrl =
  process.env.REACT_APP_ETH_NET === 'mainnet'
    ? 'https://protocol-mainnet.gnosis.io/api'
    : 'https://protocol-mainnet.dev.gnosisdev.com/api';

export const getAlluoPrice = async (): Promise<number> => {
  const pathforUSDC =
    alluoPriceUrl +
    `/v1/markets/${EEthereumAddressesMainnet.ALLUO}-${EEthereumAddressesMainnet.USDC}/sell/1000000000000000000`;

  const usdcPrice = await fetch(pathforUSDC).then(res => res.json());

  alluoPriceInstance = +fromDecimals(usdcPrice.amount, 6);
  return alluoPriceInstance;
};

export const getAlluoPriceInWETH = async (value = 1): Promise<string> => {
  const valueInDecimals = toDecimals(value, 18);

  const pathforWETH =
    alluoPriceUrl +
    `/v1/markets/${EEthereumAddressesMainnet.WETH}-${EEthereumAddressesMainnet.ALLUO}/sell/${valueInDecimals}`;

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
  const totalLockedLPToAlluo = await getEthContractInstance()
    .methods.convertLpToAlluo(totalLockedInLP)
    .call();

  const exactApr =
    ((+Web3.utils.fromWei(rewardPerDistribution) * alluoPrice) /
      (+Web3.utils.fromWei(totalLockedLPToAlluo) * alluoPrice)) *
    100 *
    365;

  return +exactApr.toFixed(2);
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
  const alluoTokenAmountInWei =
    alluoAmount === maximumUint256Value
      ? maximumUint256Value
      : Web3.utils.toWei(String(alluoAmount));

  // TODO: Change EEthAddresses to EEthereumAddresses
  const tx = await sendTransaction(
    abi,
    EEthAddresses.ALLUO,
    'approve(address,uint256)',
    [EEthAddresses.PROXY, alluoTokenAmountInWei],
    EChain.ETHEREUM,
  );

  return tx;
};

export const lockAlluoToken = async (alluoAmount, testNet?: EChainId) => {
  let res;

  await changeNetwork(EChain.ETHEREUM, testNet);
  const contractInstanceFromWallet = new web3.eth.Contract(
    abiSCEth as any,
    EEthAddresses.PROXY,
  );
  const alluoTokenAmountInWei = Web3.utils.toWei(String(alluoAmount));

  res = await contractInstanceFromWallet.methods
    .lock(alluoTokenAmountInWei)
    .send({ from: walletAddress })

    .on('transactionHash', function (hash) {
      console.log(hash);
    })
    .on('error', console.error);

  return res;
};

export const getBalanceOfAlluoUser = async () => {
  const alluoBalance = await alluoTokenInstance.methods
    .balanceOf(walletAddress)
    .call();
  return Web3.utils.fromWei(alluoBalance);
};

export const unlockAlluo = async value => {
  await changeNetwork(EChain.ETHEREUM);
  const contractInstanceFromWallet = new web3.eth.Contract(
    abiSCEth as any,
    EEthAddresses.PROXY,
  );
  const alluoTokenAmountInWei = Web3.utils.toWei(value + '');
  const res = await contractInstanceFromWallet.methods
    .unlock(alluoTokenAmountInWei)
    .send({ from: walletAddress });

  return res;
};

export const unlockAlluoAll = async () => {
  await changeNetwork(EChain.ETHEREUM);
  const contractInstanceFromWallet = new web3.eth.Contract(
    abiSCEth as any,
    EEthAddresses.PROXY,
  );
  const res = await contractInstanceFromWallet.methods
    .unlockAll()
    .send({ from: walletAddress });

  return res;
};

export const withdrawAlluo = async () => {
  await changeNetwork(EChain.ETHEREUM);
  const contractInstanceFromWallet = new web3.eth.Contract(
    abiSCEth as any,
    EEthAddresses.PROXY,
  );

  const res = await contractInstanceFromWallet.methods
    .withdraw()
    .send({ from: walletAddress });

  return res;
};

export const claimLocked = async () => {
  await changeNetwork(EChain.ETHEREUM);

  const contractInstanceFromWallet = new web3.eth.Contract(
    abiSCEth as any,
    EEthAddresses.PROXY,
  );

  const res = await contractInstanceFromWallet.methods
    .claim()
    .send({ from: walletAddress });
  return res;
};

const tokenInstances = {};
export const getListSupportedTokens = async (
  type = 'usd',
  chain = EChain.POLYGON,
) => {
  try {
    const listSupportedTokens = await getIbAlluoContractInstance(type, chain)
      .methods.getListSupportedTokens()
      .call();
    const tokensWithInfo = [];

    const requests = listSupportedTokens.map(async tokenAddress => {
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

const getAbiForCoin = (type, chain = EChain.POLYGON) => {
  let abi;
  switch (chain) {
    case EChain.POLYGON:
      abi = {
        usd: abiSCPolygon as any,
        eur: abiPolygonEUR as any,
        eth: abiPolygonETH as any,
        btc: abiPolygonBTC as any,
      };
      break;

    case EChain.ETHEREUM:
      abi = {
        usd: EthIbAlluoUSDAbi as any,
        eur: EthIbAlluoEURAbi as any,
        eth: EthIbAlluoETHAbi as any,
        btc: EthIbAlluoBTCAbi as any,
      };
      break;
    default:
      break;
  }
  return abi[type];
};

export const getIbAlluoAddress = (type, chain = EChain.POLYGON) => {
  let proxyAddr;
  switch (chain) {
    case EChain.POLYGON:
      proxyAddr = {
        usd: EPolAddresses.IBALLUOUSD,
        eur: EPolAddresses.IBALLUOEUR,
        eth: EPolAddresses.IBALLUOETH,
        btc: EPolAddresses.IBALLUOBTC,
      };
      break;

    case EChain.ETHEREUM:
      proxyAddr = {
        usd: EEthAddressesForBuy.PROXY_USD,
        eur: EEthAddressesForBuy.PROXY_EUR,
        eth: EEthAddressesForBuy.PROXY_ETH,
        btc: EEthAddressesForBuy.PROXY_BTC,
      };
      break;
    default:
      break;
  }

  return proxyAddr[type];
};

export const getStableCoinInfo = async (
  tokenAddress,
  type,
  chain = EChain.POLYGON,
) => {
  if (chain === EChain.POLYGON) {
    tokenInstances[tokenAddress] = new polygonProvider.eth.Contract(
      getAbiForCoin(type),
      tokenAddress,
    );
  } else {
    tokenInstances[tokenAddress] = new ethProviderKovanOrMain.eth.Contract(
      getAbiForCoin(type, EChain.ETHEREUM),
      tokenAddress,
    );
  }

  const symbol = await tokenInstances[tokenAddress].methods.symbol().call();
  const decimals = await tokenInstances[tokenAddress].methods.decimals().call();
  const balance = await tokenInstances[tokenAddress].methods
    .balanceOf(walletAddress)
    .call();

  const allowance = await tokenInstances[tokenAddress].methods
    .allowance(walletAddress, getIbAlluoAddress(type, chain))
    .call();

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
  const proxyAddr = getIbAlluoAddress(type, chain);

  if (chain == EChain.ETHEREUM) {
    const abi = getAbiForCoin(type, chain);
    const stableCoinInstanceFromWallet = new web3.eth.Contract(
      abi,
      tokenAddress,
    );

    const res = await stableCoinInstanceFromWallet.methods
      .approve(proxyAddr, maximumUint256Value)
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
        spender: proxyAddr,
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
        web3.utils.padLeft(proxyAddr, 64).replace('0x', '') +
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

  const ethProxyAddress = EEthAddresses.PROXY;

  const totalAssetSupply = await callContract(
    abi,
    ethProxyAddress,
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

export const listenToBuffer = blockNumber => {
  const bufferInstance = new web3.eth.Contract(
    abiBufferPolygon as any,
    EPolAddresses.BUFFER,
  );

  return bufferInstance.events;
};

export const listenToHandler = blockNumber => {
  const handlerInstance = new web3.eth.Contract(
    abiHandlerPolygon as any,
    EPolAddresses.HANDLER,
  );

  return handlerInstance.events;
};

export const getIfUserHasWithdrawalRequest = async (
  walletAddress,
  type = 'usd',
) => {
  const proxyAddr = getIbAlluoAddress(type);
  const isUserWaiting = await handlerContractInstance.methods
    .isUserWaiting(proxyAddr, walletAddress)
    .call();
  if (!isUserWaiting) return [];
  // const ibAlluoToWithdrawalSystems =
  const ibAlluoToWithdrawalSystems = await handlerContractInstance.methods
    .ibAlluoToWithdrawalSystems(proxyAddr)
    .call();
  console.log('ibAlluoToWithdrawalSystems', ibAlluoToWithdrawalSystems);
  const { lastSatisfiedWithdrawal, lastWithdrawalRequest } =
    ibAlluoToWithdrawalSystems;
  const allWithdrawalRequests = [];

  for (let i = +lastSatisfiedWithdrawal + 1; i <= +lastWithdrawalRequest; i++) {
    const withdrawal = handlerContractInstance.methods
      .getWithdrawal(proxyAddr, i)
      .call();
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

  const wEthAddress = EEthAddressesForBuy.WETH;

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

  const ethProxyAddress = EEthAddresses.PROXY;

  const balance = await callContract(
    abi,
    ethProxyAddress,
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

  const wEthAddress = EEthAddressesForBuy.WETH;
  const vaultAddress = EEthAddressesForBuy.VAULT;

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
    throw 'Something went wrong while trying to approve alluo purchases with WETH';
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

  const wEthAddress = EEthAddressesForBuy.WETH;
  const vaultAddress = EEthAddressesForBuy.VAULT;

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
  // const SOR = new sor.SOR(ethMainnetUrl, '1000000000000000000', 1, 1, '0x85be1e46283f5f438d1f864c2d925506571d544f0002000000000000000001aa')
  await changeNetwork(EChain.ETHEREUM, EChainId.ETH_KOVAN);
  const vaultTokenInstanceFromWallet = new web3.eth.Contract(
    abiVault as any,
    EEthAddressesForBuy.VAULT,
  );

  const swap_struct = {
    poolId:
      process.env.REACT_APP_ETH_NET === 'mainnet'
        ? '0x85be1e46283f5f438d1f864c2d925506571d544f0002000000000000000001aa'
        : '0xb157a4395d28c024a0e2e5fa142a53b3eb726bc6000200000000000000000713',

    kind: 0,
    assetIn: Web3.utils.toChecksumAddress(
      EEthAddressesForBuy.WETH.toLowerCase(),
    ),
    assetOut: Web3.utils
      .toChecksumAddress(EEthAddressesForBuy.ALLUO)
      .toLowerCase(),
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

  const buy = await vaultTokenInstanceFromWallet.methods
    .swap(swap_struct, fund_struct, token_limit, deadline.toString())
    .send({ from: walletAddress });
};

export const getTokenInfo = async (walletAddress, idxOfCall = 0) => {
  let tokenInfo: TTokenInfo = {
    isLoading: false,
  };
  try {
    const getTotalLockedInLB = await getEthContractInstance()
      .methods.totalLocked()
      .call();

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
      walletAddress
        ? getAlluoTokenInstance().methods.balanceOf(walletAddress).call()
        : '',
      walletAddress
        ? getAlluoTokenInstance()
            .methods.allowance(walletAddress, EEthAddresses.PROXY)
            .call()
        : '',
      walletAddress
        ? getEthContractInstance().methods.getClaim(walletAddress).call()
        : '',
      getEthContractInstance().methods.rewardPerDistribution().call(),
      walletAddress
        ? getEthContractInstance()
            .methods.getInfoByAddress(walletAddress)
            .call()
        : '',
      walletAddress
        ? getEthContractInstance()
            .methods.unlockedBalanceOf(walletAddress)
            .call()
        : '',
      getEthContractInstance().methods.withdrawLockDuration().call(),
      getEthContractInstance()
        .methods.convertLpToAlluo(getTotalLockedInLB)
        .call(),
    ]);

    // Change all user vesting infos to human-readable allue value
    const lockedAlluoBalanceOfUser = walletAddress
      ? await getEthContractInstance()
          .methods.convertLpToAlluo(getInfoByAddress.locked_)
          .call()
      : '0';

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
  const tokenAddress = getIbAlluoAddress(type);
  const tokenInstance = getIbAlluoContractInstance(type);

  const symbol = await tokenInstance.methods.symbol().call();
  const decimals = await tokenInstance.methods.decimals().call();
  const balance = await tokenInstance.methods
    .getBalanceForTransfer(walletAddress)
    .call();

  return {
    tokenAddress,
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
  biconomyStatus,
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
      biconomyStatus,
    );

    return tx;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
