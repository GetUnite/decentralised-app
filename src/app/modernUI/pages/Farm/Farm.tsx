import { toExactFixed } from 'app/common/functions/utils';
import { walletAccount } from 'app/common/state/atoms';
import { useFarm } from 'app/common/state/farm';
import {
  Layout,
  Modal, Tab,
  Tabs
} from 'app/modernUI/components';
import { ResponsiveContext } from 'grommet';
import { useParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
  DepositForm,
  FarmWithdrawalTab
} from './blocks';

export const Farm = () => {
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
    losablePendingRewards,
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
            noHeading={!showTabs}
          >
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
