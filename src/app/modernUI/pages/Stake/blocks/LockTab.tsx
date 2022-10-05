import { useLock } from 'app/common/state/stake';
import {
  Info,
  NumericInput,
  Spinner,
  SubmitButton
} from 'app/modernUI/components';
import { Box, Text } from 'grommet';

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
          minHeight: '445px',
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
              {' '}
              <Text textAlign="center" weight="bold">
                You have {(+alluoInfo.stakedInUsd).toLocaleString()} $ALLUO
                staked
              </Text>
              <Box margin={{ top: 'medium' }}>
                <NumericInput
                  tokenSign="$"
                  onValueChange={handleLockValueChange}
                  value={lockValue}
                  maxValue={alluoInfo?.balance}
                  error={lockValueError}
                />
              </Box>
            </Box>
            <Box margin={{ top: 'medium' }}>
              <Info
                label="Unstaked $ALLUO balance"
                value={(+alluoInfo.balance).toLocaleString()}
              />
              <Info label="$ALLUO APR" value={alluoInfo.apr + '%'} />
              <Info
                label="$ALLUO earned"
                value={(+alluoInfo.earned).toLocaleString()}
              />
              <Info
                label="Total $ALLUO staked"
                value={(+alluoInfo.totalStakedInUsd).toLocaleString()}
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
