import { EChain } from 'app/common/constants/chains';
import { Layout, Modal, Tab } from 'app/modernUI/components';
import { ResponsiveContext } from 'grommet';
import { useNavigate } from 'react-router-dom';
import { AutoInvestTab } from './blocks/AutoInvestTab';

export const AddStream = () => {
  const navigate = useNavigate();
  const closeModal = () => {
    navigate('/auto-invest');
  };

  return (
    <ResponsiveContext.Consumer>
      {_ => (
        <Layout>
          <Modal
            chain={EChain.POLYGON}
            heading="Auto-Invest"
            isLoading={false}
            closeAction={closeModal}
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
