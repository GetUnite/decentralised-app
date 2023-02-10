import { Box, Button, Text } from 'grommet';
import { useCookies } from 'react-cookie';

import { toExactFixed } from 'app/common/functions/utils';
import booster from 'app/modernUI/images/booster.svg';
import Skeleton from 'react-loading-skeleton';

export const BoostFarmPresentation = ({
  selectedFarm,
  farmName,
  isLoadingInterest,
  interest,
  ...rest
}) => {
  const [, setCookies] = useCookies(['has_seen_boost_farms']);

  const rewardsLabel =
  selectedFarm.current?.rewards.label +
    ' or ' +
    selectedFarm.current?.rewards.stableLabel;

  return (
    <>
      <Text textAlign="center" size="16px">
        {farmName} FARM
      </Text>
      <Box gap="large" margin={{ top: '20px' }} align="center">
        {isLoadingInterest ? (
          <Box fill>
            <Skeleton height="37px" count={2} borderRadius="20px" />
          </Box>
        ) : (
          <Text textAlign="center" weight="bold" size="28px">
            Earn {toExactFixed(interest, 2)}% as {rewardsLabel} tokens
            <br />
          </Text>
        )}
        <img src={booster} alt="booster" width={275} />
        <Button
          primary
          label="Deposit to get started"
          onClick={() => setCookies('has_seen_boost_farms', true)}
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
