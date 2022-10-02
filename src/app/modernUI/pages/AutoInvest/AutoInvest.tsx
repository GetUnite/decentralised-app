import { HeadingText, Layout, Modal, Tab, Tabs } from 'app/modernUI/components';
import { Box, Card, Grid, ResponsiveContext, Spinner, Text } from 'grommet';
import { EChain } from 'app/common/constants/chains';
import { AutoInvestTab } from './blocks/AutoInvestTab';
import { useAutoInvest } from 'app/common/state/autoInvest/useAutoInvest';
import Skeleton from 'react-loading-skeleton';
import { isSmall } from 'app/modernUI/theme';

const renderModal = size => {
  <Modal
    size={size}
    chain={EChain.POLYGON}
    heading="Auto-Invest"
    isLoading={false}
  >
    <Tab title="Auto-Invest">
      <AutoInvestTab />
    </Tab>
  </Modal>;
};

export const AutoInvest = () => {
  const { streams, setIsModalToggled, isModalToggled, isLoading, assetsInfo } =
    useAutoInvest();

  return (
    <Layout>
      <ResponsiveContext.Consumer>
        {size => (
          <Box justify="center" fill direction="column">
            <HeadingText
              isLoading={isLoading}
              numberOfAssets={assetsInfo?.numberOfAssets}
              numberOfChainsWithAssets={assetsInfo?.numberOfChainsWithAssets}
            />
            <Box margin={{ top: '72px' }}>
              {isLoading ? (
                <Skeleton count={1} />
              ) : (
                <Text size="36px" weight="bold">
                  {0} active streams
                </Text>
              )}
              <Box margin={{ top: '36px' }} gap="6px">
                {!isSmall(size) && (
                  <Card
                    pad={{ horizontal: 'medium', vertical: 'none' }}
                    height="65px"
                    background="card"
                    align="center"
                    justify="center"
                    fill="horizontal"
                    margin={{ top: '36px' }}
                  >
                    <Grid
                      fill="horizontal"
                      rows="xxsmall"
                      align="center"
                      columns={{ size: 'xsmall', count: 'fit' }}
                      pad="none"
                      style={{ fontSize: '16px' }}
                    >
                      <>
                        <span>streams from</span>
                        <span>streams to</span>
                        <span>TVS</span>
                        <span>flow rate</span>
                        <span>start</span>
                        <span>end</span>
                        <span>funded until</span>
                      </>
                    </Grid>
                  </Card>
                )}
                {isLoading ? (
                  <Card
                    pad={{ horizontal: 'medium', vertical: 'none' }}
                    height="xsmall"
                    background="card"
                    margin="none"
                    align="center"
                    justify="center"
                    fill="horizontal"
                  >
                    <Spinner pad="medium" />
                  </Card>
                ) : (
                  <></>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </ResponsiveContext.Consumer>
    </Layout>
  );
};
