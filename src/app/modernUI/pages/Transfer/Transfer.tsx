import { EChain } from 'app/common/constants/chains';
import { Layout, Modal, Tab } from 'app/modernUI/components';
import { ResponsiveContext } from 'grommet';
import { TransferTab } from './blocks/TransferTab';

export const Transfer = ({ ...rest }) => {
  return (
    <ResponsiveContext.Consumer>
      {_ => (
        <Layout>
          <Modal chain={EChain.POLYGON} heading={'Transfer Asset'}>
            <Tab title="Send">
              <TransferTab />
            </Tab>
          </Modal>
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
