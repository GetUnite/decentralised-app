import { Box, RangeInput as RangeBar, Text } from 'grommet';
import { MaxButton } from './MaxButton';
import { RelativeBox } from './RelativeBox';

interface IRangeInput {
  label?: string;
  value: number;
  onValueChange: Function;
  error: string;
}

export const RangeInput = ({
  label,
  value,
  onValueChange,
  error,
  ...rest
}: IRangeInput) => {
  return (
    <>
      <Box>
        <Box direction="row" justify="between">
          <Text size="medium" color="soul">
            {label}
          </Text>
        </Box>

        <RelativeBox
          margin={{ top: 'xxsmall' }}
          pad="8px"
          border={{ size: '1px', color: '#CCCCCC' }}
          round="8px"
        >
          <Box pad={{ horizontal: '0.7em' }} justify="center">
            <Text size="14px">{value}%</Text>
          </Box>
          <RangeBar
            value={value}
            onChange={event => onValueChange(event.target.value)}
          />
          <MaxButton
            primary
            onClick={() => {
              onValueChange(100);
            }}
          >
            Max
          </MaxButton>
        </RelativeBox>
        {error && (
          <Text color="error" size="small" margin={{ top: 'small' }}>
            {error}
          </Text>
        )}
      </Box>
    </>
  );
};
