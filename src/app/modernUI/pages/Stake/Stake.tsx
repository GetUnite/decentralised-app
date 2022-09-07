import { EChain } from 'app/common/functions/Web3Client';
import { Layout, Modal, Tab, Tabs } from 'app/modernUI/components';
import { ResponsiveContext } from 'grommet';
import { LockTab } from './blocks/LockTab';
import { UnlockTab } from './blocks/UnlockTab';

export const Stake = ({ ...rest }) => {
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Layout>
          <Modal size={size} chain={EChain.ETHEREUM} heading={'Stake $ALLUO'}>
            <Tabs>
              <Tab title="Lock">
                <LockTab />
              </Tab>
              <Tab title="Unlock and Withdraw">
                <UnlockTab />
              </Tab>
            </Tabs>
          </Modal>
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
