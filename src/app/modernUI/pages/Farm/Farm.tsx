import { useFarm } from 'app/common/state/farm';
import {
  Layout,
  Modal, Tab,
  Tabs
} from 'app/modernUI/components';
import { ResponsiveContext } from 'grommet';
import { useParams } from 'react-router-dom';
import {
  DepositFormTab,
  FarmWithdrawalTab
} from './blocks';

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
                <DepositFormTab
                  selectedFarm={selectedFarm}
                  isLoading={isLoading}
                  updateFarmInfo={updateFarmInfo}
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
          </Modal>
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
