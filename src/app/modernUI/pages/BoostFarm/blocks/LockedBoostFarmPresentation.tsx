import { Box, Button, Text } from 'grommet';
import { useCookies } from 'react-cookie';

import { toExactFixed } from 'app/common/functions/utils';
import lock from 'app/modernUI/images/lock.svg';
import Skeleton from 'react-loading-skeleton';

import moment from 'moment';

export const LockedBoostFarmPresentation = ({
  selectedFarm,
  farmName,
  isLoadingInterest,
  interest,
  nextHarvestDate,
  ...rest
}) => {
  const [, setCookies] = useCookies(['has_seen_locked_boost_farms']);

  const rewardsLabel =
    selectedFarm.current?.rewards.label +
    ' or ' +
    selectedFarm.current?.rewards.stableLabel;

  return (
    <>
      <Text textAlign="center" size="16px">
        {farmName}
        <span style={{ color: '#1C1CFF' }}> LOCKED BOOST</span> FARM
      </Text>
      <Box margin={{ top: '60px' }} align="center">
        <img src={lock} alt="lock" width={140} />
        <Box margin={{ top: '28px' }} fill>
          {isLoadingInterest ? (
            <Box fill>
              <Skeleton height="37px" count={2} borderRadius="20px" />
            </Box>
          ) : (
            <Text textAlign="center" weight="bold" size="28px">
              Earn {toExactFixed(interest, 2)}% as {rewardsLabel} tokens
            </Text>
          )}
          <Text textAlign="center" margin={{ top: '23px' }}>
            {/*TODO: make this date dynamic with loadFarmInfo() once its optimised*/}
            Locked BOOST farms have a weekly lock-in period. Deposits and
            withdrawal requests are actioned every Sunday at 11 PM UTC {/*nextHarvestDate == null ? 'Loading...' : nextHarvestDate.format('dddd [at] h a')*/}.
          </Text>
        </Box>
        <Button
          margin={{ top: '40px' }}
          primary
          label="Deposit to get started"
          onClick={() => setCookies('has_seen_locked_boost_farms', true)}
          style={{ width: 310 }}
        />
        <Box margin={{ top: '20px' }} justify="center" direction="row">
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
      </Box>
    </>
  );
};
