import { Box, Button, Text } from 'grommet';
import { useCookies } from 'react-cookie';

import { toExactFixed } from 'app/common/functions/utils';
import booster from 'app/modernUI/images/booster.svg';
import Skeleton from 'react-loading-skeleton';

export const BoostFarmPresentation = ({
<<<<<<< HEAD
  selectedFarm,
=======
  selectedFarmInfo,
>>>>>>> staging
  farmName,
  isLoading,
  ...rest
}) => {
  const [, setCookies] = useCookies(['has_seen_boost_farms']);

  const rewardsLabel =
<<<<<<< HEAD
    selectedFarm?.rewards.label + ' or ' + selectedFarm?.rewards.stableLabel;
=======
    selectedFarmInfo.current?.rewards.label +
    ' or ' +
    selectedFarmInfo.current?.rewards.stableLabel;
>>>>>>> staging

  return (
    <>
      <Text textAlign="center" size="16px">
        {farmName} FARM
      </Text>
      <Box gap="large" margin={{ top: '20px' }} align="center">
        {isLoading ? (
          <Box fill>
            <Skeleton height="28px" count={2} />
          </Box>
        ) : (
          <Text textAlign="center" weight="bold" size="28px">
<<<<<<< HEAD
            Earn {toExactFixed(selectedFarm.interest, 2)}% as {rewardsLabel}{' '}
            tokens
=======
            Earn {toExactFixed(selectedFarmInfo.current?.interest, 2)}% as{' '}
            {rewardsLabel} tokens
>>>>>>> staging
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
<<<<<<< HEAD
=======
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
>>>>>>> staging
    </>
  );
};
