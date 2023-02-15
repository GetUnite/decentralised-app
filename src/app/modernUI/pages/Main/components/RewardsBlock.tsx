import { useMode } from 'app/common/state';
import swap from 'app/modernUI/images/swap.svg';
import { isSmall } from 'app/modernUI/theme';
import { Box, Button, Grid, Text } from 'grommet';
import { useState } from 'react';
import { RewardsCard } from './RewardsCard';

export const RewardsBlock = ({
  size,
  heading,
  description,
  rewardsInfo,
  claimRewards,
}) => {
  const { isLightMode } = useMode();

  const [seeRewardsAsStable, setSeeRewardsAsStable] = useState<boolean>(false);

  return (
    <Box
      gap="18px"
      background="card"
      round="16px"
      pad={{ bottom: '20px' }}
      style={isLightMode ? { border: '1px solid #EBEBEB' } : {}}
    >
      <Box
        pad={{
          horizontal: '34px',
          bottom: '23px',
          top: '27px',
        }}
      >
        <Box direction="row" justify="between">
          <Box gap="8px" style={{ maxWidth: '691px' }}>
            <Text size="24px" weight="bold">
              {heading}
            </Text>
            <Text size="16px">{description}</Text>
          </Box>
        </Box>
      </Box>
      {!isSmall(size) && (
        <Box
          pad={{ horizontal: '34px', vertical: 'none' }}
          margin="none"
          align="center"
          justify="center"
          fill="horizontal"
        >
          <Grid
            fill
            rows="xxsmall"
            align="center"
            height="38px"
            columns={['220px', '200px', '175px', '175px', '105px', 'auto']}
            pad="none"
            style={{ fontSize: '16px' }}
          >
            <span>farm</span>
            <Box direction="row" gap="4px">
              current rewards
              <Button
                onClick={() => setSeeRewardsAsStable(!seeRewardsAsStable)}
              >
                <Box justify="center" fill>
                  <img src={swap} />
                </Box>
              </Button>
            </Box>
            <span>1 month projection</span>
            <span>1 year projection</span>
            <span>APY</span>
            <span></span>
          </Grid>
        </Box>
      )}
      <Box>
        {rewardsInfo.map((info, index) => {
          return (
            <RewardsCard
              key={index}
              farmAddress={info.farmAddress}
              name={info.name}
              value={info.value}
              stableValue={info.stableValue}
              interest={info.interest}
              isBoost={info.isBoost}
              isLocked={info.isLocked}
              monthProjection={info.monthProjection}
              yearProjection={info.yearProjection}
              claimRewards={claimRewards}
              seeRewardsAsStable={seeRewardsAsStable}
              stableMonthProjection={info.stableMonthProjection}
              stableYearProjection={info.stableYearProjection}
            />
          );
        })}
      </Box>
    </Box>
  );
};
