import { EChain } from 'app/common/constants/chains';
import { useStake } from 'app/common/state/stake';
import { Layout, Modal, Tab, Tabs } from 'app/modernUI/components';
import { ResponsiveContext } from 'grommet';
import { LockTab } from './blocks/LockTab';
import { UnlockTab } from './blocks/UnlockTab';

export const Stake = ({ ...rest }) => {
  const { isLoading, updateAlluoInfo, alluoInfo } = useStake();

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Layout>
          <Modal chain={EChain.ETHEREUM} heading={'Stake $ALLUO'}>
            <Tabs>
              <Tab title="Lock">
                <LockTab
                  isLoading={isLoading}
                  alluoInfo={alluoInfo}
                  updateAlluoInfo={updateAlluoInfo}
                />
              </Tab>
              <Tab title="Unlock and Withdraw">
                <UnlockTab
                  isLoading={isLoading}
                  alluoInfo={alluoInfo}
                  updateAlluoInfo={updateAlluoInfo}
                />
              </Tab>
            </Tabs>
          </Modal>
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
