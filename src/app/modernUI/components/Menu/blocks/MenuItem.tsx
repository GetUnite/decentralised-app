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
    isStrategyDashboardPage
  } = useCurrentPath();

  const selectedStyle = {
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
        weight={isFarmPage ? 700 : 'normal'}
        style={isFarmPage ? selectedStyle : {}}
        onClick={() => navigate(modernUiPaths.MAIN)}
      />
      <Anchor
        label="autoInvest"
        size="medium"
        weight={isAutoInvestPage ? 700 : 'normal'}
        style={isAutoInvestPage ? selectedStyle : {}}
        onClick={() => navigate(modernUiPaths.AUTOINVEST)}
      />
      <Anchor
        label="transfer"
        size="medium"
        weight={isTransferPage ? 700 : 'normal'}
        style={isTransferPage ? selectedStyle : {}}
        onClick={() => navigate(modernUiPaths.TRANSFER)}
      />
      <Anchor
        label="stake"
        size="medium"
        weight={isStakePage ? 700 : 'normal'}
        style={isStakePage ? selectedStyle : {}}
        onClick={() => navigate(modernUiPaths.STAKE)}
      />
      <Anchor
        label="buy"
        size="medium"
        weight={isBuyPage ? 700 : 'normal'}
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

      <Anchor
        label="strategy dashboard"
        size="medium"
        weight={isStrategyDashboardPage ? 700 : 'normal'}
        style={isStrategyDashboardPage ? selectedStyle : {}}
        onClick={() => navigate(modernUiPaths.strategyDashboard)
        }
      />
    </Box>
  );
};
