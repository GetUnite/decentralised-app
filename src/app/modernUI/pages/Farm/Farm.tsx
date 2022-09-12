import { walletAccount } from 'app/common/state/atoms';
import { useFarm } from 'app/common/state/farm';
import { Layout, Modal, Tab, Tabs } from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import {
  Avatar,
  Box,
  Button,
  Grid,
  Heading,
  ResponsiveContext,
  Text,
} from 'grommet';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { DepositForm, WithdrawalForm, BoosterFarmPresentation } from './blocks';
import { useCookies } from 'react-cookie';

export const Farm = () => {
  const { id } = useParams();
  const [cookies] = useCookies(['has_seen_boost_farms']);
  const [walletAccountAtom] =
    useRecoilState(walletAccount);
  const {
    selectedFarm,
    updateFarmInfo,
    isLoading,
    selectSupportedToken,
    selectedSupportedToken,
  } = useFarm({
    id,
  });

  const renderModal = size => {
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
          size={size}
          chain={selectedFarm?.chain}
          heading={farmName}
          isLoading={isLoading}
          noHeading={selectedFarm?.isBooster && !cookies.has_seen_boost_farms}
        >
          <>
            {selectedFarm?.isBooster && !cookies.has_seen_boost_farms ? (
              <BoosterFarmPresentation selectedFarm={selectedFarm} farmName={farmName} />
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
              overflow="auto"
              width="auto"
              align="start"
              justify="between"
              height="small"
              gap="small"
              direction="column"
              background="modal"
              margin={{ top: '12px' }}
              pad={{ vertical: 'medium', horizontal: 'medium' }}
            >
              <Box fill gap="small">
                <Heading size="small" level={3} margin="none" fill>
                  <Box direction="row" justify="between" fill >
                    <Text size='18px'>Rewards</Text>
                    <Box direction="row" gap="5px">
                      {selectedFarm?.rewards.map((reward, i) => (
                        <Avatar
                          key={i}
                          align="center"
                          src={reward.icon.src}
                          size="small"
                          justify="center"
                          overflow="hidden"
                          round="full"
                        />
                      ))}
                    </Box>
                  </Box>
                </Heading>
                <Box>
                  <Text>CRV</Text>
                  <Text>ETH</Text>
                </Box>
                <Box>
                  <Button
                    primary
                    label={'Withdraw rewards'}
                    style={{ borderRadius: '58px' }}
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
              {renderModal(size)}
            </Grid>
          ) : (
            <Grid rows={'auto'} gap="small">
              {renderModal(size)}
            </Grid>
          )}
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
