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
        label="auto-invest"
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
        onClick={() => navigate(modernUiPaths.BUY)}
      />
    </Box>
  );
};
