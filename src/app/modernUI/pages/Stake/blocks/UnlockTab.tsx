import { toExactFixed } from 'app/common/functions/utils';
import { useUnlock } from 'app/common/state/stake';
import { Info, RangeInput, SubmitButton } from 'app/modernUI/components';
import { Box, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';

export const UnlockTab = ({
  isLoading,
  alluoInfo,
  startReunlockConfirmation,
  allTimersAreFinished,
  // unlock
  unlockValue,
  setUnlockValue,
  // steps
  steps,
  startProcessingSteps,
}) => {
  const { projectedUnlockValue, handleUnlockValueChange, unlockValueError } =
    useUnlock({ alluoInfo, unlockValue, setUnlockValue, steps });

  return (
    <Box fill>
      <Box margin={{ top: 'large' }}>
        {isLoading ? (
          <Skeleton borderRadius="20px" />
        ) : (
          <Text textAlign="center" weight="bold" size="18px">
            You have {toExactFixed(alluoInfo?.locked, 2)} $ALLUO staked
          </Text>
        )}
      </Box>
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
          isLoading={isLoading}
        />
        <Info
          label="$ALLUO APR"
          value={alluoInfo?.apr + '%'}
          isLoading={isLoading}
        />
        <Info
          label="$ALLUO earned"
          value={alluoInfo?.earned}
          isLoading={isLoading}
        />
        <Info
          label="$ALLUO unlocked"
          value={toExactFixed(alluoInfo?.unlocked, 2)}
          isLoading={isLoading}
        />
        <Info
          label="Total $ALLUO staked"
          value={alluoInfo?.totalLocked}
          isLoading={isLoading}
        />
      </Box>
      <Box margin={{ top: 'large' }} style={{ height: 52 }}>
        <SubmitButton
          primary
          // TODO: uncoment
          disabled={+unlockValue === 0 && +alluoInfo.lockedInLp > 0}
          label="Unlock"
          onClick={
            !allTimersAreFinished
              ? startReunlockConfirmation
              : startProcessingSteps
          }
        />
      </Box>
    </Box>
  );
};
