import { useMain } from 'app/common/state';
import { Layout, Spinner } from 'app/modernUI/components';
import { Box, Card, ResponsiveContext } from 'grommet';
import { useState } from 'react';
import { Filters } from './blocks/Filters';
import { FarmsBlock, HeadingText } from './components';

export const Main = () => {
  const {
    assetsInfo,
    filteredFarms,
    filteredBoostFarms,
    isLoading,
    showAllFarms,
    showYourFarms,
    viewType,
    tokenFilter,
    setTokenFilter,
    networkFilter,
    setNetworkFilter,
    walletAccountAtom,
    sortBy,
    sortDirectionIsAsc,
    nextVoteDay,
    typeFilter,
    setTypeFilter,
    possibleStableTokens,
    possibleNonStableTokens,
    possibleNetworks,
    possibleTypes,
  } = useMain();

  const [seeAllFixedFarmsDescription, setSeeAllFixedFarmsDescription] = useState<boolean>(false);
  const [seeAllBoostFarmsDescription, setSeeAllBoostFarmsDescription] = useState<boolean>(false);

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
                    <Filters
                      possibleTypes={possibleTypes}
                      typeFilter={typeFilter}
                      setTypeFilter={setTypeFilter}
                      possibleNetworks={possibleNetworks}
                      possibleNonStableTokens={possibleNonStableTokens}
                      possibleStableTokens={possibleStableTokens}
                      setTokenFilter={setTokenFilter}
                      setNetworkFilter={setNetworkFilter}
                      tokenFilter={tokenFilter}
                      networkFilter={networkFilter}
                    />
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
                          direction governance vote on ${nextVoteDay.format(
                            'Do MMMM',
                          )}.`}
                          readMoreDescription="Once
                            customer funds are deposited they start earning
                            yield immediately. In the background the protocol
                            creates the LP and stakes that in the relevant
                            farm."
                          readMoreStatus={seeAllFixedFarmsDescription}
                          onReadMore={() => setSeeAllFixedFarmsDescription(!seeAllFixedFarmsDescription)}
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
                          boosted yields.`}
                          readMoreDescription="Rates are variable, and depositers
                          earn CVX/ETH rewards, which can be claimed in
                          USDC. Rewards are harvested weekly."
                          readMoreStatus={seeAllBoostFarmsDescription}
                          onReadMore={() => setSeeAllBoostFarmsDescription(!seeAllBoostFarmsDescription)}
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
