import { Box, Text } from 'grommet';
import Countdown, {
  CountdownTimeDelta,
  formatTimeDelta
} from 'react-countdown';

export const UnlockCountdown = (
  {date,
  label,
  onComplete,
  showReunlockConfirmation,}
) => {
  const renderer = ({ completed, days, ...timeDelta }) => {
    const { hours, minutes, seconds } = formatTimeDelta(
      timeDelta as CountdownTimeDelta,
      { zeroPadTime: 2 },
    );

    if (completed) {
      return null;
    } else {
      // Render a countdown
      return (
        <Box
          round={'medium'}
          width="245px"
          align="start"
          justify="between"
          gap="16px"
          direction="column"
          height="125px"
          background="modal"
          pad={{ vertical: 'medium', horizontal: 'medium' }}
          border={
            showReunlockConfirmation
              ? {
                  color: '#F59F31',
                  size: '0.5px',
                }
              : {size: '0px'}
          }
          style={
            showReunlockConfirmation
              ? {
                  boxShadow: '0px 0px 10px 0px #FF981133',
                }
              : {}
          }
        >
          <Box gap="16px" fill="horizontal">
            <Box justify="center" fill="horizontal">
              <Text weight={500} size="10px" textAlign="center">
                {label}
              </Text>
            </Box>
            <Box fill="horizontal" direction="row" justify="center" gap="4px">
              <Box flex direction="column" align="center">
                <Text size="28px" weight={700}>
                  {days}
                </Text>
                <Text size="8px">Days</Text>
              </Box>
              <Text size="28px" weight={700}>
                :
              </Text>
              <Box flex direction="column" align="center">
                <Text size="28px" weight={700}>
                  {hours}
                </Text>
                <Text size="8px">Hours</Text>
              </Box>
              <Text size="28px" weight={700}>
                :
              </Text>
              <Box flex direction="column" align="center">
                <Text size="28px" weight={700}>
                  {minutes}
                </Text>
                <Text size="8px">Minutes</Text>
              </Box>
              <Text size="28px" weight={700}>
                :
              </Text>
              <Box flex direction="column" align="center">
                <Text size="28px" weight={700}>
                  {seconds}
                </Text>
                <Text size="8px">Seconds</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    }
  };

  return <Countdown date={date} renderer={renderer} onComplete={onComplete} />;
};
