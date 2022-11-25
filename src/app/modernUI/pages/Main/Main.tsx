import { EChain } from 'app/common/constants/chains';
import { useMain } from 'app/common/state';
import { Layout, SortIcon, Spinner } from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import {
  Box,
  Button,
  Card,
  Grid,
  Heading,
  ResponsiveContext,
  Text
} from 'grommet';
import { FarmCard, Filter, HeadingText } from './components';

export const Main = () => {
  const {
    assetsInfo,
    filteredFarms,
    isLoading,
    showAllFarms,
    showYourFarms,
    viewType,
    allSupportedTokens,
    tokenFilter,
    setTokenFilter,
    networkFilter,
    setNetworkFilter,
    walletAccountAtom,
    sortBy,
    sortDirectionIsAsc,
  } = useMain();

  return (
    <Layout>
      <ResponsiveContext.Consumer>
        {size => (
          <>
            <Box
              align="center"
              justify="start"
              gap="none"
              pad="xsmall"
              margin={{ top: 'small' }}
              direction="column"
              fill="horizontal"
            >
              <Box justify="center" fill direction="column">
                <HeadingText
                  isLoading={isLoading}
                  numberOfAssets={assetsInfo?.numberOfAssets}
                  numberOfChainsWithAssets={
                    assetsInfo?.numberOfChainsWithAssets
                  }
                />
                <Box
                  align="center"
                  justify="center"
                  fill="horizontal"
                  direction="column"
                >
                  <Box
                    gap="6px"
                    direction="column"
                    fill
                    margin={{ top: '72px' }}
                  >
                    <Box direction="row" justify="between">
                      <Box
                        direction="row"
                        justify="start"
                        gap="20px"
                        style={{ fontSize: '16px' }}
                      >
                        <Button
                          size="small"
                          onClick={showAllFarms}
                          label="All farms"
                          plain
                          style={
                            !viewType ? { textDecoration: 'underline' } : {}
                          }
                        />
                        {walletAccountAtom && !isLoading && (
                          <Button
                            size="small"
                            onClick={showYourFarms}
                            label="Your farms"
                            plain
                            style={
                              viewType == 'your'
                                ? { textDecoration: 'underline' }
                                : {}
                            }
                          />
                        )}
                      </Box>
                      <Box
                        direction="row"
                        justify="start"
                        gap="20px"
                        style={{ fontSize: '16px' }}
                      >
                        <Filter
                          style={{ width: '80px', padding: 0 }}
                          plain
                          options={['All Tokens', ...allSupportedTokens]}
                          value={tokenFilter ? tokenFilter : 'All Tokens'}
                          onChange={({ option }) =>
                            setTokenFilter(
                              option === 'All Tokens' ? null : option,
                            )
                          }
                        />
                        <Filter
                          style={{ width: '100px', padding: 0 }}
                          plain
                          options={['All Networks', 'Ethereum', 'Polygon']}
                          value={networkFilter ? networkFilter : 'All Networks'}
                          onChange={({ option }) =>
                            setNetworkFilter(
                              option === 'All Networks' ? null : option,
                            )
                          }
                        />
                      </Box>
                    </Box>
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
                      <Box gap="20px" background="card" round="8px">
                        <Box pad={{ horizontal: 'medium', bottom: '23px', top:'43px' }}>
                          <Heading size="24px">Fixed-rate farms</Heading>
                          <Text size="16px">
                            Our fixed-rate farms have a guaranteed rate of
                            return for 2 weeks until our next liquidity
                            direction governance vote on "date here". Once
                            customer funds are deposited they start earning
                            yield immediately. In the background the protocol
                            creates the LP and stakes that in the relevant farm.
                            Read less
                          </Text>
                        </Box>
                        <Box>
                          {!isSmall(size) && (
                            <Card
                              pad={{ horizontal: 'medium', vertical: 'none' }}
                              height="65px"
                              margin="none"
                              align="center"
                              justify="center"
                              fill="horizontal"
                            >
                              <Grid
                                fill="horizontal"
                                rows="xxsmall"
                                align="center"
                                columns={['270px', '200px', '155px', '155px', '105px', 'auto']}
                                pad="none"
                                style={{ fontSize: '16px' }}
                              >
                                {viewType != 'your' ? (
                                  <>
                                    <span>asset</span>
                                    <span>supported tokens</span>
                                    <span>network</span>
                                    <span>TVL</span>
                                    <Box gap="4px" direction="row">
                                      <span>APY</span>
                                      <SortIcon
                                        onClick={() =>
                                          sortBy('apy', !sortDirectionIsAsc)
                                        }
                                        isAsc={sortDirectionIsAsc}
                                      />
                                    </Box>
                                    <span></span>
                                  </>
                                ) : (
                                  <>
                                    <span>asset</span>
                                    <span>network</span>
                                    <Box gap="4px" direction="row">
                                      <span>pool share</span>
                                      <SortIcon
                                        onClick={() =>
                                          sortBy(
                                            'pool share',
                                            !sortDirectionIsAsc,
                                          )
                                        }
                                        isAsc={sortDirectionIsAsc}
                                      />
                                    </Box>
                                    <span>TVL</span>
                                    <Box gap="4px" direction="row">
                                      <span>balance</span>
                                      <SortIcon
                                        onClick={() =>
                                          sortBy('balance', !sortDirectionIsAsc)
                                        }
                                        isAsc={sortDirectionIsAsc}
                                      />
                                    </Box>
                                    <Box gap="4px" direction="row">
                                      <span>APY</span>
                                      <SortIcon
                                        onClick={() =>
                                          sortBy('apy', !sortDirectionIsAsc)
                                        }
                                        isAsc={sortDirectionIsAsc}
                                      />
                                    </Box>
                                    <span></span>
                                  </>
                                )}
                              </Grid>
                            </Card>
                          )}
                          <Box>
                            {Array.isArray(filteredFarms) &&
                              filteredFarms.map(farm => {
                                return (
                                  <FarmCard
                                    id={farm.id}
                                    key={farm.id}
                                    type={farm.type}
                                    name={farm.name}
                                    totalAssetSupply={farm.totalAssetSupply}
                                    poolShare={farm.poolShare}
                                    balance={farm.depositedAmount}
                                    interest={farm.interest}
                                    disabled={false}
                                    sign={farm.sign}
                                    icons={farm.icons}
                                    isLoading={isLoading}
                                    chain={farm.chain as EChain}
                                    isBooster={farm.isBooster}
                                    viewType={viewType}
                                  />
                                );
                              })}
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </ResponsiveContext.Consumer>
    </Layout>
  );
};
