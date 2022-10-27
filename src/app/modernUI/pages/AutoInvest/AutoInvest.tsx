import { useAutoInvest } from 'app/common/state/autoInvest/useAutoInvest';
import { HeadingText, Layout, Spinner } from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import { Box, Button, Card, Grid, ResponsiveContext, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { StreamCard } from './components/StreamCard';

export const AutoInvest = () => {
  const { streams, isLoading, assetsInfo, walletAccountAtom } = useAutoInvest();

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
                    <Box direction="row" justify="between" align="center">
                      {' '}
                      <Text size="36px" weight="bold">
                        {streams?.length || 0} active streams
                      </Text>{' '}

                        <Link to={'/autoinvest/add'}>
                          <Button
                            label="Start new stream"
                            style={{ width: '170px' }}
                          />
                        </Link>

                    </Box>
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
                                    tvs={stream.tvs}
                                    flowPerMinute={stream.flowPerMinute}
                                    startDate={stream.startDate}
                                    fundedUntilDate={stream.fundedUntilDate}
                                  />
                                );
                              })}
                          </>
                        )}
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
    </Layout>
  );
};
