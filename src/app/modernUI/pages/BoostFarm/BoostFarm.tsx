import { timerIsFinished, toExactFixed } from 'app/common/functions/utils';
import { useMode } from 'app/common/state';
import { useBoostFarm } from 'app/common/state/boostFarm';
import {
  Layout,
  Modal,
  StepsProcessing,
  Tab,
  Tabs,
  TokenIcon
} from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import { Box, Button, Heading, ResponsiveContext, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';
import { UnlockCountdown } from '../../components/Countdown/UnlockCountdown';
import {
  BoostFarmDepositTab,
  BoostFarmPresentation,
  BoostFarmWithdrawalConfirmation,
  BoostFarmWithdrawalTab,
  LockedBoostFarmLockConfirmation,
  LockedBoostFarmPresentation,
  LockedBoostFarmUnlockConfirmation,
  LockedBoostFarmWithdrawUnlockedConfirmation
} from './blocks';
import { } from './blocks/BoostFarmWithdrawalConfirmation';

export const BoostFarm = () => {
  const { id } = useParams();

  const { isLightMode } = useMode();

  const {
    walletAccountAtom,
    isCorrectNetworkAtom,
    selectedTab,
    setSelectedTab,
    // presentation
    showTabs,
    showHeading,
    showBoostFarmPresentation,
    showLockedBoostFarmPresentation,
    // farm
    selectedFarm,
    isLoading,
    selectedFarmInfo,
    selectSupportedToken,
    selectedSupportedToken,
    updateFarmInfo,
    // interest
    interest,
    isLoadingInterest,
    // rewards
    isLoadingRewards,
    rewardsInfo,
    seeRewardsAsStable,
    setSeeRewardsAsStable,
    // pending rewards
    isLoadingPendingRewards,
    pendingRewardsInfo,
    previousHarvestDate,
    nextHarvestDate,
    losablePendingRewards,
    // biconomy
    useBiconomy,
    setUseBiconomy,
    // deposit
    depositValue,
    setDepositValue,
    showLockedBoostLockConfirmation,
    startLockedBoostLockConfirmation,
    //withdraw
    withdrawValue,
    setWithdrawValue,
    selectedSupportedTokenInfo,
    showBoostWithdrawalConfirmation,
    startBoostWithdrawalConfirmation,
    showLockedBoostWithdrawalConfirmation,
    startLockedBoostWithdrawalConfirmation,
    startLockedBoostManualUnlockSteps,
    // steps
    cancelConfirmations,
    isProcessing,
    currentStep,
    stepWasSuccessful,
    isHandlingStep,
    startProcessingSteps,
    stopProcessingSteps,
    steps,
    stepError,
    handleCurrentStep,
    processingTitle,
    startClaimRewardsSteps,
  } = useBoostFarm({
    id,
  });

  const farmName = (
    <span>
      {selectedFarm.current && (
        <>
          {selectedFarm.current?.isLocked && <span>🔒</span>}
          {selectedFarm.current?.name}
          <span style={{ color: '#1C1CFF' }}> BOOST</span>
        </>
      )}
    </span>
  );
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Layout>
          <Box direction={!isSmall(size) ? 'row' : 'column'} gap="small">
            <Box flex></Box>
            <Modal
              chain={selectedFarm.current?.chain}
              heading={farmName}
              noHeading={!showHeading}
              closeAction={
                isProcessing
                  ? stopProcessingSteps
                  : !showTabs &&
                    !showBoostFarmPresentation &&
                    !showLockedBoostFarmPresentation
                  ? cancelConfirmations
                  : undefined
              }
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
                  minHeight={
                    selectedFarm.current?.isLocked
                      ? selectedTab == 0
                        ? '644px'
                        : '644px'
                      : selectedTab == 0
                      ? '598px'
                      : '644px'
                  }
                />
              ) : (
                <>
                  {showBoostFarmPresentation && (
                    <BoostFarmPresentation
                      selectedFarm={selectedFarm}
                      farmName={farmName}
                      isLoadingInterest={isLoadingInterest}
                      interest={interest.current}
                    />
                  )}
                  {showLockedBoostFarmPresentation && (
                    <LockedBoostFarmPresentation
                      selectedFarm={selectedFarm}
                      farmName={selectedFarmInfo.current?.name}
                      isLoadingInterest={isLoadingInterest}
                      interest={interest.current}
                    />
                  )}
                  {showLockedBoostLockConfirmation && (
                    <LockedBoostFarmLockConfirmation
                      selectedFarmInfo={selectedFarmInfo}
                      cancelLockedBoostLockConfirmation={cancelConfirmations}
                      nextHarvestDate={nextHarvestDate.current}
                      // steps
                      startProcessingSteps={startProcessingSteps}
                    />
                  )}
                  {showBoostWithdrawalConfirmation && (
                    <>
                      {selectedFarmInfo.current?.isLocked ? (
                        <LockedBoostFarmUnlockConfirmation
                          nextHarvestDate={nextHarvestDate.current}
                          // steps
                          startProcessingSteps={startProcessingSteps}
                        />
                      ) : (
                        <BoostFarmWithdrawalConfirmation
                          selectedFarmInfo={selectedFarmInfo}
                          withdrawValue={withdrawValue}
                          withdrawTokenLabel={selectedSupportedToken?.label}
                          cancelBoostWithdrawalConfirmation={
                            cancelConfirmations
                          }
                          nextHarvestDate={nextHarvestDate}
                          losablePendingRewards={losablePendingRewards}
                          // steps
                          startProcessingSteps={startProcessingSteps}
                        />
                      )}
                    </>
                  )}
                  {showTabs && (
                    <>
                      <Tabs
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                      >
                        <Tab
                          title={
                            selectedFarm.current?.isLocked ? 'Lock' : 'Deposit'
                          }
                        >
                          <BoostFarmDepositTab
                            selectedFarm={selectedFarm}
                            selectedFarmInfo={selectedFarmInfo}
                            interest={interest}
                            isLoading={isLoading}
                            selectedSupportedToken={selectedSupportedToken}
                            selectedSupportedTokenInfo={
                              selectedSupportedTokenInfo
                            }
                            selectSupportedToken={selectSupportedToken}
                            isCorrectNetworkAtom={isCorrectNetworkAtom}
                            // deposit
                            depositValue={depositValue}
                            setDepositValue={setDepositValue}
                            startLockedBoostLockConfirmation={
                              startLockedBoostLockConfirmation
                            }
                            // biconomy
                            useBiconomy={useBiconomy}
                            setUseBiconomy={setUseBiconomy}
                            // steps
                            startProcessingSteps={startProcessingSteps}
                            steps={steps}
                          />
                        </Tab>
                        <Tab
                          title={
                            selectedFarm.current?.isLocked
                              ? 'Unlock'
                              : 'Withdraw'
                          }
                        >
                          <BoostFarmWithdrawalTab
                            // farm
                            selectedFarm={selectedFarm}
                            isLoading={isLoading}
                            interest={interest}
                            selectedFarmInfo={selectedFarmInfo}
                            selectedSupportedToken={selectedSupportedToken}
                            selectedSupportedTokenInfo={
                              selectedSupportedTokenInfo
                            }
                            selectSupportedToken={selectSupportedToken}
                            isCorrectNetworkAtom={isCorrectNetworkAtom}
                            // withdraw
                            withdrawValue={withdrawValue}
                            setWithdrawValue={setWithdrawValue}
                            startBoostWithdrawalConfirmation={
                              startBoostWithdrawalConfirmation
                            }
                            // biconomy
                            useBiconomy={useBiconomy}
                            setUseBiconomy={setUseBiconomy}
                            // steps
                            steps={steps}
                          />
                        </Tab>
                      </Tabs>
                      <Box
                        margin={{ top: '26px' }}
                        justify="center"
                        direction="row"
                      >
                        <Text size="12px">
                          Find out where these funds are being invested{' '}
                          <a
                            target="_blank"
                            href="https://docsend.com/view/np9ypdn38jajb9zj"
                            style={{
                              textDecoration: 'none',
                            }}
                          >
                            here
                          </a>
                        </Text>
                      </Box>
                    </>
                  )}
                </>
              )}
            </Modal>
            <Box flex>
              {walletAccountAtom &&
                !showBoostFarmPresentation &&
                !showLockedBoostFarmPresentation && (
                  <Box>
                    {selectedFarm.current?.isLocked && (
                      <>
                        {/*is unlocking and the timer isn't finished yet*/}
                        {selectedFarmInfo.current?.isUnlocking &&
                          nextHarvestDate.current?.valueOf() &&
                          !timerIsFinished(
                            nextHarvestDate.current?.valueOf(),
                            false,
                          ) && (
                            <Box margin={{ bottom: '12px' }}>
                              <UnlockCountdown
                                date={nextHarvestDate.current?.valueOf()}
                                onComplete={updateFarmInfo}
                                label={`UNLOCKING ${toExactFixed(
                                  selectedFarmInfo.current?.unlockingBalance,
                                  4,
                                )} ${selectedFarm.current?.name} IN`}
                              />
                            </Box>
                          )}
                        {/*the timer finished but is still unlocking*/}
                        {selectedFarmInfo.current?.isUnlocking &&
                          nextHarvestDate.current?.valueOf() &&
                          timerIsFinished(
                            nextHarvestDate.current?.valueOf(),
                            false,
                          ) && (
                            <Box
                              round="16px"
                              width="245px"
                              align="start"
                              justify="between"
                              gap="16px"
                              direction="column"
                              background="modal"
                              margin={{ bottom: '12px' }}
                              pad={{ vertical: 'medium', horizontal: 'medium' }}
                              border={
                                isLightMode
                                  ? { color: '#EBEBEB', size: '1px' }
                                  : { size: '0px' }
                              }
                            >
                              <Text
                                size="11px"
                                weight="bold"
                                textAlign="center"
                              >
                                Gas fees are too high to harvest 🚨
                              </Text>
                              <Text size="10px" textAlign="center">
                                We’ll keep trying. You can manually unlock, but
                                will need to pay all fees and lose this week’s
                                pending rewards
                              </Text>
                              <Button
                                label="Start manual unlock"
                                style={{
                                  borderRadius: '58px',
                                  width: '197px',
                                  padding: '6px 16px',
                                }}
                                onClick={() => {
                                  startLockedBoostManualUnlockSteps();
                                }}
                                disabled={isLoading}
                              />
                            </Box>
                          )}
                        {/*is not unlocking and there is unlocked value to claim*/}
                        {!selectedFarmInfo.current?.isUnlocking &&
                          +selectedFarmInfo.current?.unlockedBalance > 0 && (
                            <Box
                              round="16px"
                              width="245px"
                              align="start"
                              justify="between"
                              gap="16px"
                              direction="column"
                              height="154px"
                              background="modal"
                              margin={{ bottom: '12px' }}
                              pad={{ vertical: 'medium', horizontal: 'medium' }}
                              border={
                                isLightMode
                                  ? { color: '#EBEBEB', size: '1px' }
                                  : { size: '0px' }
                              }
                            >
                              {isLoading ? (
                                <Box
                                  style={{ minHeight: '54px' }}
                                  fill="horizontal"
                                >
                                  <Skeleton
                                    count={2}
                                    height="19px"
                                    borderRadius="20px"
                                  />
                                </Box>
                              ) : (
                                <Text size="18px" weight="bold">
                                  {toExactFixed(
                                    selectedFarmInfo.current?.unlockedBalance,
                                    4,
                                  )}{' '}
                                  {selectedFarm.current?.name} unlocked
                                </Text>
                              )}
                              <Button
                                primary
                                label="Withdraw now"
                                style={{
                                  borderRadius: '58px',
                                  width: '197px',
                                  padding: '6px 16px',
                                }}
                                onClick={() => {
                                  startLockedBoostWithdrawalConfirmation();
                                }}
                                disabled={isLoading}
                              />
                              {showLockedBoostWithdrawalConfirmation && (
                                <LockedBoostFarmWithdrawUnlockedConfirmation
                                  selectedFarmInfo={selectedFarmInfo}
                                  selectedSupportedToken={
                                    selectedSupportedToken
                                  }
                                  selectedSupportedTokenInfo={
                                    selectedSupportedTokenInfo
                                  }
                                  selectSupportedToken={selectSupportedToken}
                                  cancelConfirmations={cancelConfirmations}
                                  // loading
                                  isLoading={isLoading}
                                  // steps
                                  startProcessingSteps={startProcessingSteps}
                                  steps={steps}
                                />
                              )}
                            </Box>
                          )}
                      </>
                    )}
                    <Box
                      round="16px"
                      overflow="hidden"
                      width="245px"
                      align="start"
                      justify="between"
                      gap="small"
                      direction="column"
                      background="modal"
                      margin={{ bottom: '12px' }}
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
                                  {selectedFarmInfo.current?.rewards?.icons?.map(
                                    (icon, i) => (
                                      <TokenIcon
                                        key={i}
                                        label={icon}
                                        style={
                                          i > 0 ? { marginLeft: '-0.6rem' } : {}
                                        }
                                      />
                                    ),
                                  )}
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
                              <Text weight="bold" size="16px">
                                {seeRewardsAsStable
                                  ? rewardsInfo.current?.stableLabel
                                  : rewardsInfo.current?.label}
                              </Text>

                              <Text weight="bold" size="16px">
                                {seeRewardsAsStable
                                  ? '$' + rewardsInfo.current?.stableValue
                                  : rewardsInfo.current?.value}
                              </Text>
                            </Box>
                          )}
                        </Box>

                        <Box gap="12px">
                          <Button
                            primary
                            label={`Withdraw ${
                              seeRewardsAsStable
                                ? rewardsInfo.current?.stableLabel
                                : rewardsInfo.current?.label
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
                                    rewardsInfo.current?.label +
                                    ' LP tokens'
                                  : 'Show in ' +
                                    rewardsInfo.current?.stableLabel}
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
                        showBoostWithdrawalConfirmation &&
                        !selectedFarm.current?.isLocked
                          ? {
                              color: '#F59F31',
                              size: '0.5px',
                            }
                          : isLightMode
                          ? { color: '#EBEBEB', size: '1px' }
                          : { size: '0px' }
                      }
                      style={
                        showBoostWithdrawalConfirmation &&
                        !selectedFarm.current?.isLocked
                          ? {
                              boxShadow:
                                '0px 0px 20px 0px rgba(255, 152, 17, 0.2)',
                            }
                          : {}
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
                                  {rewardsInfo.current?.stableLabel}
                                </Text>

                                <Text weight="bold" size="16px">
                                  {'$' +
                                    toExactFixed(pendingRewardsInfo.current, 4)}
                                </Text>
                              </>
                            )}
                          </Box>
                        )}
                        {isLoading || isLoadingPendingRewards ? (
                          <Skeleton height="8px" borderRadius="20px" />
                        ) : (
                          <Text size="8px" weight={400}>
                            Available{' '}
                            {nextHarvestDate.current?.format('DD MMM')} · Last
                            harvested{' '}
                            {previousHarvestDate.current?.format('DD MMM')}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
            </Box>
          </Box>
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
