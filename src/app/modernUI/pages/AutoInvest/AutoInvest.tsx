import { EChain } from 'app/common/constants/chains';
import { useAutoInvest } from 'app/common/state/autoInvest/useAutoInvest';
import {
  HeadingText,
  Layout,
  Modal,
  Spinner,
  Tab
} from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import {
  Box,
  Button,
  Card,
  Grid,
  Layer,
  ResponsiveContext,
  Text
} from 'grommet';
import Skeleton from 'react-loading-skeleton';
import { AutoInvestTab } from './blocks/AutoInvestTab';
import { StreamCard } from './components/StreamCard';

export const AutoInvest = () => {
  const {
    streams,
    setIsModalVisible,
    isModalVisible,
    isLoading,
    assetsInfo,
    walletAccountAtom,
  } = useAutoInvest();

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
              {walletAccountAtom ? (
                <>
                  {isLoading ? (
                    <Skeleton count={1} height="36px" />
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
                      <Box>
                        {console.log(streams)}
                        {streams.length < 1 ? (
                          <Card
                            pad={{ horizontal: 'medium', vertical: 'none' }}
                            height="xsmall"
                            background="card"
                            margin="none"
                            align="center"
                            justify="center"
                            fill="horizontal"
                          >
                            <span>You don't have any stream running</span>
                          </Card>
                        ) : (
                          <>
                            {Array.isArray(streams) &&
                              streams.map((stream, index) => {
                                return (
                                  <StreamCard
                                    key={index}
                                    from={stream.from}
                                    to={stream.to}
                                    flowPerMinute={stream.flowPerMinute}
                                    startDate={stream.startDate}
                                  />
                                );
                              })}
                          </>
                        )}
                        <Button
                          label="Start new stream"
                          onClick={() => setIsModalVisible(true)}
                          style={{ width: '170px' }}
                          margin={{ top: '18px' }}
                        />
                      </Box>
                    )}
                  </Box>
                </>
              ) : (
                <Text size="36px" weight="bold">
                  Connect your wallet to see active streams
                </Text>
              )}
            </Box>
          </Box>
        )}
      </ResponsiveContext.Consumer>
      {isModalVisible && (
        <Layer
          onEsc={() => setIsModalVisible(false)}
          onClickOutside={() => setIsModalVisible(false)}
        >
          <Modal
            chain={EChain.POLYGON}
            heading="Auto-Invest"
            isLoading={false}
            closeAction={() => setIsModalVisible(false)}
          >
            <Tab title="Auto-Invest">
              <AutoInvestTab />
            </Tab>
          </Modal>
        </Layer>
      )}
    </Layout>
  );
};
