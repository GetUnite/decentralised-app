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
    isLoading,
    updateAlluoInfo,
    alluoInfo,
    handleWithdraw,
    walletAccountAtom,
    isWithdrawing,
    startReunlockConfirmation,
    showReunlockConfirmation,
    cancelReunlockConfirmation,
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
                          {roundNumberDown(alluoInfo.unlocked, 2)}
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
                      label={`${roundNumberDown(
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
                      label={`UNLOCKING ${roundNumberDown(
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
