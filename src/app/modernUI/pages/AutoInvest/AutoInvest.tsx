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

export const Farm = () => {
  const { id } = useParams();
  const [cookies] = useCookies(['has_seen_boost_farms']);
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const {
    selectedFarm,
    updateFarmInfo,
    isLoading,
    selectSupportedToken,
    selectedSupportedToken,
    stableRewards,
    setStableRewards,
    claimRewards,
  } = useFarm({
    id,
  });

  const renderModal = size => {
    const farmName = (
      <span>
        {selectedFarm?.name}
        {selectedFarm?.isBooster && (
          <span style={{ color: '#1C1CFF' }}> BOOST</span>
        )}
      </span>
    );
    return (
      <>
        <Modal
          size={size}
          chain={selectedFarm?.chain}
          heading={farmName}
          isLoading={isLoading}
          noHeading={selectedFarm?.isBooster && !cookies.has_seen_boost_farms}
        >
          <>
            <Tabs>
              <Tab title="Deposit">
                
              </Tab>
              <Tab title="Withdraw">
                
              </Tab>
            </Tabs>
          </>
        </Modal>
      </>
    );
  };

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Layout>
          {!isSmall(size) ? (
            <Grid columns={['flex', 'auto', 'flex']} gap="small">
              {renderModal(size)}
            </Grid>
          ) : (
            <Grid rows={'auto'} gap="small">
              {renderModal(size)}
            </Grid>
          )}
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
