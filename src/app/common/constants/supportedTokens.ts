import { TSupportedToken } from '../types/form';
import { EPolygonAddresses } from './addresses';

export enum ESupportedTokens {
  USDC,
  USDT,
  DAI,
  JEUR,
  EURS,
  EURT,
  PAR,
  WETH,
  WBTC,
  STIBALLUOUSD,
  STIBALLUOETH,
  STIBALLUOEUR,
  STIBALLUOBTC,
}

export const getSupportedToken = (supportedToken): TSupportedToken => {
  switch (supportedToken) {
    case ESupportedTokens.USDC:
      return { address: EPolygonAddresses.USDC, label: 'USDC', sign: '$' };
    case ESupportedTokens.USDC:
      return { address: EPolygonAddresses.USDT, label: 'USDT', sign: '$' };
    case ESupportedTokens.DAI:
      return { address: EPolygonAddresses.DAI, label: 'DAI', sign: '$' };
  }
};
