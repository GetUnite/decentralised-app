import { walletAccount } from 'app/common/state/atoms';
import { Box, Paragraph, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';
import { useRecoilState } from 'recoil';

export const HeadingText = ({
  isLoading,
  numberOfAssets,
  canStartStreams,
  hasStreams,
  ...rest
}) => {
  const [walletAccountAtom] = useRecoilState(walletAccount);

  const headingText = isLoading ? (
    <Box fill>
      <Skeleton count={1} height="36px" />
    </Box>
  ) : (
    <>
      {!canStartStreams ? (
        <span>
          Great job, you are streaming the maximum number of concurrent streams
          available.
        </span>
      ) : (
        <>
          {hasStreams ? (
            <span>
              You have 1 active stream and 1 more stream available.
            </span>
          ) : (
            <>
              {numberOfAssets == 0 ? (
                'You have no assets available to stream.'
              ) : (
                <span>
                  You have {numberOfAssets}{' '}
                  {numberOfAssets > 1 ? 'assets' : 'asset'} available to stream.
                </span>
              )}
            </>
          )}
        </>
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
        AutoInvest lets you stream dollar-pegged stablecoins to ETH and BTC and
        ETH and BTC to dollar-pegged stablecoins (one way at a time) whilst
        earning yield on all assets you stream.
      </Paragraph>
    </>
  );
};
