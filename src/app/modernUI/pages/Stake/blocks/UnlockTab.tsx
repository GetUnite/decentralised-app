import { useUnlock } from 'app/common/state/stake';
import {
  Info,
  RangeInput,
  Spinner,
  SubmitButton
} from 'app/modernUI/components';
import { Box, Text } from 'grommet';

export const UnlockTab = ({
  isLoading,
  alluoStakingInfo,
  startReunlockConfirmation,
  cancelReunlockConfirmation,
  allTimersAreFinished,
  handleUnlock,
  ...rest
}) => {
  const {
    unlockValue,
    isUnlocking,
    projectedUnlockValue,
    handleUnlockValueChange,
    startUnlock,
    unlockValueError,
  } = useUnlock({ alluoStakingInfo, handleUnlock });

  return (
    <Box fill>
      <Box
        style={{
          minHeight: '454px',
        }}
        justify="center"
      >
        {isLoading || isUnlocking ? (
          <Box
            align="center"
            justify="center"
            fill="vertical"
            margin={{ top: 'large', bottom: 'medium' }}
          >
            <Spinner pad="large" />
          </Box>
        ) : (
          <>
            <Box margin={{ top: 'large' }}>
              <Text textAlign="center" margin="auto" weight="bold">
                You have {alluoStakingInfo.locked} $ALLUO staked
              </Text>

              <Box margin={{ top: 'medium' }}>
                <RangeInput
                  label="Unlock percentage"
                  value={unlockValue}
                  onValueChange={handleUnlockValueChange}
                  error={unlockValueError}
                />
              </Box>

              <Box margin={{ top: 'medium' }}>
                <Info
                  label="$ALLUO being unlocked"
                  value={projectedUnlockValue}
                />
                <Info label="$ALLUO APR" value={alluoStakingInfo.apr + '%'} />
                <Info label="$ALLUO earned" value={alluoStakingInfo.earned} />
                <Info
                  label="$ALLUO unlocked"
                  value={alluoStakingInfo.unlocked}
                />
                <Info
                  label="Total $ALLUO staked"
                  value={alluoStakingInfo.totalLocked}
                />
              </Box>
            </Box>
          </>
        )}
      </Box>

      <Box margin={{ top: 'large' }} style={{ height: 52 }}>
        <SubmitButton
          primary
          disabled={+unlockValue === 0 || isUnlocking}
          label="Unlock"
          onClick={
            !allTimersAreFinished ? startReunlockConfirmation : startUnlock
          }
        />
      </Box>
    </Box>
  );
};
