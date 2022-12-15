import { useLocation, useNavigate } from 'react-router-dom';
import { modernUiPaths } from '../constants/paths';

export { modernUiPaths };

export const useCurrentPath = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isFarmPage =
    modernUiPaths.MAIN === location.pathname ||
    location.pathname.includes('farm') ||
    location.pathname.includes('boostfarm');
  const isStakePage = modernUiPaths.STAKE === location.pathname;
  const isBuyPage = modernUiPaths.BUY === location.pathname;
  const isTransferPage = modernUiPaths.TRANSFER === location.pathname;
  const isAutoInvestPage = modernUiPaths.AUTOINVEST === location.pathname;
  const goToMainPage = () => navigate(modernUiPaths.MAIN);
  return {
    path: location.pathname,
    isStakePage,
    isFarmPage,
    isTransferPage,
    isBuyPage,
    isAutoInvestPage,
    navigate,
    goToMainPage,
  };
};
