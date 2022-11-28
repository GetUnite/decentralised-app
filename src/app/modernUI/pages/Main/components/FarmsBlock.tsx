import { EChain } from 'app/common/constants/chains';
import { SortIcon } from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import { Box, Card, Grid, Heading, Text } from 'grommet';
import { FarmCard } from './FarmCard';

export const FarmsBlock = ({ size, heading, description, viewType, sortDirectionIsAsc, sortBy, isLoading, farms }) => {
  return (
    <Box gap="20px" background="card" round="8px" pad={{bottom: "20px"}}>
      <Box
        pad={{
          horizontal: 'medium',
          bottom: '23px',
          top: '43px',
        }}
      >
        <Heading size="24px">{heading}</Heading>
        <Text size="16px">
          {description}
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
              columns={
                viewType != 'your'
                  ? ['270px', '200px', '155px', '155px', '105px', 'auto']
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
              {viewType != 'your' ? (
                <>
                  <span>asset</span>
                  <span>supported tokens</span>
                  <span>network</span>
                  <span>TVL</span>
                  <Box gap="4px" direction="row">
                    <span>APY</span>
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
            <div style={{ borderTop: "2px solid #fff ", marginLeft: 20, marginRight: 20 }}></div>
          </Card>
        )}
        <Box>
          {Array.isArray(farms) &&
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
            })}
        </Box>
      </Box>
    </Box>
  );
};
