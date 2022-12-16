import { EChain } from 'app/common/constants/chains';
import { useMode } from 'app/common/state';
import { SortIcon, Tooltip } from 'app/modernUI/components';
import { colors, isSmall } from 'app/modernUI/theme';
import { Box, Button, Card, Grid, Heading, Text } from 'grommet';
import { DocumentText } from 'grommet-icons';
import { FarmCard } from './FarmCard';

export const FarmsBlock = ({
  size,
  heading,
  description,
  viewType,
  sortDirectionIsAsc,
  sortBy,
  isLoading,
  farms,
  readMoreDescription = null,
  readMoreStatus = false,
  onReadMore = null,
  factsheetLink,
}) => {
  const { isLightMode } = useMode();

  return (
    <Box
      gap="20px"
      background="card"
      round="8px"
      pad={{ bottom: '20px' }}
      style={{ boxShadow: '0px -1px 4px #CCCCCC' }}
    >
      <Box
        pad={{
          horizontal: '34px',
          bottom: '23px',
          top: '27px',
        }}
      >
        <Heading size="24px">{heading}</Heading>
        <Text size="16px">
          {description}{' '}
          {readMoreDescription && readMoreStatus && (
            <Text size="16px">{readMoreDescription} </Text>
          )}
          {readMoreDescription && (
            <Button plain onClick={onReadMore}>
              <Text
                size="16px"
                style={{ textDecoration: 'underline' }}
                color={colors.BLUE}
              >
                {readMoreStatus ? 'Read less' : 'Read more'}
              </Text>
            </Button>
          )}
        </Text>
        {readMoreStatus && (
          <Box direction="row" gap="4px" align='center' margin={{top: '10px'}}>
            <DocumentText size='16px'/>
            <a
              target="_blank"
              href={factsheetLink}
              style={{
                color: isLightMode ? 'black' : 'white',
                fontSize: '16px',
              }}
            >
              View {heading.toLowerCase()} farms fact sheet
            </a>
          </Box>
        )}
      </Box>
      <Box>
        {!isSmall(size) && (
          <Card
            pad={{ horizontal: '34px', vertical: 'none' }}
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
              columns={
                viewType != 'View my farms only'
                  ? ['250px', '200px', '155px', '155px', '105px', 'auto']
                  : [
                      '240px',
                      '155px',
                      '155px',
                      '155px',
                      '145px',
                      '105px',
                      'auto',
                    ]
              }
              pad="none"
              style={{ fontSize: '16px' }}
            >
              {viewType != 'View my farms only' ? (
                <>
                  <span>asset</span>
                  <span>supported tokens</span>
                  <span>network</span>
                  <span>TVL</span>
                  <Box gap="4px" direction="row">
                    <Tooltip text="Annual percentage yield is the real rate of return earned on your deposit, taking into account the effect of compounding">
                      <span>APY</span>
                    </Tooltip>
                    <SortIcon
                      onClick={() => sortBy('apy', !sortDirectionIsAsc)}
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
                      onClick={() => sortBy('pool share', !sortDirectionIsAsc)}
                      isAsc={sortDirectionIsAsc}
                    />
                  </Box>
                  <span>TVL</span>
                  <Box gap="4px" direction="row">
                    <span>balance</span>
                    <SortIcon
                      onClick={() => sortBy('balance', !sortDirectionIsAsc)}
                      isAsc={sortDirectionIsAsc}
                    />
                  </Box>
                  <Box gap="4px" direction="row">
                    <span>APY</span>
                    <SortIcon
                      onClick={() => sortBy('apy', !sortDirectionIsAsc)}
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
          {Array.isArray(farms) && farms.length > 0 ? (
            farms.map(farm => {
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
            })
          ) : (
            <Box direction="row" justify="center" height="90px" align="center">
              <Box justify="center">
                <Text size="16px" weight={600} textAlign="center">
                  No farms matching your filters
                </Text>
                <Text size="13px" textAlign="center" weight={400}>
                  Try clearing your filters to see results
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
