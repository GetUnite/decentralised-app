import { useMode } from 'app/common/state';
import { useAutoInvest } from 'app/common/state/autoInvest/useAutoInvest';
import {
  ConnectionButton,
  Layout,
  Spinner,
  Tooltip
} from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import { Box, Button, Card, Grid, ResponsiveContext, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { HeadingText } from './components';
import { StreamCard } from './components/StreamCard';

export const AutoInvest = () => {
  const {
    streams,
    isLoading,
    assetsInfo,
    walletAccountAtom,
    fundedUntilByStreamOptions,
    isStoppingStream,
    handleStopStream,
    canStartStreams,
  } = useAutoInvest();

  const { isLightMode } = useMode();

  const dividerColor = isLightMode ? '#EBEBEB' : '#999999';

  return (
    <Layout>
      <ResponsiveContext.Consumer>
        {size => (
          <Box
            align="center"
            justify="start"
            gap="none"
            direction="column"
            fill="horizontal"
          >
            <Box justify="center" fill direction="column">
              <HeadingText
                isLoading={isLoading}
                numberOfAssets={assetsInfo?.numberOfAssets}
                numberOfChainsWithAssets={assetsInfo?.numberOfChainsWithAssets}
                hasStreams={streams.length > 0}
                canStartStreams={canStartStreams}
              />
              <Box margin={{ top: '72px' }}>
                <>
                  {walletAccountAtom && isLoading ? (
                    <Skeleton count={1} height="45px" borderRadius="20px"/>
                  ) : (
                    <Box direction="row" justify="between" align="center">
                      <Text size="24px" weight={700}>
                        Active Streams
                      </Text>
                      {walletAccountAtom && canStartStreams && (
                        <Link to={'/autoinvest/add'}>
                          <Button
                            label="Start new stream"
                            style={{ width: '170px' }}
                          />
                        </Link>
                      )}
                    </Box>
                  )}
                  <Box
                    margin={{ top: '36px' }}
                    pad={{bottom: "20px"}}
                    background="card"
                    round="16px"
                    style={{ boxShadow: '0px -1px 4px #CCCCCC' }}
                  >
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
                            <Box direction="row">
                              <Tooltip text="total value streamed">
                              <span>TVS</span>
                              </Tooltip>
                            </Box>
                            <span>flow rate</span>
                            <span>start</span>
                            <span>end</span>
                            <span>funded until</span>
                          </>
                        </Grid>
                      </Card>
                    )}
                    {isLoading && walletAccountAtom ? (
                      <Box
                        pad={{ horizontal: 'medium' }}
                        background="card"
                        margin="none"
                        align="center"
                        justify="center"
                        fill="horizontal"
                        height="120px"
                        style={{ borderTop: `0.5px solid ${dividerColor}` }}
                      >
                        <Spinner pad="medium" />
                      </Box>
                    ) : (
                      <>
                        {walletAccountAtom ? (
                          <Box>
                            {streams.length < 1 ? (
                              <Box
                                pad={{ horizontal: 'medium', vertical: '40px' }}
                                background="card"
                                margin="none"
                                align="center"
                                justify="center"
                                fill="horizontal"
                                height="120px"
                                style={{
                                  borderTop: `0.5px solid ${dividerColor}`,
                                }}
                              >
                                <span>You don't have any stream running</span>
                              </Box>
                            ) : (
                              <>
                                {Array.isArray(streams) &&
                                  streams.map((stream, index) => {
                                    return (
                                      <StreamCard
                                        key={index}
                                        from={stream.from}
                                        fromAddress={stream.fromAddress}
                                        to={stream.to}
                                        toAddress={stream.toAddress}
                                        tvs={stream.tvs}
                                        flowPerMonth={stream.flowPerMonth}
                                        startDate={stream.startDate}
                                        endDate={stream.endDate}
                                        fundedUntilDate={
                                          fundedUntilByStreamOptions.find(
                                            fundedUntilByStreamOption =>
                                              fundedUntilByStreamOption.from ==
                                              stream.from,
                                          ).fundedUntilDate
                                        }
                                        sign={stream.sign}
                                        handleStopStream={handleStopStream}
                                        isStoppingStream={isStoppingStream}
                                      />
                                    );
                                  })}
                              </>
                            )}
                          </Box>
                        ) : (
                          <Box
                            pad={{ horizontal: 'medium', vertical: '40px' }}
                            margin="none"
                            align="center"
                            justify="center"
                            gap="24px"
                            fill="horizontal"
                            style={{ borderTop: `0.5px solid ${dividerColor}` }}
                          >
                            <Text>
                              Connect your wallet to see active streams
                            </Text>
                            <ConnectionButton />
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                </>
              </Box>
            </Box>
          </Box>
        )}
      </ResponsiveContext.Consumer>
    </Layout>
  );
};
