import { modernUiPaths, useCurrentPath } from 'app/common/hooks';
import { Anchor, Box } from 'grommet';

export const MenuItem = ({ ...rest }) => {
  const {navigate, isStakePage, isBuyPage, isTransferPage, isAutoInvestPage } =
    useCurrentPath();

  return (
    <Box {...rest}>
      <Anchor
        weight="normal"
        label="farm"
        size="medium"
        onClick={() => navigate(modernUiPaths.MAIN)}
      />
      {<Anchor
        label="autoInvest"
        size="medium"
        weight={isAutoInvestPage ? 'bold' : 'normal'}
        onClick={() => navigate(modernUiPaths.AUTOINVEST)}
  />}
      <Anchor
        label="transfer"
        size="medium"
        weight={isTransferPage ? 'bold' : 'normal'}
        onClick={() => navigate(modernUiPaths.TRANSFER)}
      />
      <Anchor
        label="stake"
        size="medium"
        weight={isStakePage ? 'bold' : 'normal'}
        onClick={() => navigate(modernUiPaths.STAKE)}
      />
      <Anchor
        label="buy"
        size="medium"
        weight={isBuyPage ? 'bold' : 'normal'}
        onClick={() => //navigate(modernUiPaths.BUY)
        window.open('https://app.uniswap.org/#/swap?theme=dark&inputCurrency=ETH&outputCurrency=0x1E5193ccC53f25638Aa22a940af899B692e10B09', '_blank', 'noopener,noreferrer')}
      />
    </Box>
  );
};
