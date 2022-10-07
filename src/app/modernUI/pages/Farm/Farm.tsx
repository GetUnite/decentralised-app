import { walletAccount } from 'app/common/state/atoms';
import { useFarm } from 'app/common/state/farm';
import { Layout, Modal, Tab, Tabs, TokenIcon } from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import {
  Box,
  Button,
  Grid,
  Heading,
  ResponsiveContext,
  Text
} from 'grommet';
import { useCookies } from 'react-cookie';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { BoosterFarmPresentation, DepositForm, WithdrawalForm } from './blocks';

export const Farm = () => {
  const { id } = useParams();
  const [cookies] = useCookies(['has_seen_boost_farms']);
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const {
    selectedFarm,
    updateFarmInfo,
    isLoading,
    selectSupportedToken,
    selectedSupportedToken,
    stableRewards,
    setStableRewards,
    claimRewards,
  } = useFarm({
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
          noHeading={selectedFarm?.isBooster && !cookies.has_seen_boost_farms}
        >
          <>
            {selectedFarm?.isBooster && !cookies.has_seen_boost_farms ? (
              <BoosterFarmPresentation
                selectedFarm={selectedFarm}
                farmName={farmName}
              />
            ) : (
              <Tabs>
                <Tab title="Deposit">
                  <DepositForm
                    selectedFarm={selectedFarm}
                    isLoading={isLoading}
                    updateFarmInfo={updateFarmInfo}
                    selectedSupportedToken={selectedSupportedToken}
                    selectSupportedToken={selectSupportedToken}
                  />
                </Tab>
                <Tab title="Withdraw">
                  <WithdrawalForm
                    selectedFarm={selectedFarm}
                    isLoading={isLoading}
                    updateFarmInfo={updateFarmInfo}
                    selectedSupportedToken={selectedSupportedToken}
                    selectSupportedToken={selectSupportedToken}
                  />
                </Tab>
              </Tabs>
            )}
          </>
        </Modal>
        {selectedFarm?.isBooster &&
          walletAccountAtom &&
          cookies.has_seen_boost_farms && (
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
              margin={{ top: '12px' }}
              pad={{ vertical: 'medium', horizontal: 'medium' }}
            >
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
                          margin={{ left: i > 0 ? '-0.6rem' : '' }}
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
                    {stableRewards
                      ? selectedFarm?.rewards.stableLabel
                      : selectedFarm?.rewards.label}
                  </Text>
                  <Text weight="bold" size="16px">
                    {stableRewards
                      ? '$' + selectedFarm?.rewards.stableValue
                      : selectedFarm?.rewards.value}
                  </Text>
                </Box>
                <Box gap="12px">
                  <Button
                    primary
                    label={
                      'Withdraw ' +
                      (stableRewards
                        ? selectedFarm?.rewards.stableLabel
                        : selectedFarm?.rewards.label)
                    }
                    style={{ borderRadius: '58px', width: '197px' }}
                    onClick={claimRewards}
                  />
                  <Button
                    label={
                      stableRewards
                        ? 'Prefer ' +
                          selectedFarm?.rewards.label +
                          ' LP tokens?'
                        : 'Prefer ' + selectedFarm?.rewards.stableLabel
                    }
                    onClick={() => setStableRewards(!stableRewards)}
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
