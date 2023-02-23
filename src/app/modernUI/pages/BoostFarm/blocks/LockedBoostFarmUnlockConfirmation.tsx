import closedVault from 'app/modernUI/images/vaults/closedVault.svg';
import openVault from 'app/modernUI/images/vaults/openVault.svg';
import { Box, Button, Text } from 'grommet';
import moment from 'moment';

export const LockedBoostFarmUnlockConfirmation = ({
  startProcessingSteps,
  nextHarvestDate,
}) => {
  const lessThanHalfHourToHarvest =
    moment(nextHarvestDate).subtract(30, 'minutes').toDate().getTime() <
    new Date().getTime();

  return (
    <>
      <Box margin={{ top: '55px' }} align="center">
        <img
          src={lessThanHalfHourToHarvest ? closedVault : openVault}
          alt="vault"
        />
        <Box gap="35px" margin={{ top: '58px' }}>
          <Text textAlign="center" weight="bold" size="24px">
            {lessThanHalfHourToHarvest
              ? `Unlock requests made less than 30 minutes before harvest could miss today’s harvest cycle`
              : `Just a reminder that funds in locked boost pools are harvested every Sunday after 12 PM UTC`}
          </Text>
          <Text
            textAlign="center"
            weight={400}
            size="16px"
            margin={{ vertical: lessThanHalfHourToHarvest ? '17.5px' : '' }}
          >
            {lessThanHalfHourToHarvest
              ? `Missed requests will will be harvested next Sunday`
              : `Unlocked funds will be available for withdrawal from ${nextHarvestDate.format(
                  'DD MMMM YYYY',
                )}`}
          </Text>
        </Box>
        <Box gap="30px" margin={{ top: '45px' }}>
          <Button
            primary
            label="Continue to unlock"
            onClick={startProcessingSteps}
            style={{ width: '360px' }}
          />
        </Box>
      </Box>
    </>
  );
};
