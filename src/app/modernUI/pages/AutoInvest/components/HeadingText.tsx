import { walletAccount } from 'app/common/state/atoms';
import { Box, Paragraph, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';
import { useRecoilState } from 'recoil';

export const HeadingText = ({ isLoading, numberOfAssets, ...rest }) => {
  const [walletAccountAtom] = useRecoilState(walletAccount);

  const headingText = isLoading ? (
    <Box fill>
      <Skeleton count={1} height="36px" />
    </Box>
  ) : (
    <>
      {numberOfAssets == 0 ? (
        'You don’t have any available assets to stream in your wallet.'
      ) : (
        <span>
          You have {numberOfAssets} {numberOfAssets > 1 ? 'assets' : 'asset'}{' '}
          available to stream.
        </span>
      )}
    </>
  );

  return (
    <>
      <Text size="36px" weight="bold">
        {!walletAccountAtom
          ? 'Connect your wallet to see your available assets to stream.'
          : headingText}
      </Text>
      <Paragraph margin={{ top: '35px', bottom: '0px' }} fill>
        AutoInvest lets you stream dollar-pegged stablecoins to ETH and BTC, or
        ETH and BTC to dollar-pegged stablecoins and earn yield on all assets
        your streams.
      </Paragraph>
    </>
  );
};
