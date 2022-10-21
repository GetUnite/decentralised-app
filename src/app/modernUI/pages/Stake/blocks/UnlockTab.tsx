import { roundNumberDown } from 'app/common/functions/utils';
import { useUnlock } from 'app/common/state/stake';
import {
  Info,
  RangeInput,
  Spinner,
  SubmitButton
} from 'app/modernUI/components';
import { Box, Text } from 'grommet';
import { ReunlockConfirmation } from './ReunlockConfirmation';

export const UnlockTab = ({
  isLoading,
  alluoInfo,
  updateAlluoInfo,
  startReunlockConfirmation,
  showReunlockConfirmation,
  cancelReunlockConfirmation,
  allTimersAreFinished,
  ...rest
}) => {
  const {
    unlockValue,
    isUnlocking,
    projectedUnlockValue,
    handleUnlockValueChange,
    handleUnlock,
    unlockValueError,
  } = useUnlock({ alluoInfo, updateAlluoInfo });

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
            {showReunlockConfirmation ? (
              <ReunlockConfirmation
                handleUnlock={handleUnlock}
                cancelReunlockConfirmation={cancelReunlockConfirmation}
              />
            ) : (
              <>
                <Box margin={{ top: 'large' }}>
                  <Text textAlign="center" margin="auto" weight="bold">
                    You have {roundNumberDown(alluoInfo.locked, 2)} $ALLUO
                    staked
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
                    <Info label="$ALLUO APR" value={alluoInfo.apr + '%'} />
                    <Info label="$ALLUO earned" value={alluoInfo.earned} />
                    <Info
                      label="$ALLUO unlocked"
                      value={roundNumberDown(alluoInfo.unlocked, 2)}
                    />
                    <Info
                      label="Total $ALLUO staked"
                      value={alluoInfo.totalLocked}
                    />
                  </Box>
                </Box>
              </>
            )}
          </>
        )}
      </Box>

      {(isUnlocking || !showReunlockConfirmation) && (
        <Box margin={{ top: 'large' }} style={{ height: 52 }}>
          <SubmitButton
            primary
            disabled={(+unlockValue === 0) || isUnlocking}
            label="Unlock"
            onClick={!allTimersAreFinished ? startReunlockConfirmation : handleUnlock}
          />
        </Box>
      )}
    </Box>
  );
};
