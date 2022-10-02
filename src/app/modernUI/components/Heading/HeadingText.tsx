import { walletAccount } from 'app/common/state/atoms';
import { Box, Paragraph, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';
import { useRecoilState } from 'recoil';

export const HeadingText = ({
  isLoading,
  numberOfAssets,
  numberOfChainsWithAssets,
  ...rest
}) => {
  const [walletAccountAtom] = useRecoilState(walletAccount);

  const headingText = isLoading ? (
    <Box fill>
      <Skeleton count={2} />
    </Box>
  ) : (
    <>
      {numberOfAssets == 0 ? (
        'You don’t have available assets to farm in your wallet.'
      ) : (
        <span>
          You have {numberOfAssets} {numberOfAssets > 1 ? 'assets' : 'asset'}{' '}
          across {numberOfChainsWithAssets}{' '}
          {numberOfChainsWithAssets > 1 ? 'networks' : 'network'} available to
          farm.
        </span>
      )}
    </>
  );

  return (
    <>
      <Text size="36px" weight="bold">
        {!walletAccountAtom
          ? 'Connect your wallet to see your available assets to farm.'
          : headingText}
      </Text>
      <Paragraph margin={{ top: '35px', bottom: '0px' }} fill>
        Fund your wallet using crypto or fiat currency here to start investing.
        Get your yield in the same coin and withdraw at any time with no cost
        and no lock-in period.{' '}
      </Paragraph>
    </>
  );
};
