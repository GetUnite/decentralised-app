import { useMain } from 'app/common/state';
import { Layout, Spinner } from 'app/modernUI/components';
import {
  Box,
  Button,
  Card, ResponsiveContext
} from 'grommet';
import { FarmsBlock, Filter, HeadingText } from './components';

export const Main = () => {
  const {
    assetsInfo,
    filteredFarms,
    filteredBoostFarms,
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
                      <Box gap="60px">
                        <FarmsBlock
                          heading="Fixed-rate farms"
                          description={`Our fixed-rate farms have a guaranteed rate of
                          return for 2 weeks until our next liquidity
                          direction governance vote on "date here". Once
                          customer funds are deposited they start earning
                          yield immediately. In the background the protocol
                          creates the LP and stakes that in the relevant
                          farm. Read less`}
                          farms={filteredFarms}
                          viewType={viewType}
                          sortBy={sortBy}
                          sortDirectionIsAsc={sortDirectionIsAsc}
                          isLoading={isLoading}
                          size={size}
                        />
                        <FarmsBlock
                          heading="Boost farms"
                          description={`Our Boost farms are multi-pool auto-compounding
                          strategies that give access to more complex
                          boosted yields. Rates are variable, and depositers
                          earn CVX/ETH rewards, which can be claimed in
                          USDC. Rewards are harvested weekly. Read less`}
                          farms={filteredBoostFarms}
                          viewType={viewType}
                          sortBy={sortBy}
                          sortDirectionIsAsc={sortDirectionIsAsc}
                          isLoading={isLoading}
                          size={size}
                        />
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
