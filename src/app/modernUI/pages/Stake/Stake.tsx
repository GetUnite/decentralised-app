import { EChain } from 'app/common/constants/chains';
import { timerIsFinished, toExactFixed } from 'app/common/functions/utils';
import { useMode } from 'app/common/state';
import { useStake } from 'app/common/state/stake';
import {
  Layout,
  Modal,
  Spinner,
  Tab,
  Tabs,
  TokenIcon
} from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
<<<<<<< HEAD
import { Box, Button, Grid, Heading, ResponsiveContext, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';
import { LockTab } from './blocks/LockTab';
=======
import { Box, Button, Heading, ResponsiveContext, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';
import { LockTab } from './blocks/LockTab';
import { ReunlockConfirmation } from './blocks/ReunlockConfirmation';
>>>>>>> staging
import { UnlockTab } from './blocks/UnlockTab';
import { UnlockCountdown } from './components/UnlockCountdown';

export const Stake = ({ ...rest }) => {
  const { isLightMode } = useMode();

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
<<<<<<< HEAD
=======
    // unlock
    unlockValue,
    setUnlockValue,
    isUnlocking,
    handleUnlock,
>>>>>>> staging
  } = useStake();

  const allTimersAreFinished =
    timerIsFinished(alluoInfo?.depositUnlockTime) &&
    timerIsFinished(alluoInfo?.withdrawUnlockTime);

<<<<<<< HEAD
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
                          {toExactFixed(alluoInfo?.unlocked, 2)}
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
                        alluoInfo?.locked,
                        2,
                      )} TOKENS LOCKED UNTIL`}
                      showReunlockConfirmation={showReunlockConfirmation}
                    />
                  </>
                )}

                {!timerIsFinished(+alluoInfo?.withdrawUnlockTime) && (
                  <>
                    <UnlockCountdown
                      date={+alluoInfo?.withdrawUnlockTime * 1000}
                      onComplete={updateAlluoInfo}
                      label={`UNLOCKING ${toExactFixed(
                        alluoInfo?.unlocked,
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
          <Box gap="12px">
            <Box
              round={'medium'}
              overflow="hidden"
              width="245px"
              align="start"
              justify="between"
              gap="small"
              direction="column"
              background="modal"
              pad={{ vertical: 'medium', horizontal: 'medium' }}
              border={
                isLightMode
                  ? { color: '#EBEBEB', size: '1px' }
                  : { size: '0px' }
              }
            >
              {isClamingRewards ? (
                <Box align="center" justify="center" fill>
                  <Spinner pad="large" />
                </Box>
              ) : (
                <Box fill>
                  <Heading
                    size="small"
                    level={3}
                    margin={{ bottom: '12px', top: '0px' }}
                    fill
                  >
                    <Box direction="row" justify="between" fill>
                      {isLoading || isLoadingRewards ? (
                        <Box fill>
                          <Skeleton height="18px" />
                        </Box>
                      ) : (
                        <>
                          <Text size="18px">Rewards</Text>
                          <Box direction="row">
                            <TokenIcon key={0} label={'CVX'} />
                            <TokenIcon
                              key={0}
                              label={'ETH'}
                              style={{ marginLeft: '-0.6rem' }}
                            />
                          </Box>
                        </>
                      )}
                    </Box>
                  </Heading>

                  <Box margin={{ bottom: '16px' }}>
                    {isLoading || isLoadingRewards ? (
                      <Skeleton height="16px" />
                    ) : (
                      <Box direction="row" justify="between">
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
                    )}
                  </Box>

                  <Box gap="12px">
                    <Button
                      primary
                      label={'Withdraw ' + rewardsInfo.label}
                      style={{
                        borderRadius: '58px',
                        width: '197px',
                        padding: '6px 16px',
                      }}
                      onClick={claimRewards}
                      disabled={isLoading || isLoadingRewards}
                    />
                    <Button
                      onClick={() => setSeeRewardsAsStable(!seeRewardsAsStable)}
                      plain
                      disabled={isLoading || isLoadingRewards}
                    >
                      <Box direction="row" justify="center">
                        <Text size="12px" weight={500} color="#2A73FF">
                          {seeRewardsAsStable
                            ? 'Show in ' + rewardsInfo.label + ' LP tokens'
                            : 'Show in ' + rewardsInfo.stableLabel}
                        </Text>
                      </Box>
                    </Button>
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
              border={
                isLightMode
                  ? { color: '#EBEBEB', size: '1px' }
                  : { size: '0px' }
              }
            >
              <Box fill gap="12px">
                {isLoading || isLoadingPendingRewards ? (
                  <Skeleton height="16px" />
                ) : (
                  <Text size="16px" weight="bold">
                    Pending rewards
                  </Text>
                )}
                {isLoading || isLoadingPendingRewards ? (
                  <Skeleton />
                ) : (
                  <Box direction="row" justify="between">
                    {isLoading || isLoadingRewards ? (
                      <Skeleton height="16px" />
                    ) : (
                      <>
                        <Text weight="bold" size="16px">
                          {rewardsInfo.stableLabel}
                        </Text>

                        <Text weight="bold" size="16px">
                          {'$' + toExactFixed(pendingRewardsInfo, 4)}
                        </Text>
                      </>
                    )}
                  </Box>
                )}
                {isLoading || isLoadingPendingRewards ? (
                  <Skeleton height="8px" />
                ) : (
                  <Text size="8px" weight={400}>
                    Available {nextHarvestDate.format('DD MMM')} · Last
                    harvested {previousHarvestDate.format('DD MMM')}
                  </Text>
                )}
              </Box>
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
=======
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Layout>
          {/*Kindy hacky but for some reason if the modal is inside the flex box when no wallet is connected a ghost margin appears that shifts things slighly up*/}
          {!walletAccountAtom ? (
            <Modal chain={EChain.ETHEREUM} heading={'Stake $ALLUO'}></Modal>
          ) : (
            <Box direction={!isSmall(size) ? 'row' : 'column'} gap="small">
              <Box direction="row" justify="end" flex>
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
                                {toExactFixed(alluoInfo?.unlocked, 2)}
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
                              alluoInfo?.locked,
                              2,
                            )} TOKENS LOCKED UNTIL`}
                            showReunlockConfirmation={showReunlockConfirmation}
                          />
                        </>
                      )}

                      {!timerIsFinished(+alluoInfo?.withdrawUnlockTime) && (
                        <>
                          <UnlockCountdown
                            date={+alluoInfo?.withdrawUnlockTime * 1000}
                            onComplete={updateAlluoInfo}
                            label={`UNLOCKING ${toExactFixed(
                              alluoInfo?.unlocked,
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
                {showReunlockConfirmation ? (
                  <ReunlockConfirmation
                    handleUnlock={handleUnlock}
                    cancelReunlockConfirmation={cancelReunlockConfirmation}
                  />
                ) : (
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
                        startReunlockConfirmation={startReunlockConfirmation}
                        showReunlockConfirmation={showReunlockConfirmation}
                        cancelReunlockConfirmation={cancelReunlockConfirmation}
                        allTimersAreFinished={allTimersAreFinished}
                        unlockValue={unlockValue}
                        setUnlockValue={setUnlockValue}
                        isUnlocking={isUnlocking}
                        handleUnlock={handleUnlock}
                      />
                    </Tab>
                  </Tabs>
                )}
              </Modal>
              <Box flex>
                {walletAccountAtom && (
                  <Box gap="12px">
                    <Box
                      round={'medium'}
                      overflow="hidden"
                      width="245px"
                      align="start"
                      justify="between"
                      gap="small"
                      direction="column"
                      background="modal"
                      pad={{ vertical: 'medium', horizontal: 'medium' }}
                      border={
                        isLightMode
                          ? { color: '#EBEBEB', size: '1px' }
                          : { size: '0px' }
                      }
                    >
                      {isClamingRewards ? (
                        <Box align="center" justify="center" fill>
                          <Spinner pad="large" />
                        </Box>
                      ) : (
                        <Box fill>
                          <Heading
                            size="small"
                            level={3}
                            margin={{ bottom: '12px', top: '0px' }}
                            fill
                          >
                            <Box direction="row" justify="between" fill>
                              {isLoading || isLoadingRewards ? (
                                <Box fill>
                                  <Skeleton height="18px" />
                                </Box>
                              ) : (
                                <>
                                  <Text size="18px">Rewards</Text>
                                  <Box direction="row">
                                    <TokenIcon key={0} label={'CVX'} />
                                    <TokenIcon
                                      key={0}
                                      label={'ETH'}
                                      style={{ marginLeft: '-0.6rem' }}
                                    />
                                  </Box>
                                </>
                              )}
                            </Box>
                          </Heading>

                          <Box margin={{ bottom: '16px' }}>
                            {isLoading || isLoadingRewards ? (
                              <Skeleton height="16px" />
                            ) : (
                              <Box direction="row" justify="between">
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
                            )}
                          </Box>

                          <Box gap="12px">
                            <Button
                              primary
                              label={'Withdraw ' + rewardsInfo.label}
                              style={{
                                borderRadius: '58px',
                                width: '197px',
                                padding: '6px 16px',
                              }}
                              onClick={claimRewards}
                              disabled={isLoading || isLoadingRewards}
                            />
                            <Button
                              onClick={() =>
                                setSeeRewardsAsStable(!seeRewardsAsStable)
                              }
                              plain
                              disabled={isLoading || isLoadingRewards}
                            >
                              <Box direction="row" justify="center">
                                <Text size="12px" weight={500} color="#2A73FF">
                                  {seeRewardsAsStable
                                    ? 'Show in ' +
                                      rewardsInfo.label +
                                      ' LP tokens'
                                    : 'Show in ' + rewardsInfo.stableLabel}
                                </Text>
                              </Box>
                            </Button>
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
                      border={
                        isLightMode
                          ? { color: '#EBEBEB', size: '1px' }
                          : { size: '0px' }
                      }
                    >
                      <Box fill gap="12px">
                        {isLoading || isLoadingPendingRewards ? (
                          <Skeleton height="16px" />
                        ) : (
                          <Text size="16px" weight="bold">
                            Pending rewards
                          </Text>
                        )}
                        {isLoading || isLoadingPendingRewards ? (
                          <Skeleton />
                        ) : (
                          <Box direction="row" justify="between">
                            {isLoading || isLoadingRewards ? (
                              <Skeleton height="16px" />
                            ) : (
                              <>
                                <Text weight="bold" size="16px">
                                  {rewardsInfo.stableLabel}
                                </Text>

                                <Text weight="bold" size="16px">
                                  {'$' + toExactFixed(pendingRewardsInfo, 4)}
                                </Text>
                              </>
                            )}
                          </Box>
                        )}
                        {isLoading || isLoadingPendingRewards ? (
                          <Skeleton height="8px" />
                        ) : (
                          <Text size="8px" weight={400}>
                            Available {nextHarvestDate.format('DD MMM')} · Last
                            harvested {previousHarvestDate.format('DD MMM')}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
>>>>>>> staging
          )}
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
