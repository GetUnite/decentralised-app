import exclamation from 'app/modernUI/images/blackExclamation.svg';
import { Box, Button, Text } from 'grommet';

export const BoostFarmDepositConfirmation = ({
  selectedFarmInfo,
  handleDeposit,
  cancelBoostDepositConfirmation,
  nextHarvestDate,
  ...rest
}) => {
  return (
    <>
      <Box margin={{ top: '45px' }} align="center">
        <img src={exclamation} alt="exclamation" />
        <Box gap="35px" margin={{ top: '45px' }}>
          <Text textAlign="center" weight="bold" size="24px">
            Don't forget, funds deposited today will only be available of
            withdrawal next {'here'}
          </Text>
          <Text textAlign="center" weight={400} size="16px">
            Any unrealised rewards will be redistributed amongst the pool. Wait
            until the next harvest on {nextHarvestDate.format('DD MMM')} to earn
            all pending rewards.
          </Text>
        </Box>

        <Box gap="30px" margin={{ top: '48px' }}>
          <Button
            primary
            label="Continue with deposit"
            onClick={handleDeposit}
            style={{ width: '360px' }}
          />
          <Button
            plain
            label={`Cancel withdraw and comeback on ${nextHarvestDate.format(
              'DD MMMM',
            )}`}
            onClick={cancelBoostDepositConfirmation}
            style={{
              textAlign: 'center',
              color: '#2A73FF',
              fontSize: '14px',
              fontWeight: 600,
            }}
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
