import { tokenInfo } from 'app/common/state/atoms';
import { useUnlock } from 'app/common/state/stake';
import {
  Info,
  Input, Spinner,
  SubmitButton
} from 'app/modernUI/components';
import { Box, Heading, Text } from 'grommet';
import { useState } from 'react';
import Countdown, {
  CountdownTimeDelta,
  formatTimeDelta
} from 'react-countdown';
import { useRecoilState } from 'recoil';

export const UnlockTab = ({
  isLoading,
  alluoInfo,
  updateAlluoInfo,
  ...rest
}) => {
  const {
    unlockValue,
    isUnlocking,
    isWithdrawing,
    handleUnlockValueChange,
    handleUnlockAction,
    withdraw,
    setToMax,
  } = useUnlock({ alluoInfo, updateAlluoInfo });

  const [tokenInfoAtom, setTokenInfoAtom] = useRecoilState(tokenInfo);

  const [isDepositCountdownCompleted, setIsDepositCountdownCompleted] =
    useState(true);
  const [isWithdrawCountdownCompleted, setIsWithdrawCountdownCompleted] =
    useState(true);
  // const [reset, setReset] = useState(0);
  const timerIsFinished = expectedTime => {
    return +expectedTime === 0 || +expectedTime * 1000 <= Date.now();
  };
  const allTimersAreFinished =
    timerIsFinished(tokenInfoAtom.infoByAddress?.depositUnlockTime_) &&
    timerIsFinished(tokenInfoAtom.infoByAddress?.withdrawUnlockTime_);

  /*console.log(
    'Log',
    timerIsFinished(tokenInfoAtom.infoByAddress?.depositUnlockTime_),
    timerIsFinished(tokenInfoAtom.infoByAddress?.withdrawUnlockTime_),
  );*/
  const canUnlock = timerIsFinished(
    tokenInfoAtom.infoByAddress?.depositUnlockTime_,
  );
  const canWithdraw =
    timerIsFinished(tokenInfoAtom.infoByAddress?.withdrawUnlockTime_) &&
    +tokenInfoAtom.unlockedAlluoValueOfUser > 0;

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
            {(+(+tokenInfoAtom.lockedAlluoValueOfUser).toFixed(
              2,
            )).toLocaleString()}{' '}
            $ALLUO in
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
            You can withdraw{' '}
            {(+(+tokenInfoAtom.unlockedAlluoValueOfUser).toFixed(
              2,
            )).toLocaleString()}{' '}
            $ALLUO in
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
      {tokenInfoAtom.isLoading || isUnlocking || isWithdrawing ? (
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
              `You have ${(+tokenInfoAtom.lockedAlluoValueOfUser).toLocaleString()}
            $ALLUO staked`}
          </Text>

          {!timerIsFinished(
            tokenInfoAtom.infoByAddress?.depositUnlockTime_,
          ) && (
            <>
              <Countdown
                date={+tokenInfoAtom.infoByAddress.depositUnlockTime_ * 1000}
                renderer={rendererForUnlock}
                onComplete={updateAlluoInfo}
              />
            </>
          )}

          {!timerIsFinished(
            tokenInfoAtom.infoByAddress?.withdrawUnlockTime_,
          ) && (
            <>
              <Countdown
                date={+tokenInfoAtom.infoByAddress.withdrawUnlockTime_ * 1000}
                renderer={rendererForWithdraw}
                onComplete={updateAlluoInfo}
              />
            </>
          )}

          <Box margin={{ top: 'medium' }}>
            {allTimersAreFinished && (
              <Input
                isRangeInput
                headerText="Unlock percentage"
                rangeInputProps={{
                  value: unlockValue || 0,
                  onChange: handleUnlockValueChange,
                }}
                maxButtonProps={{ onClick: setToMax }}
              />
            )}
            {/* depositUnlockTime{' '}
            {+tokenInfoAtom.infoByAddress.depositUnlockTime_ * 1000 -
              Date.now()}
            <hr />
            withdrawUnlockTime{' '}
            {+tokenInfoAtom.infoByAddress.withdrawUnlockTime_ * 1000 -
              Date.now()} */}
          </Box>
        </Box>
      )}
      {!tokenInfoAtom.isLoading && !isUnlocking && !isWithdrawing && (
        <Box margin={{ top: 'medium' }}>
          <Info
            label="$ALLUO being unlocked"
            value={(
              (+unlockValue / 100) *
              +tokenInfoAtom.lockedAlluoValueOfUser
            ).toFixed(2)}
          />
          <Info label="$ALLUO APR" value={tokenInfoAtom.apr + '%'} />
          <Info
            label="$ALLUO earned"
            value={(+tokenInfoAtom.claimedAlluo).toLocaleString()}
          />
          <Info
            label="$ALLUO unlocked"
            value={(+tokenInfoAtom.unlockedAlluoValueOfUser)
              .toFixed(2)
              .toLocaleString()}
          />
          <Info
            label="Total $ALLUO staked"
            value={(+tokenInfoAtom.totalLocked).toLocaleString()}
          />
        </Box>
      )}

      <Box margin={{ top: 'large' }} style={{ height: 52 }}>
        <SubmitButton
          primary
          disabled={
            (!canWithdraw && +unlockValue === 0) || isUnlocking || isWithdrawing
          }
          label={canWithdraw && +unlockValue === 0 ? 'Withdraw' : 'Unlock'}
          onClick={
            canWithdraw && +unlockValue === 0 ? withdraw : handleUnlockAction
          }
        />
      </Box>
    </Box>
  );
};
