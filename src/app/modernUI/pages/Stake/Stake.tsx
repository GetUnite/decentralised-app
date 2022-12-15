import { EChain } from 'app/common/constants/chains';
import {
  timerIsFinished,
  toExactFixed
} from 'app/common/functions/utils';
import { useStake } from 'app/common/state/stake';
import { Layout, Modal, Spinner, Tab, Tabs } from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import { Box, Button, Grid, Heading, ResponsiveContext, Text } from 'grommet';
import { LockTab } from './blocks/LockTab';
import { UnlockTab } from './blocks/UnlockTab';
import { UnlockCountdown } from './components/UnlockCountdown';

export const Stake = ({ ...rest }) => {
  const {
    isLoading,
    updateAlluoInfo,
    alluoInfo,
    handleWithdraw,
    walletAccountAtom,
    isWithdrawing,
    startReunlockConfirmation,
    showReunlockConfirmation,
    cancelReunlockConfirmation,
    seeRewardsAsStable,
    setSeeRewardsAsStable,
    isClamingRewards,
    isLoadingRewards,
    rewardsInfo,
    pendingRewardsInfo,
    claimRewards,
    nextHarvestDate,
    previousHarvestDate,
    isLoadingPendingRewards,
  } = useStake();

  const allTimersAreFinished =
    timerIsFinished(alluoInfo?.depositUnlockTime) &&
    timerIsFinished(alluoInfo?.withdrawUnlockTime);

  const renderModal = () => {
    return (
      <>
        <Box direction="row" justify="end">
          <Box gap="28px">
            {walletAccountAtom && !isLoading && (
              <Box gap="16px">
                {+alluoInfo?.unlocked > 0 && allTimersAreFinished && (
                  <Box
                    round={'medium'}
                    width="245px"
                    align="start"
                    justify="between"
                    gap="16px"
                    direction="column"
                    height="154px"
                    background="modal"
                    pad={{ vertical: 'medium', horizontal: 'medium' }}
                  >
                    {isWithdrawing ? (
                      <Box align="center" justify="center" fill>
                        <Spinner pad="large" />
                      </Box>
                    ) : (
                      <>
                        <Text size="18px" weight="bold">
                          Your unlocked balance is{' '}
                          {toExactFixed(alluoInfo.unlocked, 2)}
                        </Text>
                        <Button
                          primary
                          label="Withdraw $ALLUO"
                          style={{ borderRadius: '58px', width: '197px' }}
                          onClick={handleWithdraw}
                        />
                      </>
                    )}
                  </Box>
                )}

                {!timerIsFinished(+alluoInfo?.depositUnlockTime) && (
                  <>
                    <UnlockCountdown
                      date={+alluoInfo?.depositUnlockTime * 1000}
                      onComplete={updateAlluoInfo}
                      label={`${toExactFixed(
                        alluoInfo.locked,
                        2,
                      )} TOKENS LOCKED UNTIL`}
                      showReunlockConfirmation={showReunlockConfirmation}
                    />
                  </>
                )}

                {!timerIsFinished(+alluoInfo?.withdrawUnlockTime) && (
                  <>
                    <UnlockCountdown
                      date={+alluoInfo.withdrawUnlockTime * 1000}
                      onComplete={updateAlluoInfo}
                      label={`UNLOCKING ${toExactFixed(
                        alluoInfo.unlocked,
                        2,
                      )} TOKENS IN`}
                      showReunlockConfirmation={showReunlockConfirmation}
                    />
                  </>
                )}
              </Box>
            )}
          </Box>
        </Box>
        <Modal chain={EChain.ETHEREUM} heading={'Stake $ALLUO'}>
          <Tabs>
            <Tab title="Lock">
              <LockTab
                isLoading={isLoading}
                alluoInfo={alluoInfo}
                updateAlluoInfo={updateAlluoInfo}
              />
            </Tab>
            <Tab title="Unlock">
              <UnlockTab
                isLoading={isLoading}
                alluoInfo={alluoInfo}
                updateAlluoInfo={updateAlluoInfo}
                startReunlockConfirmation={startReunlockConfirmation}
                showReunlockConfirmation={showReunlockConfirmation}
                cancelReunlockConfirmation={cancelReunlockConfirmation}
                allTimersAreFinished={allTimersAreFinished}
              />
            </Tab>
          </Tabs>
        </Modal>
        {walletAccountAtom && (
          <Box gap="22px">
            <Box
              round={'medium'}
              overflow="hidden"
              width="245px"
              align="start"
              height="224px"
              justify="between"
              gap="small"
              direction="column"
              background="modal"
              pad={{ vertical: 'medium', horizontal: 'medium' }}
            >
              {isLoading || isClamingRewards || isLoadingRewards ? (
                <Box align="center" justify="center" fill>
                  <Spinner pad="large" />
                </Box>
              ) : (
                <Box fill>
                  <Heading
                    size="small"
                    level={3}
                    margin={{ bottom: '16px', top: '0px' }}
                    fill
                  >
                    <Text size="18px">Rewards</Text>
                  </Heading>
                  <Box
                    direction="row"
                    justify="between"
                    margin={{ bottom: '28px' }}
                  >
                    <Text weight="bold" size="16px">
                      {seeRewardsAsStable
                        ? rewardsInfo.stableLabel
                        : rewardsInfo.label}
                    </Text>
                    <Text weight="bold" size="16px">
                      {seeRewardsAsStable
                        ? '$' + rewardsInfo.stableValue
                        : rewardsInfo.value}
                    </Text>
                  </Box>
                  <Box gap="12px">
                    <Button
                      primary
                      label={'Withdraw ' + rewardsInfo.label}
                      style={{ borderRadius: '58px', width: '197px' }}
                      onClick={claimRewards}
                    />
                    <Button
                      label={
                        seeRewardsAsStable
                          ? 'Show in ' + rewardsInfo.label + ' LP tokens?'
                          : 'Show in ' + rewardsInfo.stableLabel
                      }
                      onClick={() => setSeeRewardsAsStable(!seeRewardsAsStable)}
                      plain
                      style={{
                        textAlign: 'center',
                        color: '#2A73FF',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
            <Box
              round={'medium'}
              overflow="hidden"
              width="245px"
              align="start"
              height="122pxpx"
              justify="between"
              gap="small"
              direction="column"
              background="modal"
              pad={{ vertical: 'medium', horizontal: 'medium' }}
            >
              {isLoading || isClamingRewards || isLoadingPendingRewards ? (
                <Box align="center" justify="center" fill>
                  <Spinner pad="large" />
                </Box>
              ) : (
                <Box fill gap="12px">
                  <Text size="16px" weight="bold">
                    Pending rewards
                  </Text>
                  <Box direction="row" justify="between">
                    <Text weight="bold" size="16px">
                      {rewardsInfo.stableLabel}
                    </Text>
                    <Text weight="bold" size="16px">
                      {'$' + toExactFixed(pendingRewardsInfo, 4)}
                    </Text>
                  </Box>
                  <Text size="8px" weight={400}>
                    Available {nextHarvestDate.format('DD MMM')} · Last
                    harvested {previousHarvestDate.format('DD MMM')}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </>
    );
  };

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Layout>
          {!isSmall(size) ? (
            <Grid columns={['flex', 'auto', 'flex']} gap="small">
              {renderModal()}
            </Grid>
          ) : (
            <Grid rows={'auto'} gap="small">
              {renderModal()}
            </Grid>
          )}
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
