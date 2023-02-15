import { fromLocaleString, toExactFixed } from 'app/common/functions/utils';
import { useMain } from 'app/common/state';
import { Layout } from 'app/modernUI/components';
import swap from 'app/modernUI/images/swap.svg';
import { Box, Button, ResponsiveContext, Text } from 'grommet';
import moment from 'moment';
import { useState } from 'react';
import { Filters } from './blocks/Filters';
import { FarmsBlock, HeadingText, RewardsBlock } from './components';

export const Main = () => {
  const {
    assetsInfo,
    filteredFarms,
    filteredBoostFarms,
    isLoading,
    viewType,
    tokenFilter,
    updateTokenFilter,
    networkFilter,
    updateNetworkFilter,
    sortBy,
    sortDirectionIsAsc,
    walletAccountAtom,
    typeFilter,
    updateTypeFilter,
    possibleStableTokens,
    possibleNonStableTokens,
    possibleNetworks,
    possibleTypes,
    possibleViewTypes,
    setViewType,
    totalDepositedAmountInUsd,
    isFarming,
    rewardsInfo,
    claimRewards,
  } = useMain();

  const [seeAllFixedFarmsDescription, setSeeAllFixedFarmsDescription] =
    useState<boolean>(false);
  const [seeAllBoostFarmsDescription, setSeeAllBoostFarmsDescription] =
    useState<boolean>(false);

  const [seeRewardsAsStable, setSeeRewardsAsStable] = useState<boolean>(false);

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
                  isFarming={isFarming}
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
                      updateTypeFilter={updateTypeFilter}
                      possibleNetworks={possibleNetworks}
                      possibleNonStableTokens={possibleNonStableTokens}
                      possibleStableTokens={possibleStableTokens}
                      updateTokenFilter={updateTokenFilter}
                      updateNetworkFilter={updateNetworkFilter}
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
                        factsheetLink="https://docsend.com/view/np9ypdn38jajb9zj"
                      />
                    </Box>
                    {viewType == 'View my farms only' && (
                      <>
                        <Box
                          fill="horizontal"
                          justify="start"
                          align="end"
                          height="75px"
                        >
                          <Text size="18px" margin={{ top: '15px' }}>
                            Total balance in farms: ${totalDepositedAmountInUsd}
                          </Text>
                        </Box>
                        {rewardsInfo.length > 0 && (
                          <>
                            <RewardsBlock
                              size={size}
                              heading="Rewards"
                              description={`Rewards for Boost pools are paid in auto-compounding CVX/ETH. The longer you leave your rewards unclaimed, the larger they’ll get. Claim all rewards earned across farms at once to save on gas costs.`}
                              rewardsInfo={rewardsInfo}
                              claimRewards={claimRewards}
                            />
                            <Box fill="horizontal" justify="start" align="end">
                              <Box direction="row" margin={{ top: '21px' }} justify="center" gap="4px">
                                <Text size="18px" >
                                  Total rewards across farms:{' '}
                                  {seeRewardsAsStable ? (
                                    <>{`$${toExactFixed(
                                      rewardsInfo.reduce(
                                        (previous, current) =>
                                          previous +
                                          fromLocaleString(current.stableValue),
                                        0,
                                      ),
                                      2,
                                    )}`}</>
                                  ) : (
                                    <>{`${toExactFixed(
                                      rewardsInfo.reduce(
                                        (previous, current) =>
                                          previous +
                                          fromLocaleString(current.value),
                                        0,
                                      ),
                                      8,
                                    )} CVX/ETH `}</>
                                  )}
                                </Text>
                                <Button
                                  onClick={() =>
                                    setSeeRewardsAsStable(!seeRewardsAsStable)
                                  }
                                >
                                  <Box justify="center" fill>
                                    <img src={swap} />
                                  </Box>
                                </Button>
                              </Box>
                            </Box>
                          </>
                        )}
                      </>
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
