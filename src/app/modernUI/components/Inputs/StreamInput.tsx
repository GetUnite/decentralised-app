import { roundNumberDown } from 'app/common/functions/utils';
import { TSupportedToken } from 'app/common/types/global';
import { Box, Select, Text, TextInput, ThemeContext } from 'grommet';
import { Down } from 'grommet-icons';
import { useState } from 'react';
import NumberFormat from 'react-number-format';
import styled from 'styled-components';
import { TokenIcon } from '../Icons';

const AbsoluteBox = styled(Box)`
  position: absolute;
  right: 15px;
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

interface IStreamInput {
  label?: string;
  tokenSign?: string;
  value: string;
  onValueChange: Function;
  fromTokenOptions?: TSupportedToken[];
  selectedFromToken?: TSupportedToken;
  setSelectedFromToken?: Function;
  toTokenOptions?: TSupportedToken[];
  selectedToToken?: TSupportedToken;
  setSelectedToToken?: Function;
  error: string;
  maxValue?: string;
}

export const StreamInput = ({
  label,
  tokenSign,
  value,
  onValueChange,
  fromTokenOptions,
  selectedFromToken,
  setSelectedFromToken,
  toTokenOptions,
  selectedToToken,
  setSelectedToToken,
  error,
  ...rest
}: IStreamInput) => {
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
            {!!selectedFromToken &&
              'Wallet: ' +
                tokenSign +
                roundNumberDown(+(+selectedFromToken?.balance))}
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
            <ThemeContext.Extend
              value={{
                select: {
                  icons: { margin: {
                    right: "10px"
                }},
                },
              }}
            >
              {fromTokenOptions && (
                <Select
                  width="10px"
                  plain
                  icon={<Down size="small" />}
                  dropAlign={{ right: 'right', top: 'bottom' }}
                  options={fromTokenOptions}
                  value={selectedFromToken?.label}
                  valueLabel={option => {
                    return <TokenIcon label={option} />;
                  }}
                  onChange={({ option }) => setSelectedFromToken(option)}
                  labelKey="label"
                  valueKey="address"
                />
              )}
              <Text margin={{right: "10px"}}> to </Text>
              {toTokenOptions && (
                <Select
                  width="10px"
                  plain
                  icon={<Down size="small" />}
                  dropAlign={{ right: 'right', top: 'bottom' }}
                  options={toTokenOptions}
                  value={selectedToToken?.label}
                  valueLabel={option => {
                    return <TokenIcon label={option} />;
                  }}
                  onChange={({ option }) => setSelectedToToken(option)}
                  labelKey="label"
                  valueKey="address"
                />
              )}
              / month
            </ThemeContext.Extend>
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
