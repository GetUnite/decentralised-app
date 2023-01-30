import vaultTopRight from 'app/modernUI/images/vaults/vault-top-right.svg';
import { Box, Button, Text } from 'grommet';

export const LockedBoostFarmLockConfirmation = ({
  selectedFarmInfo,
  startProcessingSteps,
  cancelLockedBoostLockConfirmation,
  nextHarvestDate,
  ...rest
}) => {
  return (
    <>
      <Box margin={{ top: '40px' }} align="center">
        <img src={vaultTopRight} alt="vault" />
        <Text textAlign="center" weight="bold" size="24px">
          Don’t forget, your deposit will only be available for withdrawal from{' '}
          {'here'} - after unlocking.
        </Text>
        <Text
          textAlign="center"
          weight={400}
          size="14px"
          margin={{ top: '23px' }}
        >
          Locked BOOST farms have a{' '}
          <Text weight="bold">weekly lock-in period</Text>. Deposits and
          withdrawal requests are actioned every Sunday at {"here"}.
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
