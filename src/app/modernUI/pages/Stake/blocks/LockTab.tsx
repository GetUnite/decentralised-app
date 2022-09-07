import { tokenInfo } from 'app/common/state/atoms';
import { useLock } from 'app/common/state/stake';
import { Info, Input, Notification, Spinner } from 'app/modernUI/components';
import { Box, Button, Text } from 'grommet';
import { useState } from 'react';
import { useRecoilState } from 'recoil';

export const LockTab = ({ ...rest }) => {
  const {
    notificationId,
    error,
    lockValue,
    isApproving,
    isLocking,
    handleLockValueChange,
    handleSetLockToMax,
    handleApprove,
    handleLockAction,
    setToMax,
  } = useLock();
  
  const [tokenInfoAtom, setTokenInfoAtom] = useRecoilState(tokenInfo);

  return (
    <Box fill>
      {tokenInfoAtom.isLoading || isApproving || isLocking ? (
        <Box
          align="center"
          justify="center"
          margin={{ top: 'large', bottom: 'medium' }}
        >
          <Spinner pad="large" />
        </Box>
      ) : (
        <>
          <Box margin={{ top: 'large' }}>
            {' '}
            <Text textAlign="center" weight="bold">
              Your have{' '}
              {(+tokenInfoAtom.lockedAlluoValueOfUser).toLocaleString()} $ALLUO
              staked
            </Text>
            <Box margin={{ top: 'medium' }}>
              <Input
                inputProps={{
                  value: lockValue || '',
                  onChange: handleLockValueChange,
                  max: tokenInfoAtom.alluoBalance || 0,
                }}
                maxButtonProps={{ onClick: setToMax }}
              />
              <Text color="error" size="small" margin={{ top: 'small' }}>
                {error}
              </Text>
            </Box>
          </Box>
          <Box margin={{ top: 'medium' }}>
            <Info
              label="Unstaked $ALLUO balance"
              value={(+tokenInfoAtom.alluoBalance).toLocaleString()}
            />
            <Info label="$ALLUO APR" value={tokenInfoAtom.apr + '%'} />
            <Info
              label="$ALLUO earned"
              value={(+tokenInfoAtom.claimedAlluo).toLocaleString()}
            />
            <Info
              label="Total $ALLUO staked"
              value={(+tokenInfoAtom.totalLocked).toLocaleString()}
            />
            <Text size='xsmall' margin={{left: 'small', top: 'small'}} color='#999999'>
              Staking your tokens means locking them in an 80-20 ALLUO-ETH Balancer pool, Your balance might vary depending on the performance of ETH vs. ALLUO
            </Text>
              {/* label="Staking your tokens means locking them in an 80-20 ALLUO-ETH Balancer pool, Your balance might vary depending on the performance of ETH vs. ALLUO."
              value="" */}
          </Box>
        </>
      )}

      <Box margin={{ top: 'large' }}>
        {!(+lockValue > 0) || +tokenInfoAtom.allowance < +lockValue ? (
          <Button
            primary
            disabled={
              !(+lockValue > 0) ||
              +lockValue > +tokenInfoAtom.alluoBalance ||
              isApproving
            }
            label={+lockValue > 0 ? 'Approve' : 'Enter amount'}
            onClick={handleApprove}
          />
        ) : (
          <Button
            disabled={tokenInfoAtom.isLoading || isApproving || isLocking}
            primary
            label="Lock"
            onClick={handleLockAction}
          />
        )}
      </Box>
    </Box>
  );
};
