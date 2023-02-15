import { toExactFixed } from 'app/common/functions/utils';
import { useMode } from 'app/common/state';
import { Box, Button, Grid, ResponsiveContext } from 'grommet';
import { useState } from 'react';

export const RewardsCard = ({
  name,
  value,
  stableValue,
  farmAddress,
  interest,
  isBoost = false,
  isLocked = false,
  monthProjection,
  yearProjection,
  claimRewards,
  seeRewardsAsStable,
  stableMonthProjection,
  stableYearProjection,
}) => {
  const { isLightMode } = useMode();

  const [isHover, setIsHover] = useState<boolean>(false);

  const hoverColor = isLightMode ? '#F4F8FF' : '#4C4C4C40';
  const dividerColor = isLightMode ? '#EBEBEB' : '#999999';

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Box
          pad={{ horizontal: '34px', vertical: 'none' }}
          style={{ borderTop: `0.5px solid ${dividerColor}` }}
          height="90px"
          align="center"
          justify="center"
          fill="horizontal"
          background={isHover ? hoverColor : ''}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <Grid
            fill="horizontal"
            rows="xxsmall"
            align="center"
            columns={['220px', '200px', '175px', '175px', '105px', 'auto']}
            pad={{ top: '10px', bottom: '10px' }}
            style={{ fontSize: '16px' }}
          >
            <span style={{ fontWeight: 'bold' }}>
              {isLocked && <span>🔒</span>}
              {name}
              {isBoost && <span style={{ color: '#1C1CFF' }}> BOOST</span>}
            </span>
            <span>{seeRewardsAsStable ? `$${stableValue}` : `${value}`}</span>
            <span>
              {seeRewardsAsStable
                ? `$${stableMonthProjection}`
                : `${monthProjection}`}
            </span>
            <span>
              {seeRewardsAsStable
                ? `$${stableYearProjection}`
                : `${yearProjection}`}
            </span>
            <span>{toExactFixed(interest, 2)}%</span>
            <Box justify="end" fill>
              <Box justify="end" fill>
                <Button
                  label={'Claim rewards'}
                  onClick={() => claimRewards(farmAddress, seeRewardsAsStable)}
                />
              </Box>
            </Box>
          </Grid>
        </Box>
      )}
    </ResponsiveContext.Consumer>
  );
};
