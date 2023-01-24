import { toExactFixed } from 'app/common/functions/utils';
import { TSupportedToken } from 'app/common/types/global';
import { Box, Text, TextInput, ThemeContext } from 'grommet';
import { useState } from 'react';
import NumberFormat from 'react-number-format';
import styled from 'styled-components';
import { TokenSelector } from './TokenSelector';

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
  error?: string;
  maxValue?: string;
  disabled?: boolean;
  isSmall?: boolean;
  style?: object;
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
  error = undefined,
  disabled = false,
  isSmall = false,
  style,
}: IStreamInput) => {
  const [formattedValue, setFormattedValue] = useState('');
  const thousandsSeparator = Number(10000).toLocaleString().charAt(2);
  const decimalSeparator = Number(1.1).toLocaleString().charAt(1);

  return (
    <>
      <Box style={style}>
        <Box direction="row" justify="between">
          <Text size="medium" color="soul">
            {label}
          </Text>
          <Text size="medium" color="soul">
            {!!selectedFromToken &&
              'Wallet: ' +
                tokenSign +
                toExactFixed(+(+selectedFromToken?.balance), 5)}
          </Text>
        </Box>
        <RelativeBox margin={{ top: 'xxsmall' }}>
          <NumberFormat
            value={formattedValue}
            placeholder={disabled ? value : '0.00'.toLocaleString()}
            customInput={TextInput}
            thousandSeparator={thousandsSeparator}
            decimalSeparator={decimalSeparator}
            onValueChange={values => {
              const { formattedValue, value } = values;
              onValueChange(value);
              setFormattedValue(formattedValue);
            }}
            disabled={disabled}
          />
          <AbsoluteBox direction="row" gap="xsmall">
            <ThemeContext.Extend
              value={{
                select: {
                  icons: {
                    margin: {
                      right: '10px',
                    },
                  },
                },
              }}
            >
              {fromTokenOptions && (
                <TokenSelector
                  selectedToken={selectedFromToken}
                  tokenOptions={fromTokenOptions}
                  setSelectedToken={setSelectedFromToken}
                  disabled={disabled}
                />
              )}
              {fromTokenOptions && toTokenOptions && (
                <Text margin={{ right: '10px' }}> to </Text>
              )}
              {toTokenOptions && (
                <TokenSelector
                  selectedToken={selectedToToken}
                  tokenOptions={toTokenOptions}
                  setSelectedToken={setSelectedToToken}
                  disabled={disabled}
                />
              )}
              {isSmall ? (
                <>{formattedValue.length < 9 && <Text color="soul">/m</Text>}</>
              ) : (
                '/ month'
              )}
            </ThemeContext.Extend>
          </AbsoluteBox>
        </RelativeBox>
        <Box height="13px">
          {error && (
            <Text color="error" size="small" margin={{ top: 'small' }}>
              {error}
            </Text>
          )}
        </Box>
      </Box>
    </>
  );
};
