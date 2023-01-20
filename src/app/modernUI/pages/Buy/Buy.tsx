import { EChain } from 'app/common/constants/chains';
import { Layout, Modal, Tab, Tabs } from 'app/modernUI/components';
import { ResponsiveContext } from 'grommet';
import { useState } from 'react';
import { BuyTab } from './blocks';
import { RampEmbed } from './components';

export const Buy = ({ ...rest }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Layout>
          <Modal chain={EChain.ETHEREUM} heading={'Buy $ALLUO'}>
            <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab}>
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
