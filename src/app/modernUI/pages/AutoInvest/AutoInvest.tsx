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
import { useCookies } from 'react-cookie';
import { EChain } from 'app/common/constants/chains';
import { AutoInvestTab } from './blocks/AutoInvestTab';

export const AutoInvest = () => {
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Layout>
          <Modal
            size={size}
            chain={EChain.POLYGON}
            heading="Auto-Invest"
            isLoading={false}
          >
            <Tab title="Auto-Invest">
              <AutoInvestTab />
            </Tab>
          </Modal>
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
