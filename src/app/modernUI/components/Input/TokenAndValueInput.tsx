import { useState } from 'react';
import styled from 'styled-components';
import { Box, Button, TextInput, Select, Text } from 'grommet';
import { Down } from 'grommet-icons';
import { normalizeColor } from 'grommet/utils';
import NumberFormat from 'react-number-format';
import { TSupportedToken } from 'app/common/typings/form';
import { TokenIcon } from '../Icons';

const AbsoluteBox = styled(Box)`
  position: absolute;
  right: 0.4em;
  left: auto;
  bottom: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const RelativeBox = styled(Box)`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

const MaxButton = styled(Button)`
  background-color: ${props => normalizeColor('buttonMax', props.theme)};
  font-size: 14px;
  height: 30px;
  padding: 0 10px;
  border-radius: 4px;
`;

interface ITokenAndValueInput {
  label?: string;
  tokenSign?: string;
  value: string;
  onValueChange: Function;
  selectedToken: TSupportedToken;
  setSelectedToken?: Function;
  tokenOptions: TSupportedToken[];
  error: string;
  maxValue: string;
}

export const TokenAndValueInput = ({
  label,
  tokenSign,
  value,
  maxValue,
  onValueChange,
  tokenOptions,
  selectedToken,
  setSelectedToken,
  error,
  ...rest
}: ITokenAndValueInput) => {
  const [formattedValue, setFormattedValue] = useState('');
  const thousandsSeparator = Number(10000).toLocaleString().charAt(2);
  const decimalSeparator = Number(1.1).toLocaleString().charAt(1);

  return (
    <>
      <Box>
        <Box direction="row" justify="between">
          <Text size="medium" color="soul">
            {label}
          </Text>
          <Text size="medium" color="soul">
            {!!selectedToken &&
              'Wallet: ' +
                tokenSign +
                (+(+selectedToken?.balance)).toLocaleString()}
          </Text>
        </Box>
        <RelativeBox margin={{ top: 'xxsmall' }}>
          <NumberFormat
            value={formattedValue}
            placeholder="0.00"
            customInput={TextInput}
            thousandSeparator={thousandsSeparator}
            decimalSeparator={decimalSeparator}
            onValueChange={values => {
              const { formattedValue, value } = values;
              onValueChange(value);
              setFormattedValue(formattedValue);
            }}
          />
          <AbsoluteBox direction="row" gap="xsmall">
            <MaxButton
              primary
              onClick={() => {
                setFormattedValue(
                  Number(maxValue).toLocaleString(),
                );
                onValueChange(maxValue);
              }}
            >
              Max
            </MaxButton>
            <Select
              width="10px"
              plain
              icon={<Down size="small" />}
              dropAlign={{ right: 'right', top: 'bottom' }}
              options={tokenOptions}
              value={selectedToken?.label}
              valueLabel={option => {
                return <TokenIcon label={option} />;
              }}
              onChange={({ option }) => setSelectedToken(option)}
              labelKey="label"
              valueKey="address"
            />
          </AbsoluteBox>
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
