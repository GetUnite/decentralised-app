import { walletAccount } from 'app/common/state/atoms';
import { Box, Text } from 'grommet';
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

  const headingText = (
    <>
      {/*!canStartStreams ? (
        <span>
          Great job, you are streaming the maximum number of concurrent streams
          available.
        </span>
      ) : (
        <>
          {hasStreams ? (
            <span>You have 1 active stream and 1 more stream available.</span>
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
              )*/}
      <span>AutoInvest streams have been retired</span>
    </>
  );

  return (
    <>
      {isLoading ? (
        <Skeleton count={1} height="50px" borderRadius="20px" />
      ) : (
        <Text size="36px" weight="bold">
          {!walletAccountAtom
            ? 'Connect your wallet to see your available assets to stream.'
            : headingText}
        </Text>
      )}
      <Box margin={{ top: '35px' }}>
        {isLoading && walletAccountAtom ? (
          <Box fill>
            <Skeleton count={2} height="22px" borderRadius="20px" />
          </Box>
        ) : (
          <Text size="18px">
            AutoInvest streams have been retired, you can only close streams.
            You are unable to create new streams or edit a stream. Please
            contact support@alluo.com if you have any questions or concerns.
            {/*AutoInvest lets you stream dollar-pegged stablecoins to ETH and BTC
            and ETH and BTC to dollar-pegged stablecoins (one way at a time)
        whilst earning yield on all assets you stream.*/}
          </Text>
        )}
      </Box>
    </>
  );
};
