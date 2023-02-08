import { toExactFixed } from 'app/common/functions/utils';
import stake from 'app/modernUI/images/stake.svg';
import { Box, Button, Text } from 'grommet';
import { useCookies } from 'react-cookie';
import Skeleton from 'react-loading-skeleton';

export const StakePresentation = ({ rewardsApy, isLoadingRewardsApy }) => {
  const [, setCookies] = useCookies(['has_seen_stake']);

  return (
    <>
      <Text textAlign="center" size="16px">
        Stake $ALLUO tokens
      </Text>
      <Box gap="large" margin={{ top: '20px' }} align="center">
        {isLoadingRewardsApy ? (
          <Box fill>
            <Skeleton height="37px" count={2} borderRadius="20px" />
          </Box>
        ) : (
          <Text textAlign="center" weight="bold" size="28px">
            Stake $ALLUO and earn {toExactFixed(rewardsApy, 2)}% as CVX/ETH
            tokens
          </Text>
        )}
        <img src={stake} alt="stake" height={226} />
        <Button
          primary
          label="Continue to stake"
          onClick={() => setCookies('has_seen_stake', true)}
          style={{ width: 310 }}
        />
      </Box>
      <Box margin={{ top: '26px' }} justify="center" direction="row">
        <Text size="12px">
          Find out where these funds are being invested{' '}
          <a
            target="_blank"
            href="https://docsend.com/view/np9ypdn38jajb9zj"
            style={{
              textDecoration: 'none',
            }}
          >
            here
          </a>
        </Text>
      </Box>
    </>
  );
};
