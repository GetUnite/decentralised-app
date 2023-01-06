import { useFarm } from 'app/common/state/farm';
import { Layout, Modal, Tab, Tabs } from 'app/modernUI/components';
import { Box, ResponsiveContext, Text } from 'grommet';
import { useParams } from 'react-router-dom';
import { FarmDepositTab, FarmWithdrawalTab } from './blocks';

export const Farm = () => {
  const { id } = useParams();

  const {
    selectedFarm,
    updateFarmInfo,
    isLoading,
    selectSupportedToken,
    selectedSupportedToken,
  } = useFarm({
    id,
  });

  return (
    <ResponsiveContext.Consumer>
      {_ => (
        <Layout>
          <Modal
            chain={selectedFarm?.chain}
            heading={selectedFarm?.name}
            showChainBadge={!isLoading}
          >
            <Tabs>
              <Tab title="Deposit">
                <FarmDepositTab
                  selectedFarm={selectedFarm}
                  isLoading={isLoading}
                  selectedSupportedToken={selectedSupportedToken}
                  selectSupportedToken={selectSupportedToken}
                />
              </Tab>
              <Tab title="Withdraw">
                <FarmWithdrawalTab
                  selectedFarm={selectedFarm}
                  isLoading={isLoading}
                  updateFarmInfo={updateFarmInfo}
                  selectedSupportedToken={selectedSupportedToken}
                  selectSupportedToken={selectSupportedToken}
                />
              </Tab>
            </Tabs>
            <Box margin={{ top: '26px' }} justify="center" direction='row'>
              <Text size="12px">
                Find out where these funds are being invested{' '}
                <a
                  target="_blank"
                  href="https://docsend.com/view/26j9j8se4vrfu2wh"
                  style={{
                    textDecoration: 'none',
                  }}
                >
                  here
                </a>
              </Text>
            </Box>
          </Modal>
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
