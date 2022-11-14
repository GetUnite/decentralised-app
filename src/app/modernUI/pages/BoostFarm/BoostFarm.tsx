import { toExactFixed } from 'app/common/functions/utils';
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
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { BoostDepositTab, BoostFarmPresentation, BoostFarmWithdrawalTab } from './blocks';

export const BoostFarm = () => {
  const { id } = useParams();

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
    showBoosterFarmPresentation,
    showTabs,
    previousHarvestDate,
    nextHarvestDate,
    showBoosterWithdrawalConfirmation,
    startBoosterWithdrawalConfirmation,
    cancelBoosterWithdrawalConfirmation,
    pendingRewards,
    losablePendingRewards
  } = useBoostFarm({
    id,
  });

  const renderModal = () => {
    const farmName = (
      <span>
        {selectedFarm?.name}
        {selectedFarm?.isBooster && (
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
            {showBoosterFarmPresentation && (
              <BoostFarmPresentation
                selectedFarm={selectedFarm}
                farmName={farmName}
              />
            )}
            {showTabs && (
              <Tabs>
                <Tab title="Deposit">
                  <BoostDepositTab
                    selectedFarm={selectedFarm}
                    isLoading={isLoading}
                    updateFarmInfo={updateFarmInfo}
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
                    showBoosterWithdrawalConfirmation={
                      showBoosterWithdrawalConfirmation
                    }
                    startBoosterWithdrawalConfirmation={
                      startBoosterWithdrawalConfirmation
                    }
                    cancelBoosterWithdrawalConfirmation={
                      cancelBoosterWithdrawalConfirmation
                    }
                    losablePendingRewards={losablePendingRewards}
                  />
                </Tab>
              </Tabs>
            )}
          </>
        </Modal>
        {selectedFarm?.isBooster && showTabs && walletAccountAtom && (
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
              {isLoading || isClamingRewards || isLoadingRewards || !selectedSupportedToken? (
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
                    <Box direction="row" justify="between" fill>
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
                    </Box>
                  </Heading>
                  <Box
                    direction="row"
                    justify="between"
                    margin={{ bottom: '28px' }}
                  >
                    <Text weight="bold" size="16px">
                      {seeRewardsAsStable
                        ? selectedFarm?.rewards.stableLabel
                        : selectedFarm?.rewards.label}
                    </Text>
                    <Text weight="bold" size="16px">
                      {seeRewardsAsStable
                        ? '$' + selectedFarm?.rewards.stableValue
                        : selectedFarm?.rewards.value}
                    </Text>
                  </Box>
                  <Box gap="12px">
                    <Button
                      primary
                      label={
                        'Withdraw ' +
                        (seeRewardsAsStable
                          ? selectedFarm?.rewards.stableLabel
                          : selectedFarm?.rewards.label)
                      }
                      style={{ borderRadius: '58px', width: '197px' }}
                      onClick={claimRewards}
                    />
                    <Button
                      label={
                        seeRewardsAsStable
                          ? 'Prefer ' +
                            selectedFarm?.rewards.label +
                            ' LP tokens?'
                          : 'Prefer ' + selectedFarm?.rewards.stableLabel
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
              border={
                showBoosterWithdrawalConfirmation
                  ? {
                      color: '#F59F31',
                      size: '0.5px',
                    }
                  : { size: '0px' }
              }
              style={
                showBoosterWithdrawalConfirmation
                  ? {
                      boxShadow: '0px 0px 10px 0px #FF981133',
                    }
                  : {}
              }
            >
              {isLoading || isClamingRewards || isLoadingRewards || !selectedSupportedToken ? (
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
                      {selectedFarm?.rewards.stableLabel}
                    </Text>
                    <Text weight="bold" size="16px">
                      {'$' + toExactFixed(pendingRewards, 6)}
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