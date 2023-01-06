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
import { Box, Button, Grid, Heading, ResponsiveContext, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
  BoostFarmDepositTab,
  BoostFarmPresentation,
  BoostFarmWithdrawalTab
} from './blocks';

export const BoostFarm = () => {
  const { id } = useParams();

  const { isLightMode } = useMode();
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const {
    selectedFarm,
    updateFarmInfo,
    isLoading,
    selectSupportedToken,
    selectedSupportedToken,
    seeRewardsAsStable,
    setSeeRewardsAsStable,
    claimRewards,
    isClamingRewards,
    isLoadingRewards,
    showBoostFarmPresentation,
    showTabs,
    previousHarvestDate,
    nextHarvestDate,
    showBoostWithdrawalConfirmation,
    startBoostWithdrawalConfirmation,
    cancelBoostWithdrawalConfirmation,
    rewardsInfo,
    losablePendingRewards,
    pendingRewardsInfo,
    isLoadingPendingRewards,
  } = useBoostFarm({
    id,
  });

  const renderModal = () => {
    const farmName = (
      <span>
        {selectedFarm?.name}
        {selectedFarm?.isBoost && (
          <span style={{ color: '#1C1CFF' }}> BOOST</span>
        )}
      </span>
    );
    return (
      <>
        <Box></Box>
        <Modal
          chain={selectedFarm?.chain}
          heading={farmName}
          showChainBadge={!isLoading}
          noHeading={!showTabs}
        >
          <>
            {showBoostFarmPresentation && (
              <BoostFarmPresentation
                selectedFarm={selectedFarm}
                farmName={farmName}
                isLoading={isLoading}
              />
            )}
            {showTabs && (
              <Tabs>
                <Tab title="Deposit">
                  <BoostFarmDepositTab
                    selectedFarm={selectedFarm}
                    isLoading={isLoading}
                    selectedSupportedToken={selectedSupportedToken}
                    selectSupportedToken={selectSupportedToken}
                  />
                </Tab>
                <Tab title="Withdraw">
                  <BoostFarmWithdrawalTab
                    selectedFarm={selectedFarm}
                    isLoading={isLoading}
                    updateFarmInfo={updateFarmInfo}
                    selectedSupportedToken={selectedSupportedToken}
                    selectSupportedToken={selectSupportedToken}
                    nextHarvestDate={nextHarvestDate}
                    showBoostWithdrawalConfirmation={
                      showBoostWithdrawalConfirmation
                    }
                    startBoostWithdrawalConfirmation={
                      startBoostWithdrawalConfirmation
                    }
                    cancelBoostWithdrawalConfirmation={
                      cancelBoostWithdrawalConfirmation
                    }
                    losablePendingRewards={losablePendingRewards}
                  />
                </Tab>
              </Tabs>
            )}
            {!showBoostWithdrawalConfirmation && (
              <Box margin={{ top: '26px' }} justify="center" direction="row">
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
            )}
          </>
        </Modal>
        {walletAccountAtom && !showBoostFarmPresentation && (
          <Box gap="12px">
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
                            {selectedFarm?.rewards?.icons?.map((icon, i) => (
                              <TokenIcon
                                key={i}
                                label={icon}
                                style={i > 0 ? { marginLeft: '-0.6rem' } : {}}
                              />
                            ))}
                          </Box>
                        </>
                      )}
                    </Box>
                  </Heading>
                  <Box margin={{ bottom: '26px' }}>
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
                            ? '$' + toExactFixed(rewardsInfo.stableValue, 6)
                            : toExactFixed(rewardsInfo.value, 6)}
                        </Text>
                      </Box>
                    )}
                  </Box>
                  <Box gap="12px">
                    <Button
                      primary
                      label={
                        'Withdraw ' +
                        (seeRewardsAsStable
                          ? rewardsInfo.stableLabel
                          : rewardsInfo.label)
                      }
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
                showBoostWithdrawalConfirmation
                  ? {
                      color: '#F59F31',
                      size: '0.5px',
                    }
                  : isLightMode
                  ? { color: '#EBEBEB', size: '1px' }
                  : { size: '0px' }
              }
              style={
                showBoostWithdrawalConfirmation
                  ? {
                      boxShadow: '0px 0px 10px 0px #FF981133',
                    }
                  : {}
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
                  <Skeleton height="16px" />
                ) : (
                  <Box direction="row" justify="between">
                    <Text weight="bold" size="16px">
                      {rewardsInfo.stableLabel}
                    </Text>
                    <Text weight="bold" size="16px">
                      {'$' + toExactFixed(pendingRewardsInfo, 6)}
                    </Text>
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
          )}
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
