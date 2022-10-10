import { TokenIcon } from 'app/modernUI/components';
import { Card, Grid, ResponsiveContext } from 'grommet';

interface IStreamCard {
  from: string;
  to: string;
  flowPerMinute: string;
  startDate: string;
  endDate?: string;
}

export const StreamCard = ({
  from,
  to,
  flowPerMinute,
  startDate,
  endDate,
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
                <span style={{ fontWeight: '500' }}>
                  <TokenIcon label={from} /> {from} Farm
                </span>
                <span style={{ fontWeight: '500' }}>
                  <TokenIcon label={to} /> {to} Farm
                </span>
                <span>{flowPerMinute}/m</span>
                <span>{startDate}</span>
                <span>{endDate || '∞'}</span>
              </>
            </Grid>
          </Card>
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
