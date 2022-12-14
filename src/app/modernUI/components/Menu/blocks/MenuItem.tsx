import { modernUiPaths, useCurrentPath } from 'app/common/hooks';
import { colors } from 'app/modernUI/theme';
import { Anchor, Box } from 'grommet';

export const MenuItem = ({ ...rest }) => {
  const {
    navigate,
    isFarmPage,
    isStakePage,
    isBuyPage,
    isTransferPage,
    isAutoInvestPage,
  } = useCurrentPath();

  const selectedStyle = {
    paddingBottom: '2px',
    textDecorationLine: 'underline',
    textDecorationColor: colors.BLUE,
    textDecorationThickness: '1px',
    textUnderlineOffset: '6px',
  };

  return (
    <Box {...rest}>
      <Anchor
        label="farm"
        size="medium"
        weight={isFarmPage ? 'bold' : 'normal'}
        style={isFarmPage ? selectedStyle : {}}
        onClick={() => navigate(modernUiPaths.MAIN)}
      />
      <Anchor
        label="autoInvest"
        size="medium"
        weight={isAutoInvestPage ? 'bold' : 'normal'}
        style={isAutoInvestPage ? selectedStyle : {}}
        onClick={() => navigate(modernUiPaths.AUTOINVEST)}
      />
      <Anchor
        label="transfer"
        size="medium"
        weight={isTransferPage ? 'bold' : 'normal'}
        style={isTransferPage ? selectedStyle : {}}
        onClick={() => navigate(modernUiPaths.TRANSFER)}
      />
      <Anchor
        label="stake"
        size="medium"
        weight={isStakePage ? 'bold' : 'normal'}
        style={isStakePage ? selectedStyle : {}}
        onClick={() => navigate(modernUiPaths.STAKE)}
      />
      <Anchor
        label="buy"
        size="medium"
        weight={isBuyPage ? 'bold' : 'normal'}
        style={isBuyPage ? selectedStyle : {}}
        onClick={() =>
          //navigate(modernUiPaths.BUY)
          window.open(
            'https://app.uniswap.org/#/swap?theme=dark&inputCurrency=ETH&outputCurrency=0x1E5193ccC53f25638Aa22a940af899B692e10B09',
            '_blank',
            'noopener,noreferrer',
          )
        }
      />
    </Box>
  );
};
