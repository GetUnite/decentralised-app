import { toExactFixed } from 'app/common/functions/utils';
import { useMode } from 'app/common/state';
import { walletAccount } from 'app/common/state/atoms';
import { useBoostFarm } from 'app/common/state/boostFarm';
import {
  Layout,
  Modal,
  Spinner,
  Tab,
  Tabs,
  TokenIcon
} from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import { Box, Button, Heading, ResponsiveContext, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
  BoostFarmDepositConfirmation,
  BoostFarmDepositTab,
  BoostFarmPresentation,
  BoostFarmWithdrawalConfirmation,
  BoostFarmWithdrawalTab,
  LockedBoostFarmPresentation
} from './blocks';
import { } from './blocks/BoostFarmWithdrawalConfirmation';

export const BoostFarm = () => {
  const { id } = useParams();

  const { isLightMode } = useMode();
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const {
    // presentation
    showTabs,
    showHeading,
    showBoostFarmPresentation,
    showLockedBoostFarmPresentation,
    // farm
    isLoading,
    selectedFarmInfo,
    selectSupportedToken,
    selectedSupportedToken,
    // rewards
    isLoadingRewards,
    rewardsInfo,
    seeRewardsAsStable,
    setSeeRewardsAsStable,
    claimRewards,
    isClamingRewards,
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
    handleDeposit,
    isDepositing,
    showBoostDepositConfirmation,
    startBoostDepositConfirmation,
    cancelBoostDepositConfirmation,
    //withdraw
    withdrawValue,
    setWithdrawValue,
    handleWithdraw,
    isWithdrawing,
    showBoostWithdrawalConfirmation,
    startBoostWithdrawalConfirmation,
    cancelBoostWithdrawalConfirmation,
  } = useBoostFarm({
    id,
  });

  const farmName = (
    <span>
      {selectedFarmInfo.current && (
        <>
          {selectedFarmInfo.current?.isLocked && <span>🔒</span>}
          {selectedFarmInfo.current?.name}
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
              chain={selectedFarmInfo.current?.chain}
              heading={farmName}
              showChainBadge={!isLoading}
              noHeading={!showHeading}
            >
              <>
                {showBoostFarmPresentation && (
                  <BoostFarmPresentation
                    selectedFarmInfo={selectedFarmInfo}
                    farmName={farmName}
                    isLoading={isLoading}
                  />
                )}
                {showLockedBoostFarmPresentation && (
                  <LockedBoostFarmPresentation
                    selectedFarmInfo={selectedFarmInfo}
                    farmName={farmName}
                    isLoading={isLoading}
                  />
                )}
                {showBoostDepositConfirmation && (
                  <BoostFarmDepositConfirmation
                    selectedFarmInfo={selectedFarmInfo}
                    handleDeposit={handleDeposit}
                    cancelBoostDepositConfirmation={
                      cancelBoostDepositConfirmation
                    }
                    nextHarvestDate={nextHarvestDate}
                  />
                )}
                {showBoostWithdrawalConfirmation && (
                  <>
                    {selectedFarmInfo.current?.isLocked ? (
                      <BoostFarmWithdrawalConfirmation
                        selectedFarmInfo={selectedFarmInfo}
                        withdrawValue={withdrawValue}
                        withdrawTokenLabel={selectedSupportedToken?.label}
                        handleWithdraw={handleWithdraw}
                        cancelBoostWithdrawalConfirmation={
                          cancelBoostWithdrawalConfirmation
                        }
                        nextHarvestDate={nextHarvestDate}
                        losablePendingRewards={losablePendingRewards}
                      />
                    ) : (
                      <BoostFarmWithdrawalConfirmation
                        selectedFarmInfo={selectedFarmInfo}
                        withdrawValue={withdrawValue}
                        withdrawTokenLabel={selectedSupportedToken?.label}
                        handleWithdraw={handleWithdraw}
                        cancelBoostWithdrawalConfirmation={
                          cancelBoostWithdrawalConfirmation
                        }
                        nextHarvestDate={nextHarvestDate}
                        losablePendingRewards={losablePendingRewards}
                      />
                    )}
                  </>
                )}
                {showTabs && (
                  <>
                    <Tabs>
                      <Tab title="Deposit">
                        <BoostFarmDepositTab
                          selectedFarmInfo={selectedFarmInfo}
                          isLoading={isLoading}
                          selectedSupportedToken={selectedSupportedToken}
                          selectSupportedToken={selectSupportedToken}
                          // deposit
                          depositValue={depositValue}
                          setDepositValue={setDepositValue}
                          startBoostDepositConfirmation={
                            startBoostDepositConfirmation
                          }
                          handleDeposit={handleDeposit}
                          isDepositing={isDepositing}
                          // biconomy
                          useBiconomy={useBiconomy}
                          setUseBiconomy={setUseBiconomy}
                        />
                      </Tab>
                      <Tab title="Withdraw">
                        <BoostFarmWithdrawalTab
                          // farm
                          isLoading={isLoading}
                          selectedFarmInfo={selectedFarmInfo}
                          selectedSupportedToken={selectedSupportedToken}
                          selectSupportedToken={selectSupportedToken}
                          // withdraw
                          withdrawValue={withdrawValue}
                          setWithdrawValue={setWithdrawValue}
                          startBoostWithdrawalConfirmation={
                            startBoostWithdrawalConfirmation
                          }
                          isWithdrawing={isWithdrawing}
                          // biconomy
                          useBiconomy={useBiconomy}
                          setUseBiconomy={setUseBiconomy}
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
            </Modal>
            <Box flex>
              {walletAccountAtom &&
                !showBoostFarmPresentation &&
                !showBoostWithdrawalConfirmation && (
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
                                  <Skeleton height="18px" borderRadius="20px"/>
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
                                            i > 0
                                              ? { marginLeft: '-0.6rem' }
                                              : {}
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
                              <Skeleton height="16px" borderRadius="20px"/>
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
                              label={'Withdraw ' + rewardsInfo.current?.label}
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
                                      rewardsInfo.current?.label +
                                      ' LP tokens'
                                    : 'Show in ' +
                                      rewardsInfo.current?.stableLabel}
                                </Text>
                              </Box>
                            </Button>
                          </Box>
                        </Box>
                      )}
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
                          <Skeleton height="16px" borderRadius="20px"/>
                        ) : (
                          <Text size="16px" weight="bold">
                            Pending rewards
                          </Text>
                        )}
                        {isLoading || isLoadingPendingRewards ? (
                          <Skeleton borderRadius="20px"/>
                        ) : (
                          <Box direction="row" justify="between">
                            {isLoading || isLoadingRewards ? (
                              <Skeleton height="16px" borderRadius="20px"/>
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
                          <Skeleton height="8px" borderRadius="20px"/>
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
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
