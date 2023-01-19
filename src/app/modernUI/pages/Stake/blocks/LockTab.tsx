import { toExactFixed } from 'app/common/functions/utils';
import { useLock } from 'app/common/state/stake';
import {
  Info,
  NumericInput, SubmitButton
} from 'app/modernUI/components';
import { Box, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';

export const LockTab = ({
  isLoading,
  alluoInfo,
  // lock
  lockValue,
  setLockValue,
  handleApprove,
  handleLock,
}) => {
  const {
    handleLockValueChange,
    hasErrors,
    lockValueError,
    handleCurrentStep,
    isLoadingRequiredSteps,
    lockSteps,
    currentStep,
  } = useLock({
    alluoInfo,
    setLockValue,
    handleApprove,
    handleLock,
  });

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
        <NumericInput
          label="Lock"
          tokenSign="$"
          onValueChange={handleLockValueChange}
          value={lockValue}
          maxButton={true}
          maxValue={alluoInfo?.balance}
          error={lockValueError}
          disabled={isLoading}
        />
      </Box>
      <Box>
        <Info
          label="Unstaked $ALLUO balance"
          value={toExactFixed(alluoInfo?.balance, 2)}
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
          label="Total $ALLUO staked"
          value={alluoInfo?.totalLocked}
          isLoading={isLoading}
        />
      </Box>
      <Box margin={{ top: 'large' }}>
        <SubmitButton
          primary
          disabled={
            isLoading || hasErrors || lockValue == '' || isLoadingRequiredSteps
          }
          label={
            isLoadingRequiredSteps
              ? 'Loading...'
              : lockSteps?.length > 1
              ? `Step ${currentStep + 1} of ${lockSteps?.length}: ${
                  lockSteps[currentStep]?.label
                }`
              : `${lockSteps[currentStep]?.label}`
          }
          onClick={handleCurrentStep}
        />
      </Box>
    </Box>
  );
};
