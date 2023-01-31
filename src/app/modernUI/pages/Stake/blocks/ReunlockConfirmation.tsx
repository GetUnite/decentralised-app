import exclamation from 'app/modernUI/images/yellowExclamation.svg';
import { Box, Button, Text } from 'grommet';

export const ReunlockConfirmation = ({
  cancelReunlockConfirmation,
  startProcessingSteps,
}) => {
  return (
    <>
      <Box margin={{ top: '35px' }} align="center">
        <img src={exclamation} alt="exclamation" />
        <Box gap="40px" margin={{ top: '52px' }}>
          <Text textAlign="center" weight="bold" size="24px">
            Wait! Are you sure you want to unlock more tokens now?
          </Text>
          <Text textAlign="center" weight={400} size="16px">
            You already have an unlock in progress. If you unlock more funds
            now, all funds being unlocked will reset to a five-day countdown
          </Text>
        </Box>

        <Box gap="24px" margin={{ top: '55px' }}>
          <Button
            primary
            label="Unlock tokens and reset countdown"
            onClick={startProcessingSteps}
            style={{ width: '360px' }}
          />
          <Button
            plain
            label="Go back"
            onClick={cancelReunlockConfirmation}
            style={{
              textAlign: 'center',
              color: '#2A73FF',
              fontSize: '14px',
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>
    </>
  );
};
