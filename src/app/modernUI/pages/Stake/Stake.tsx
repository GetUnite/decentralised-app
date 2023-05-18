import { EChain } from 'app/common/constants/chains';
import { timerIsFinished, toExactFixed } from 'app/common/functions/utils';
import { useMode } from 'app/common/state';
import { useStake } from 'app/common/state/stake';
import {
  Layout,
  Modal,
  StepsProcessing,
  Tab,
  Tabs,
  TokenIcon,
  Tooltip,
} from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import { Box, Button, Heading, ResponsiveContext, Text } from 'grommet';
import { CircleInformation } from 'grommet-icons';
import Skeleton from 'react-loading-skeleton';
import { UnlockCountdown } from '../../components/Countdown/UnlockCountdown';
import { LockTab } from './blocks/LockTab';
import { ReunlockConfirmation } from './blocks/ReunlockConfirmation';
import { StakePresentation } from './blocks/StakePresentation';
import { UnlockTab } from './blocks/UnlockTab';

export const Stake = ({ ...rest }) => {
  const { isLightMode } = useMode();

  const {
    selectedTab,
    setSelectedTab,
    isLoading,
    updateAlluoInfo,
    alluoInfo,
    walletAccountAtom,
    startReunlockConfirmation,
    showReunlockConfirmation,
    cancelReunlockConfirmation,
    seeRewardsAsStable,
    setSeeRewardsAsStable,
    isLoadingRewards,
    rewardsInfo,
    pendingRewardsInfo,
    nextHarvestDate,
    previousHarvestDate,
    isLoadingPendingRewards,
    isLoadingRewardsApy,
    rewardsApy,
    // information/confirmation
    showStakePresentation,
    // lock
    lockValue,
    setLockValue,
    // unlock
    unlockValue,
    setUnlockValue,
    // steps
    isProcessing,
    currentStep,
    isHandlingStep,
    stepWasSuccessful,
    processingTitle,
    stepError,
    startProcessingSteps,
    stopProcessingSteps,
    steps,
    handleCurrentStep,
    startWithdrawSteps,
    startClaimRewardsSteps,
  } = useStake();

  const allTimersAreFinished =
    timerIsFinished(alluoInfo?.depositUnlockTime) &&
    timerIsFinished(alluoInfo?.withdrawUnlockTime);

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
                          round="16px"
                          width="245px"
                          align="start"
                          justify="between"
                          gap="16px"
                          direction="column"
                          height="154px"
                          background="modal"
                          pad={{ vertical: 'medium', horizontal: 'medium' }}
                          border={
                            isLightMode
                              ? { color: '#EBEBEB', size: '1px' }
                              : { size: '0px' }
                          }
                        >
                          <Text size="18px" weight="bold">
                            Your unlocked balance is{' '}
                            {toExactFixed(alluoInfo?.unlocked, 2)}
                          </Text>
                          <Button
                            primary
                            label="Withdraw $ALLUO"
                            style={{
                              borderRadius: '58px',
                              width: '197px',
                              padding: '6px 16px',
                            }}
                            onClick={startWithdrawSteps}
                          />
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
              <Modal
                chain={EChain.ETHEREUM}
                heading={'Stake $ALLUO'}
                closeAction={isProcessing ? stopProcessingSteps : undefined}
                noHeading={isProcessing || showStakePresentation}
              >
                {isProcessing ? (
                  <StepsProcessing
                    title={processingTitle.current}
                    steps={steps.current}
                    currentStep={currentStep}
                    isHandlingStep={isHandlingStep}
                    stepWasSuccessful={stepWasSuccessful.current}
                    stepError={stepError.current}
                    stopProcessingSteps={stopProcessingSteps}
                    handleCurrentStep={handleCurrentStep}
                    minHeight={selectedTab == 0 ? '538px' : '579px'}
                  />
                ) : (
                  <>
                    {showReunlockConfirmation && (
                      <ReunlockConfirmation
                        cancelReunlockConfirmation={cancelReunlockConfirmation}
                        startProcessingSteps={startProcessingSteps}
                      />
                    )}
                    {showStakePresentation && (
                      <StakePresentation
                        rewardsApy={rewardsApy.current}
                        isLoadingRewardsApy={isLoadingRewardsApy}
                      />
                    )}
                    {!showReunlockConfirmation && !showStakePresentation && (
                      <Tabs
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                      >
                        <Tab title="Lock">
                          <LockTab
                            isLoading={isLoading}
                            alluoInfo={alluoInfo}
                            lockValue={lockValue}
                            setLockValue={setLockValue}
                            // steps
                            steps={steps}
                            startProcessingSteps={startProcessingSteps}
                          />
                        </Tab>
                        <Tab title="Unlock">
                          <UnlockTab
                            isLoading={isLoading}
                            alluoInfo={alluoInfo}
                            startReunlockConfirmation={
                              startReunlockConfirmation
                            }
                            allTimersAreFinished={allTimersAreFinished}
                            unlockValue={unlockValue}
                            setUnlockValue={setUnlockValue}
                            // steps
                            steps={steps}
                            startProcessingSteps={startProcessingSteps}
                          />
                        </Tab>
                      </Tabs>
                    )}
                  </>
                )}
              </Modal>
              <Box flex>
                {walletAccountAtom && !showStakePresentation && (
                  <Box gap="12px">
                    <Box
                      round="16px"
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
                                <Skeleton height="18px" borderRadius="20px" />
                              </Box>
                            ) : (
                              <>
                                <Text size="18px">Rewards</Text>
                                <Box direction="row">
                                  <TokenIcon key={0} label={'CVX'} />
                                  <TokenIcon
                                    key={1}
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
                            <Skeleton height="16px" borderRadius="20px" />
                          ) : (
                            <Box direction="row" justify="between">
                              <Box direction="row" align="center" gap="6px">
                                <Text weight="bold" size="16px">
                                  {seeRewardsAsStable
                                    ? rewardsInfo.stableLabel
                                    : rewardsInfo.label}
                                </Text>
                                <Tooltip
                                  text={`Rewards for staking $ALLUO tokens are paid in auto-compounding CVX/ETH. The longer you leave your rewards unclaimed, the larger they will get. The current APY is ${toExactFixed(
                                    rewardsApy.current,
                                    2,
                                  )}%. Stakers can also vote in governance rounds, held every 2 weeks.`}
                                >
                                  <CircleInformation
                                    color="soul"
                                    size="16px"
                                    style={{ marginTop: '-2px' }}
                                  />
                                </Tooltip>
                              </Box>
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
                            label={`Withdraw ${
                              seeRewardsAsStable
                                ? rewardsInfo.stableLabel
                                : rewardsInfo.label
                            }`}
                            style={{
                              borderRadius: '58px',
                              width: '197px',
                              padding: '6px 16px',
                            }}
                            onClick={startClaimRewardsSteps}
                            disabled={
                              isLoading || isLoadingRewards || isProcessing
                            }
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
                    </Box>
                    <Box
                      round="16px"
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
                          <Skeleton height="16px" borderRadius="20px" />
                        ) : (
                          <Text size="16px" weight="bold">
                            Pending rewards
                          </Text>
                        )}
                        {isLoading || isLoadingPendingRewards ? (
                          <Skeleton borderRadius="20px" />
                        ) : (
                          <Box direction="row" justify="between">
                            {isLoading || isLoadingRewards ? (
                              <Skeleton height="16px" borderRadius="20px" />
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
                          <Skeleton height="8px" borderRadius="20px" />
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
          )}
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
