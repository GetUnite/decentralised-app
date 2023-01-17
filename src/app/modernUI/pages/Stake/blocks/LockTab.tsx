import { toExactFixed } from 'app/common/functions/utils';
import { useLock } from 'app/common/state/stake';
import {
  Info,
  NumericInput,
  Spinner,
  SubmitButton
} from 'app/modernUI/components';
import { Box, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';

export const LockTab = ({ isLoading, alluoInfo, updateAlluoInfo, ...rest }) => {
  const {
    lockValue,
    isApproving,
    isLocking,
    handleLockValueChange,
    handleApprove,
    handleLock,
    hasErrors,
    lockValueError,
  } = useLock({ alluoInfo, updateAlluoInfo });

  return (
    <Box fill>
      <Box
        style={{
          minHeight: '415px',
        }}
      >
        {isApproving || isLocking ? (
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
              {isLoading ? (
                <Skeleton />
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
          </>
        )}
      </Box>
      <Box margin={{ top: 'large' }}>
        <SubmitButton
          primary
          disabled={
            isLoading ||
            isApproving ||
            isLocking ||
            hasErrors ||
            lockValue == ''
          }
          label={
            +lockValue > 0
              ? +alluoInfo?.allowance >= +lockValue
                ? 'Lock'
                : 'Approve'
              : 'Enter amount'
          }
          onClick={
            +alluoInfo?.allowance >= +lockValue ? handleLock : handleApprove
          }
        />
      </Box>
    </Box>
  );
};
