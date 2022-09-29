import { Box, Anchor } from 'grommet';
import { useCurrentPath, modernUiPaths } from 'app/common/hooks';

export const MenuItem = ({ ...rest }) => {
  const {navigate, isStakePage, isBuyPage, isTransferPage } =
    useCurrentPath();

  return (
    <Box {...rest}>
      <Anchor
        weight="normal"
        label="farm"
        size="medium"
        onClick={() => navigate(modernUiPaths.MAIN)}
      />
      <Anchor
        label="auto-invest"
        size="medium"
        weight={isBuyPage ? 'bold' : 'normal'}
        onClick={() => navigate(modernUiPaths.AUTOINVEST)}
      />
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
        onClick={() => navigate(modernUiPaths.BUY)}
      />
    </Box>
  );
};
