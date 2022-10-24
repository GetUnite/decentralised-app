import { useLock } from 'app/common/state/stake';
import {
  Info,
  NumericInput,
  Spinner,
  SubmitButton
} from 'app/modernUI/components';
import { Box, Text } from 'grommet';

export const LockTab = ({
  isLoading,
  alluoStakingInfo,
  alluoTokenInfo,
  handleApprove,
  handleLock,
  ...rest
}) => {
  const {
    lockValue,
    isApproving,
    isLocking,
    handleLockValueChange,
    hasErrors,
    lockValueError,
    startApprove,
    startLock,
  } = useLock({ alluoStakingInfo, handleApprove, handleLock });

  return (
    <Box fill>
      <Box
        style={{
          minHeight: '469px',
        }}
        justify="center"
      >
        {isLoading || isApproving || isLocking ? (
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
              <Text textAlign="center" weight="bold">
                You have {alluoStakingInfo.locked} $ALLUO
                staked
              </Text>
              <Box margin={{ top: 'medium' }}>
                <NumericInput
                  label="Lock"
                  tokenSign="$"
                  onValueChange={handleLockValueChange}
                  value={lockValue}
                  maxValue={alluoTokenInfo?.balance}
                  error={lockValueError}
                />
              </Box>
            </Box>
            <Box margin={{ top: 'medium' }}>
              <Info
                label="Unstaked $ALLUO balance"
                value={alluoTokenInfo.balance}
              />
              <Info label="$ALLUO APR" value={alluoStakingInfo.apr + '%'} />
              <Info
                label="$ALLUO earned"
                value={alluoStakingInfo.earned}
              />
              <Info
                label="Total $ALLUO staked"
                value={alluoStakingInfo.totalLocked}
              />
              <Text
                size="xsmall"
                margin={{ left: 'small', top: 'small' }}
                color="#999999"
              >
                Staking your tokens means locking them in an 80-20 ALLUO-ETH
                Balancer pool, Your balance might vary depending on the
                performance of ETH vs. ALLUO
              </Text>
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
            !(+lockValue > 0)
          }
          label={
            +lockValue > 0
              ? +alluoTokenInfo?.allowance >= +lockValue
                ? 'Lock'
                : 'Approve'
              : 'Enter amount'
          }
          onClick={
            +alluoTokenInfo?.allowance >= +lockValue
              ? startLock
              : startApprove
          }
        />
      </Box>
    </Box>
  );
};
