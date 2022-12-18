import ageur from 'app/modernUI/images/ageur.svg';
import crv from 'app/modernUI/images/crv.svg';
import cvx from 'app/modernUI/images/cvx.svg';
import dai from 'app/modernUI/images/dai.svg';
import eurs from 'app/modernUI/images/eurs.png';
import eurt from 'app/modernUI/images/eurt.svg';
import frax from 'app/modernUI/images/frax.svg';
import iballuobtc from 'app/modernUI/images/iballuobtc.svg';
import iballuoeth from 'app/modernUI/images/iballuoeth.svg';
import iballuoeur from 'app/modernUI/images/iballuoeur.svg';
import iballuousd from 'app/modernUI/images/iballuousd.svg';
import jeur from 'app/modernUI/images/jeur.svg';
import steth from 'app/modernUI/images/steth.svg';
import tokenPlaceholder from 'app/modernUI/images/tokenPlaceholder.svg';
import usdc from 'app/modernUI/images/usdc.svg';
import usdt from 'app/modernUI/images/usdt.svg';
import wbtc from 'app/modernUI/images/wbtc.svg';
import weth from 'app/modernUI/images/weth.svg';

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

    case 'stETH':
      src = steth;
      break;

    case 'CRV':
      src = crv;
      break;
    case 'CVX':
      src = cvx;
      break;

    case 'USD':
    case 'Your USD farm':
      src = iballuousd;
      break;

    case 'Your EUR farm':
    case 'EUR':
      src = iballuoeur;
      break;

    case 'Your ETH farm':
    case 'ETH':
      src = iballuoeth;
      break;

    case 'Your BTC farm':
    case 'BTC':
      src = iballuobtc;
      break;

    default:
      src = tokenPlaceholder;
      break;
  }
  return <img width={size} height={size} src={src} alt="tokenIcon" {...rest} />;
};
