import { EChain } from 'app/common/functions/Web3Client';
import { Layout, Modal, Tab, Tabs } from 'app/modernUI/components';
import { ResponsiveContext } from 'grommet';
import { RampEmbed } from './components';
import { BuyTab } from './partials';

export const Buy = ({ ...rest }) => {
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Layout>
          <Modal size={size} chain={EChain.ETHEREUM} heading={'Buy $ALLUO'}>
            <Tabs>
              <Tab title="$ALLUO">
                <BuyTab />
              </Tab>
              <Tab title="OnRamp">
                <RampEmbed />
              </Tab>
            </Tabs>
          </Modal>
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
