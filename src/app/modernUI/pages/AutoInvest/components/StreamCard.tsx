import { TokenIcon } from 'app/modernUI/components';
import {
  Box, Card,
  Grid, ResponsiveContext
} from 'grommet';
import { useState } from 'react';
import { StopStreamConfirmation } from './StopStreamConfirmation';

interface IStreamCard {
  from: string;
  fromAddress:string;
  to: string;
  toAddress: string;
  tvs: string;
  flowPerMinute: string;
  startDate: string;
  endDate?: string;
  fundedUntilDate?: string;
  handleStopStream?: Function;
}

export const StreamCard = ({
  from,
  fromAddress,
  to,
  toAddress,
  tvs,
  flowPerMinute,
  startDate,
  endDate,
  fundedUntilDate,
  handleStopStream,
  ...rest
}: IStreamCard) => {
  const [stopStreamConfirmation, setStopStreamConfirmation] = useState(false);

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <>
          <Card
            pad={{ horizontal: 'medium', vertical: 'none' }}
            margin={{ top: 'small' }}
            height="120px"
            background="card"
            align="center"
            justify="center"
            fill="horizontal"
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
                <span>{tvs || '∞'}</span>
                <span>{flowPerMinute}/m</span>
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
                  />
                </Box>
              </>
            </Grid>
          </Card>
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
