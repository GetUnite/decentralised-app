import { fromLocaleString, toExactFixed } from 'app/common/functions/utils';
import { useMain } from 'app/common/state';
import { Layout } from 'app/modernUI/components';
import swap from 'app/modernUI/images/swap.svg';
import { Box, Button, ResponsiveContext, Text } from 'grommet';
import moment from 'moment';
import { useState } from 'react';
import { Filters } from './blocks/Filters';
import { FarmsBlock, HeadingText, RewardsBlock } from './components';
import Skeleton from 'react-loading-skeleton';

export const Main = () => {
  const {
    assetsInfo,
    filteredFarms,
    filteredBoostFarms,
    filteredOptimisedFarms,
    isLoading,
    isLoadingTotalAmountInUSD,
    isLoadingRewards,
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
    // claim all rewards
    claimAllRewards,
    isClaimingAllRewards,
    claimAllRewardsError,
  } = useMain();

  const [seeAllFixedFarmsDescription, setSeeAllFixedFarmsDescription] =
    useState<boolean>(false);
  const [seeAllBoostFarmsDescription, setSeeAllBoostFarmsDescription] =
    useState<boolean>(false);
  const [seeAllOptimisedFarmsDescription, setSeeAllOptimisedFarmsDescription] =
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
                      isLoading={isLoading}
                    />
                    <Box gap="60px">
                      <FarmsBlock
                        heading="Optimised farms"
                        description={`Maximize yield farming with Optimised Farms. Alluo's platform auto-manages Beefy and Yearn strategies, so you're always in the best pool for the chosen asset with minimum $1M liquidity,  a steady $0.99-$1.01 peg and 80%+ safety score. Choose your aggregator and asset, deposit funds, and let the protocol manage from there.`}
                        readMoreDescription="placeholder"
                        readMoreStatus={seeAllOptimisedFarmsDescription}
                        onReadMore={() =>
                          window.open("https://medium.com/@alastairpreacher/new-optimism-top-vaults-for-optimised-beefy-yearn-yield-farming-f0c3179449b8", "_blank")
                        }
                        farms={filteredOptimisedFarms}
                        viewType={viewType}
                        sortBy={sortBy}
                        sortDirectionIsAsc={sortDirectionIsAsc}
                        isLoading={isLoading}
                        size={size}
                        factsheetLink="https://docsend.com/view/np9ypdn38jajb9zj"
                      />
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
                          {isLoadingRewards ? (
                            <Skeleton
                              height="23px"
                              width="230px"
                              borderRadius="20px"
                            />
                          ) : (
                            <Text size="16px" margin={{ top: '15px' }}>
                              Total balance in farms: $
                              {totalDepositedAmountInUsd}
                            </Text>
                          )}
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
                              <Box
                                direction="row"
                                gap="20px"
                                margin={{ top: '21px' }}
                              >
                                <Box
                                  direction="row"
                                  justify="center"
                                  align="center"
                                  gap="4px"
                                >
                                  <Text size="16px">
                                    Total rewards across farms:{' '}
                                    {seeRewardsAsStable ? (
                                      <>{`$${toExactFixed(
                                        rewardsInfo.reduce(
                                          (previous, current) =>
                                            previous +
                                            fromLocaleString(
                                              current.stableValue,
                                            ),
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
                                <Button
                                  primary
                                  label={
                                    isClaimingAllRewards
                                      ? 'Claiming rewards'
                                      : 'Claim all rewards'
                                  }
                                  disabled={isClaimingAllRewards}
                                  onClick={claimAllRewards}
                                />
                              </Box>
                              {claimAllRewardsError && (
                                <Text color="error" size="small">
                                  {claimAllRewardsError}
                                </Text>
                              )}
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
