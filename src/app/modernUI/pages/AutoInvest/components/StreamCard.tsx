import { TokenIcon } from 'app/modernUI/components';
import { Box, Card, Grid, ResponsiveContext } from 'grommet';
import { useState } from 'react';
import { StopStreamConfirmation } from './StopStreamConfirmation';

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
                <Box direction="row" gap="5px">
                  <span>
                    ${sign}${tvs}
                  </span>
                  {/*<Button onClick={() => setIsTvsInUSD(!isTvsInUSD)}>
                    <Box justify="center" fill>
                      <img src={swap} />
                    </Box>
      </Button>*/}
                </Box>
                <Box direction="row" gap="5px">
                  <span>
                    {sign}${flowPerMonth}/m
                  </span>
                  {/*<Button onClick={() => setIsFlowRateInUSD(!isFlowRateInUSD)}>
                  <Box justify="center" fill>
                      <img src={swap} />
                    </Box>
                  </Button>*/}
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
          </Card>
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
