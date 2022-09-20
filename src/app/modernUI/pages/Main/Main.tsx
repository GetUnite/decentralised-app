import { useRecoilState } from 'recoil';
import {
  Box,
  Heading,
  Paragraph,
  Button,
  Card,
  Grid,
  ResponsiveContext,
  Select,
  Menu,
  Text,
} from 'grommet';
import Skeleton from 'react-loading-skeleton';
import { isSmall } from 'app/modernUI/theme';
import { useMain } from 'app/common/state/shortcuts';
import { Spinner, Layout } from 'app/modernUI/components';
import { Assets } from './blocks';
import { walletAccount } from 'app/common/state/atoms';
import { Filter } from './components';

export const Main = () => {
  const [walletAccountAtom] = useRecoilState(walletAccount);

  const {
    headingData,
    availableFarms,
    isLoading,
    showAllFarms,
    showYourFarms,
    viewType,
    allSupportedTokens,
    tokenFilter,
    setTokenFilter,
    networkFilter,
    setNetworkFilter,
  } = useMain();

  const headingText = isLoading ? (
    <Box fill>
      <Skeleton count={2} />
    </Box>
  ) : (
    <>
      {headingData.numberOfAssets == 0 ? (
        'You don’t have available assets to farm in your wallet.'
      ) : (
        <span>
          You have {headingData.numberOfAssets}{' '}
          {headingData.numberOfAssets > 1 ? 'assets' : 'asset'} across{' '}
          {headingData.numberOfChainsWithAssets}{' '}
          {headingData.numberOfChainsWithAssets > 1 ? 'networks' : 'network'}{' '}
          available to farm.
        </span>
      )}
    </>
  );

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
                <Text size="36px" weight="bold">
                  {!walletAccountAtom
                    ? 'Connect your wallet to see your available assets to farm.'
                    : headingText}
                </Text>
                <Paragraph margin={{ top: '35px' }} fill>
                  Fund your wallet using crypto or fiat currency here to start
                  investing. Get your yield in the same coin and withdraw at any
                  time with no cost and no lock-in period.{' '}
                </Paragraph>
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
                        gap="small"
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
                        {walletAccountAtom && (
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
                        gap="medium"
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
                    {!isSmall(size) && (
                      <Card
                        pad={{ horizontal: 'medium', vertical: 'none' }}
                        height="65px"
                        background="card"
                        margin="none"
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
                          <span>asset</span>
                          <span>supported tokens</span>
                          <span>network</span>
                          <span>TVL</span>
                          <span>APY</span>
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
                      <>
                        <Assets
                          availableFarms={availableFarms}
                          isLoading={isLoading}
                        />
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
