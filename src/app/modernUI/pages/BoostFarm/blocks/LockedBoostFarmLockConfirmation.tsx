import closedVault from 'app/modernUI/images/vaults/closedVault.svg';
import openVault from 'app/modernUI/images/vaults/openVault.svg';
import { Box, Button, Text } from 'grommet';
import moment from 'moment';

export const LockedBoostFarmLockConfirmation = ({
  selectedFarmInfo,
  startProcessingSteps,
  cancelLockedBoostLockConfirmation,
  nextHarvestDate,
  ...rest
}) => {
  const lessThanHalfHourToHarvest =
    moment(nextHarvestDate).subtract(30, 'minutes').toDate().getTime() <
    new Date().getTime();
  const firstPossibleWithdrawDate = moment(nextHarvestDate).add(1, 'week');

  return (
    <>
      <Box margin={{ top: '49px' }} align="center">
        <img
          src={lessThanHalfHourToHarvest ? closedVault : openVault}
          alt="vault"
        />
        <Text
          textAlign="center"
          weight="bold"
          size="24px"
          margin={{ top: '49px' }}
        >
          {lessThanHalfHourToHarvest
            ? `Deposits made less than 30 minutes before harvest could miss today’s harvest cycle`
            : `Don’t forget, your deposit will only be available for withdrawal from
              Sunday ${firstPossibleWithdrawDate.format(
                'DD',
              )} - after unlocking`}
        </Text>
        <Text
          textAlign="center"
          weight={400}
          size="14px"
          margin={{ top: '30px' }}
        >
          Locked BOOST farms have a{' '}
          <Text weight="bold">weekly lock-in period</Text>. Deposits and
          withdrawal requests are actioned every Sunday after 12 PM UTC.
        </Text>

        <Box gap="30px" margin={{ top: '40px' }}>
          <Button
            primary
            label="Continue with deposit"
            onClick={startProcessingSteps}
            style={{ width: '360px' }}
          />
        </Box>
        <Box margin={{ top: '26px' }} justify="center" direction="row">
          <Text size="12px">
            Don't want to lock your funds?{' '}
            <a
              target="_blank"
              href="https://docsend.com/view/np9ypdn38jajb9zj"
              style={{
                textDecoration: 'none',
              }}
            >
              View other BOOST pools
            </a>
          </Text>
        </Box>
      </Box>
    </>
  );
};
