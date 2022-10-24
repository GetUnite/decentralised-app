import { EChain } from 'app/common/constants/chains';
import { roundNumberDown, timerIsFinished } from 'app/common/functions/utils';
import { useStake } from 'app/common/state/stake';
import { Layout, Modal, Spinner, Tab, Tabs } from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import { Box, Button, Grid, ResponsiveContext, Text } from 'grommet';
import { LockTab } from './blocks/LockTab';
import { UnlockTab } from './blocks/UnlockTab';
import { UnlockCountdown } from './components/UnlockCountdown';

export const Stake = ({ ...rest }) => {
  const {
    alluoTokenInfo,
    alluoStakingInfo,
    walletAccountAtom,
    isLoading,
    isWithdrawing,
    handleApprove,
    handleLock,
    handleUnlock,
    handleWithdraw,
    startReunlockConfirmation,
    showReunlockConfirmation,
    cancelReunlockConfirmation,
    showTabs,
  } = useStake();

  const allTimersAreFinished =
    timerIsFinished(alluoStakingInfo?.depositUnlockTime) &&
    timerIsFinished(alluoStakingInfo?.withdrawUnlockTime);

  const renderModal = () => {
    return (
      <>
        <Box direction="row" justify="end">
          <Box gap="28px">
            {walletAccountAtom && !isLoading && (
              <Box gap="16px">
                {+alluoStakingInfo?.unlocked > 0 && allTimersAreFinished && (
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
                          {roundNumberDown(alluoStakingInfo.unlocked, 2)}
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

                {!timerIsFinished(+alluoStakingInfo?.depositUnlockTime) && (
                  <>
                    <UnlockCountdown
                      date={+alluoStakingInfo?.depositUnlockTime * 1000}
                      onComplete={() => {}}
                      label={`UNLOCKING ${alluoStakingInfo.locked} TOKENS IN`}
                      showReunlockConfirmation={showReunlockConfirmation}
                    />
                  </>
                )}

                {!timerIsFinished(+alluoStakingInfo?.withdrawUnlockTime) && (
                  <>
                    <UnlockCountdown
                      date={+alluoStakingInfo.withdrawUnlockTime * 1000}
                      onComplete={() => {}}
                      label={`UNLOCKING ${alluoStakingInfo.unlocked} TOKENS IN`}
                      showReunlockConfirmation={showReunlockConfirmation}
                    />
                  </>
                )}
              </Box>
            )}
          </Box>
        </Box>
        <Modal chain={EChain.ETHEREUM} heading={'Stake $ALLUO'}>
          {/*showReunlockConfirmation && (
              <ReunlockConfirmation
              handleUnlock={handleUnlock}
              cancelReunlockConfirmation={cancelReunlockConfirmation}
            />
          )*/}
          {showTabs && (<Tabs>
            <Tab title="Lock">
              <LockTab
                isLoading={isLoading}
                alluoStakingInfo={alluoStakingInfo}
                alluoTokenInfo={alluoTokenInfo}
                handleApprove={handleApprove}
                handleLock={handleLock}
              />
            </Tab>
            <Tab title="Unlock">
              <UnlockTab
                isLoading={isLoading}
                alluoStakingInfo={alluoStakingInfo}
                handleUnlock={handleUnlock}
                startReunlockConfirmation={startReunlockConfirmation}
                cancelReunlockConfirmation={cancelReunlockConfirmation}
                allTimersAreFinished={allTimersAreFinished}
              />
            </Tab>
          </Tabs>)}
        </Modal>
        <Box></Box>
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
