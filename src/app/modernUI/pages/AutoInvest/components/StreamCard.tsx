import { TokenIcon } from 'app/modernUI/components';
import { Box, Card, Grid, ResponsiveContext } from 'grommet';

interface IStreamCard {
  from: string;
  to: string;
  tvs:string;
  flowPerMinute: string;
  startDate: string;
  endDate?: string;
  fundedUntilDate?: string;
}

export const StreamCard = ({
  from,
  to,
  tvs,
  flowPerMinute,
  startDate,
  endDate,
  fundedUntilDate,
  ...rest
}: IStreamCard) => {
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
              <Box direction='row' gap="5px">
                  <TokenIcon label={from} />{' '}
                  <span style={{ fontWeight: '500' }}>{from} Farm</span>
                </Box>
                <Box direction='row' gap="5px">
                  <TokenIcon label={to} />{' '}
                  <span style={{ fontWeight: '500' }}>{to} Farm</span>
                </Box>
                <span>{tvs || '∞'}</span>
                <span>{flowPerMinute}/m</span>
                <span>{startDate}</span>
                <span>{endDate || '∞'}</span>
                <span>{fundedUntilDate}</span>
              </>
            </Grid>
          </Card>
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
