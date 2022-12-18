import { useMode } from 'app/common/state';
import { TokenIcon } from 'app/modernUI/components';
import { Box, Grid, ResponsiveContext } from 'grommet';
import { useState } from 'react';
import { StopStreamConfirmation } from '../blocks/StopStreamConfirmation';

interface IStreamCard {
  from: string;
  fromAddress: string;
  to: string;
  toAddress: string;
  tvs: string;
  flowPerMonth: string;
  startDate: string;
  endDate?: string;
  fundedUntilDate?: string;
  handleStopStream?: Function;
  sign: string;
  isStoppingStream: boolean;
}

export const StreamCard = ({
  from,
  fromAddress,
  to,
  toAddress,
  tvs,
  flowPerMonth,
  startDate,
  endDate,
  fundedUntilDate,
  handleStopStream,
  isStoppingStream,
  sign,
  ...rest
}: IStreamCard) => {
  const { isLightMode } = useMode();
  const [stopStreamConfirmation, setStopStreamConfirmation] = useState(false);

  const [isHover, setIsHover] = useState<boolean>(false);

  const hoverColor = isLightMode ? '#F4F8FF' : '#4C4C4C40';
  const dividerColor = isLightMode ? '#EBEBEB' : '#999999';

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <>
          <Box
            pad={{ horizontal: 'medium', vertical: 'none' }}
            height="120px"
            style={{ borderTop: `0.5px solid ${dividerColor}` }}
            background={isHover ? hoverColor : ''}
            align="center"
            justify="center"
            fill="horizontal"
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            <Grid
              fill="horizontal"
              rows="xxsmall"
              align="center"
              columns={{ size: 'xsmall', count: 'fit' }}
              pad={{ top: '10px', bottom: '10px' }}
              style={{ fontSize: '16px' }}
            >
              <>
                <Box direction="row" gap="5px">
                  <TokenIcon label={from} />{' '}
                  <span style={{ fontWeight: '500' }}>{from} Farm</span>
                </Box>
                <Box direction="row" gap="5px">
                  <TokenIcon label={to} />{' '}
                  <span style={{ fontWeight: '500' }}>{to} Farm</span>
                </Box>
                <Box direction="row" gap="5px">
                  <span>
                    {sign}
                    {tvs}
                  </span>
                </Box>
                <Box direction="row" gap="5px">
                  <span>
                    {sign}
                    {flowPerMonth}/m
                  </span>
                </Box>
                <span>{startDate}</span>
                <span>{endDate || '∞'}</span>
                <Box direction="row" justify="between" align="center">
                  <span>{fundedUntilDate}</span>
                  <StopStreamConfirmation
                    stopStreamConfirmation={stopStreamConfirmation}
                    setStopStreamConfirmation={setStopStreamConfirmation}
                    fromAddress={fromAddress}
                    toAddress={toAddress}
                    handleStopStream={handleStopStream}
                    isStoppingStream={isStoppingStream}
                  />
                </Box>
              </>
            </Grid>
          </Box>
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
