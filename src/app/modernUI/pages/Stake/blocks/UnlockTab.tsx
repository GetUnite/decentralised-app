import { toExactFixed } from 'app/common/functions/utils';
import { useUnlock } from 'app/common/state/stake';
import {
  Info,
  RangeInput,
  Spinner,
  SubmitButton
} from 'app/modernUI/components';
import { Box, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';
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
        {isUnlocking ? (
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
                  {isLoading ? (
                    <Skeleton />
                  ) : (
                    <Text textAlign="center" weight="bold">
                      You have {toExactFixed(alluoInfo?.locked, 2)} $ALLUO
                      staked
                    </Text>
                  )}

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
            disabled={+unlockValue === 0 || isUnlocking}
            label="Unlock"
            onClick={
              !allTimersAreFinished ? startReunlockConfirmation : handleUnlock
            }
          />
        </Box>
      )}
    </Box>
  );
};
