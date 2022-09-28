import usdc from 'app/modernUI/images/usdc.svg';
import usdt from 'app/modernUI/images/usdt.svg';
import dai from 'app/modernUI/images/dai.svg';
import frax from 'app/modernUI/images/frax.svg';

import eurt from 'app/modernUI/images/eurt.svg';
import eurs from 'app/modernUI/images/eurs.svg';
import jeur from 'app/modernUI/images/jeur.svg';
import ageur from 'app/modernUI/images/ageur.svg';

import weth from 'app/modernUI/images/weth.svg';

import wbtc from 'app/modernUI/images/wbtc.svg';

import iballuousd from 'app/modernUI/images/iballuousd.svg';
import iballuoeur from 'app/modernUI/images/iballuoeur.svg';
import iballuoeth from 'app/modernUI/images/iballuoeth.svg';
import iballuobtc from 'app/modernUI/images/iballuobtc.svg';

import tokenPlaceholder from 'app/modernUI/images/tokenPlaceholder.svg';

export const TokenIcon = ({ label, size = 24, ...rest }) => {
  let src;

  switch (label) {
    case 'USDC':
    case 'tUSDC':
      src = usdc;
      break;

    case 'USDT':
    case 'tUSDT':
      src = usdt;
      break;

    case 'DAI':
    case 'tDAI':
      src = dai;
      break;

    case 'FRAX':
    case 'tFRAX':
      src = frax;
      break;

    case 'jEUR':
    case 'tjEUR':
      src = jeur;
      break;

    case 'EURT':
    case 'tEURT':
      src = eurt;
      break;

    case 'EURS':
    case 'tEURS':
      src = eurs;
      break;

    case 'agEUR':
    case 'tagEUR':
      src = ageur;
      break;

    case 'WETH':
    case 'tWETH':
      src = weth;
      break;

    case 'WBTC':
    case 'tWBTC':
      src = wbtc;
      break;

    case 'USD':
      src = iballuousd;
      break;

    case 'EUR':
      src = iballuoeur;
      break;

    case 'ETH':
      src = iballuoeth;
      break;

    case 'BTC':
      src = iballuobtc;
      break;

    default:
      src =tokenPlaceholder;
      break;
  }
  return <img width={size} height={size} src={src} alt="tokenIcon" />;
};
