import { useMain } from 'app/common/state';
import { Layout } from 'app/modernUI/components';
import { Box, ResponsiveContext } from 'grommet';
import moment from 'moment';
import { useState } from 'react';
import { Filters } from './blocks/Filters';
import { FarmsBlock, HeadingText } from './components';

export const Main = () => {
  const {
    assetsInfo,
    filteredFarms,
    filteredBoostFarms,
    isLoading,
    viewType,
    tokenFilter,
    setTokenFilter,
    networkFilter,
    setNetworkFilter,
    sortBy,
    sortDirectionIsAsc,
    walletAccountAtom,
    typeFilter,
    setTypeFilter,
    possibleStableTokens,
    possibleNonStableTokens,
    possibleNetworks,
    possibleTypes,
    possibleViewTypes,
    setViewType,
  } = useMain();

  const [seeAllFixedFarmsDescription, setSeeAllFixedFarmsDescription] =
    useState<boolean>(false);
  const [seeAllBoostFarmsDescription, setSeeAllBoostFarmsDescription] =
    useState<boolean>(false);

  const confirmedVoteDay = moment('2022-11-28');

  let nextVoteDay = confirmedVoteDay.add(2, 'weeks');
  while (nextVoteDay < moment()) {
    nextVoteDay.add(2, 'weeks');
  }

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
                      walletAccountAtom={walletAccountAtom}
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
                      possibleViewTypes={possibleViewTypes}
                      viewType={viewType}
                      setViewType={setViewType}
                    />
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
                        onReadMore={() =>
                          setSeeAllFixedFarmsDescription(
                            !seeAllFixedFarmsDescription,
                          )
                        }
                        farms={filteredFarms}
                        viewType={viewType}
                        sortBy={sortBy}
                        sortDirectionIsAsc={sortDirectionIsAsc}
                        isLoading={isLoading}
                        size={size}
                        factsheetLink="https://docsend.com/view/26j9j8se4vrfu2wh"
                      />
                      <FarmsBlock
                        heading="Boost farms"
                        description={`Our Boost farms are multi-pool auto-compounding
                          strategies that give access to more complex
                          boosted yields.`}
                        readMoreDescription="Rates are variable, and depositors
                          earn CVX/ETH rewards, which can be claimed in
                          USDC. Rewards are harvested weekly."
                        readMoreStatus={seeAllBoostFarmsDescription}
                        onReadMore={() =>
                          setSeeAllBoostFarmsDescription(
                            !seeAllBoostFarmsDescription,
                          )
                        }
                        farms={filteredBoostFarms}
                        viewType={viewType}
                        sortBy={sortBy}
                        sortDirectionIsAsc={sortDirectionIsAsc}
                        isLoading={isLoading}
                        size={size}
                        factsheetLink="https://docsend.com/view/26j9j8se4vrfu2wh"
                      />
                    </Box>
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
