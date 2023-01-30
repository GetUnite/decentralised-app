import vaultTopRight from 'app/modernUI/images/vaults/vault-top-right.svg';
import { Box, Button, Text } from 'grommet';

export const LockedBoostFarmUnlockConfirmation = ({
  withdrawValue,
  withdrawTokenLabel,
  startProcessingSteps,
  cancelBoostUnlockConfirmation,
  nextHarvestDate,
  losablePendingRewards,
  ...rest
}) => {
  return (
    <>
      <Box margin={{ top: '84px' }} align="center">
        <img src={vaultTopRight} alt="exclamation" />
        <Box gap="35px" margin={{ top: '84px' }}>
          <Text textAlign="center" weight="bold" size="24px">
            Just a reminder that funds in locked boost pools are harvested every{' '}
            {'SUNDAY'} at {'XXhXX'}.
          </Text>
          <Text textAlign="center" weight={400} size="16px">
            Unlocked funds will be available for withdrawal from{' '}
            {'First date here'}
          </Text>
        </Box>

        <Box gap="30px" margin={{ top: '40px' }}>
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
