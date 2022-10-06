import { roundNumberDown, timerIsFinished } from 'app/common/functions/utils';
import { useUnlock } from 'app/common/state/stake';
import {
  Info,
  RangeInput,
  Spinner,
  SubmitButton
} from 'app/modernUI/components';
import { Box, Heading, Text } from 'grommet';
import Countdown, {
  CountdownTimeDelta,
  formatTimeDelta
} from 'react-countdown';

export const UnlockTab = ({
  isLoading,
  alluoInfo,
  updateAlluoInfo,
  ...rest
}) => {
  const {
    unlockValue,
    isUnlocking,
    projectedUnlockValue,
    isWithdrawing,
    handleUnlockValueChange,
    handleUnlock,
    handleWithdraw,
    unlockValueError,
  } = useUnlock({ alluoInfo, updateAlluoInfo });

  const allTimersAreFinished =
    timerIsFinished(alluoInfo?.depositUnlockTime) &&
    timerIsFinished(alluoInfo?.withdrawUnlockTime);

  const canUnlock = timerIsFinished(alluoInfo?.depositUnlockTime);
  const canWithdraw =
    timerIsFinished(alluoInfo?.withdrawUnlockTime) && +alluoInfo?.unlocked > 0;

  const rendererForUnlock = ({ completed, days, ...timeDelta }) => {
    const { hours, minutes, seconds } = formatTimeDelta(
      timeDelta as CountdownTimeDelta,
      { zeroPadTime: 2 },
    );

    if (completed) {
      return null;
    } else {
      // Render a countdown
      return (
        <Box fill>
          <Text weight="bold" size="xlarge" textAlign="center">
            You will be able to unlock your{' '}
            {roundNumberDown(alluoInfo.locked, 2)} $ALLUO in
          </Text>
          <Box flex direction="row" width="80%" margin={{ horizontal: 'auto' }}>
            <Box flex direction="column" align="center">
              <Heading margin="none">{days}</Heading>
              <Text>Days</Text>
            </Box>
            <Box flex direction="column" align="center">
              <Heading margin="none">{hours}</Heading>
              <Text>Hours</Text>
            </Box>
            <Box flex direction="column" align="center">
              <Heading margin="none">{minutes}</Heading>
              <Text>Minutes</Text>
            </Box>
            <Box flex direction="column" align="center">
              <Heading margin="none">{seconds}</Heading>
              <Text>Seconds</Text>
            </Box>
          </Box>
        </Box>
      );
    }
  };

  const rendererForWithdraw = ({ completed, days, ...timeDelta }) => {
    const { hours, minutes, seconds } = formatTimeDelta(
      timeDelta as CountdownTimeDelta,
      { zeroPadTime: 2 },
    );

    if (completed) {
      return null;
    } else {
      // Render a countdown
      return (
        <Box fill>
          <Text weight="bold" size="xlarge" textAlign="center">
            You can withdraw {roundNumberDown(alluoInfo.unlocked,2)} $ALLUO in
          </Text>
          <Box flex direction="row" width="80%" margin={{ horizontal: 'auto' }}>
            <Box flex direction="column" align="center">
              <Heading margin="none">{days}</Heading>
              <Text>Days</Text>
            </Box>
            <Box flex direction="column" align="center">
              <Heading margin="none">{hours}</Heading>
              <Text>Hours</Text>
            </Box>
            <Box flex direction="column" align="center">
              <Heading margin="none">{minutes}</Heading>
              <Text>Minutes</Text>
            </Box>

            <Box flex direction="column" align="center">
              <Heading margin="none">{seconds}</Heading>
              <Text>Seconds</Text>
            </Box>
          </Box>
        </Box>
      );
    }
  };

  return (
    <Box fill>
      <Box
        style={{
          minHeight: '454px',
        }}
        justify="center"
      >
        {isLoading || isUnlocking || isWithdrawing ? (
          <Box
            align="center"
            justify="center"
            fill="vertical"
            margin={{ top: 'large', bottom: 'medium' }}
          >
            <Spinner pad="large" />
          </Box>
        ) : (
          <Box margin={{ top: 'large' }}>
            <Text textAlign="center" margin="auto" weight="bold">
              {allTimersAreFinished &&
                `You have ${roundNumberDown(
                  alluoInfo.locked,
                  2,
                )} $ALLUO staked`}
            </Text>

            {!timerIsFinished(+alluoInfo.depositUnlockTime) && (
              <>
                <Countdown
                  date={+alluoInfo.depositUnlockTime * 1000}
                  renderer={rendererForUnlock}
                  onComplete={updateAlluoInfo}
                />
              </>
            )}

            {!timerIsFinished(+alluoInfo.withdrawUnlockTime) && (
              <>
                <Countdown
                  date={+alluoInfo.withdrawUnlockTime * 1000}
                  renderer={rendererForWithdraw}
                  onComplete={updateAlluoInfo}
                />
              </>
            )}

            <Box margin={{ top: 'medium' }}>
              {allTimersAreFinished && (
                <RangeInput
                  label="Unlock percentage"
                  value={unlockValue}
                  onValueChange={handleUnlockValueChange}
                  error={unlockValueError}
                />
              )}
            </Box>

            <Box margin={{ top: 'medium' }}>
              <Info
                label="$ALLUO being unlocked"
                value={projectedUnlockValue}
              />
              <Info label="$ALLUO APR" value={alluoInfo.apr + '%'} />
              <Info label="$ALLUO earned" value={alluoInfo.earned} />
              <Info label="$ALLUO unlocked" value={roundNumberDown(alluoInfo.unlocked)} />
              <Info label="Total $ALLUO staked" value={alluoInfo.totalLocked} />
            </Box>
          </Box>
        )}
      </Box>

      <Box margin={{ top: 'large' }} style={{ height: 52 }}>
        {console.log(canWithdraw, +unlockValue === 0)}
        <SubmitButton
          primary
          disabled={
            (!canWithdraw && +unlockValue === 0) || isUnlocking || isWithdrawing
          }
          label={canWithdraw && +unlockValue === 0 ? 'Withdraw' : 'Unlock'}
          onClick={
            canWithdraw && +unlockValue === 0 ? handleWithdraw : handleUnlock
          }
        />
      </Box>
    </Box>
  );
};
