import { useRecoilState } from 'recoil';
import {
  Page,
  PageContent,
  Box,
  Heading,
  Paragraph,
  Select,
  Menu,
  Text,
  Button,
  Card,
  Grid,
  Image,
  Avatar,
  ResponsiveContext,
} from 'grommet';
import Skeleton from 'react-loading-skeleton';

import { toExactFixed } from 'app/common/functions/utils';
import { isSmall } from 'app/modernUI/theme';
import { useMain } from 'app/common/state/shortcuts';

import { Spinner, Layout } from 'app/modernUI/components';
import { Assets } from './blocks';

import { walletAccount } from 'app/common/state/atoms';

export const Main = () => {
  const [walletAccountAtom, setWalletAccountAtom] =
    useRecoilState(walletAccount);

  const { stablesBalances, availableFarms, isLoading, filterToOwnFarms, resetFilters } =
    useMain();

  const filteredBalances = stablesBalances.filter(
    stablesBalance => stablesBalance.balance > 0.01,
  );
  const filteredBalancesText = filteredBalances.map(stablesBalance => {
    return `${stablesBalance.sign}${(+toExactFixed(
      stablesBalance.balance,
      2,
    )).toLocaleString()} available in ${stablesBalance.type}`;
  });
  const last = filteredBalancesText.pop();
  const result = filteredBalancesText.join(', ') + ' and ' + last;

  const totalBalances = isLoading ? (
    <Box fill>
      <Skeleton count={2} />
    </Box>
  ) : (
    <>
      {filteredBalances.length < 1 ? (
        'You don’t have available assets to farm in your wallet.'
      ) : (
        <span>You have {result}</span>
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
                <Heading margin="none" fill size={'32px'}>
                  {!walletAccountAtom
                    ? 'Connect your wallet to see your available assets to farm.'
                    : totalBalances}
                </Heading>
                <Paragraph margin={{ top: 'medium' }} fill>
                  Fund your wallet using stablecoin or fiat currency here to
                  start investing. Get your yield in the same coin and withdraw
                  at any time with no cost and no lock-in period.{' '}
                </Paragraph>
                <Box
                  align="center"
                  justify="center"
                  fill="horizontal"
                  direction="column"
                >
                  <Box
                    gap="small"
                    direction="column"
                    fill
                    margin={{ top: 'large' }}
                  >
                    <Box direction="row" justify="start" gap="small">
                      <Button size="small" onClick={resetFilters} label="All forms" plain/>
                      <Button size="small" onClick={filterToOwnFarms} label="Own forms" plain/>
                    </Box>
                    {!isSmall(size) && (
                      <Card
                        pad={{ horizontal: 'medium', vertical: 'none' }}
                        height="xxsmall"
                        background="card"
                        margin="none"
                        align="center"
                        justify="center"
                        fill="horizontal"
                      >
                        <Grid
                          fill
                          rows="xxsmall"
                          align="center"
                          columns={{ size: 'xsmall', count: 'fit' }}
                          pad="none"
                        >
                          <Text>asset</Text>
                          <Text>supported tokens</Text>
                          <Text>network</Text>
                          <Text>TVL</Text>

                          <Text>APY</Text>
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
            <Box pad="large" />
          </>
        )}
      </ResponsiveContext.Consumer>
    </Layout>
  );
};
