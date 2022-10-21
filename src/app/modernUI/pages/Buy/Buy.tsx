import { EChain } from 'app/common/constants/chains';
import { Layout, Modal, Tab, Tabs } from 'app/modernUI/components';
import { ResponsiveContext } from 'grommet';
import { BuyTab } from './blocks';
import { RampEmbed } from './components';

export const Buy = ({ ...rest }) => {
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Layout>
          <Modal chain={EChain.ETHEREUM} heading={'Buy $ALLUO'}>
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
