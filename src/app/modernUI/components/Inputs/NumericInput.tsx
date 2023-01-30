import { toExactFixed } from 'app/common/functions/utils';
import { TSupportedToken } from 'app/common/types/global';
import { Box, Text, TextInput } from 'grommet';
import { useState } from 'react';
import NumberFormat from 'react-number-format';
import styled from 'styled-components';
import { MaxButton } from './MaxButton';
import { RelativeBox } from './RelativeBox';
import { TokenSelector } from './TokenSelector';

const AbsoluteBox = styled(Box)`
  position: absolute;
  right: 0;
  left: auto;
  bottom: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface INumericInput {
  label?: string;
  tokenSign?: string;
  value: string;
  available?: string;
  onValueChange?: Function;
  selectedToken?: TSupportedToken;
  setSelectedToken?: Function;
  tokenOptions?: TSupportedToken[];
  error?: string;
  maxValue?: string | number;
  maxButton?: boolean;
  inputWarning?: string;
  slippageWarning?: boolean;
  disabled?: boolean;
  disableNumber?: boolean;
}

export const NumericInput = ({
  label,
  tokenSign,
  value,
  available,
  maxValue,
  maxButton = false,
  onValueChange,
  tokenOptions,
  selectedToken,
  setSelectedToken,
  inputWarning,
  error,
  disabled = false,
  slippageWarning = false,
  disableNumber = false,
}: INumericInput) => {
  const [formattedValue, setFormattedValue] = useState(
    value != '' ? (+(+value).toFixed(10)).toLocaleString(undefined, {
      maximumFractionDigits: 6,
    }) : ''
  );
  const thousandsSeparator = Number(10000).toLocaleString().charAt(2);
  const decimalSeparator = Number(1.1).toLocaleString().charAt(1);

  return (
    <>
      <Box>
        <Box direction="row" justify="between">
          <Text size="medium" color="soul">
            {label}
          </Text>
          {!disabled && !disableNumber && (
            <Text size="medium" color="soul">
              {available != undefined ? (
                'Available: ' + tokenSign + toExactFixed(+available, 6)
              ) : (
                <>
                  {!!selectedToken &&
                    'Wallet: ' + tokenSign + toExactFixed(+maxValue, 6)}
                </>
              )}
            </Text>
          )}
        </Box>
        <RelativeBox margin={{ top: 'xxsmall' }}>
          <NumberFormat
            value={formattedValue}
            placeholder={(+"0").toLocaleString(undefined, {minimumFractionDigits: 2})}
            customInput={TextInput}
            disabled={disabled || disableNumber}
            thousandSeparator={thousandsSeparator}
            decimalSeparator={decimalSeparator}
            onValueChange={values => {
              const { formattedValue, value } = values;
              onValueChange(value);
              setFormattedValue(formattedValue);
            }}
            style={disableNumber ? {border: "1px solid #000000", opacity: 1} : {}}
          />
          <AbsoluteBox
            direction="row"
            gap="xsmall"
            style={
              !tokenOptions || disabled ? { right: '8px' } : { right: '0' }
            }
          >
            {maxButton && maxValue != undefined && (
              <MaxButton
                primary
                onClick={() => {
                  setFormattedValue(toExactFixed(maxValue, 6));
                }}
              >
                MAX
              </MaxButton>
            )}
            {tokenOptions && !disabled && (
              <TokenSelector
                selectedToken={selectedToken}
                tokenOptions={tokenOptions}
                setSelectedToken={setSelectedToken}
              />
            )}
          </AbsoluteBox>
        </RelativeBox>
        <Box
          margin={{ top: '4px', bottom: '12px' }}
          height={slippageWarning ? '60px' : '13px'}
        >
          {error ? (
            <Text color="error" size="small">
              {error}
            </Text>
          ) : (
            <Box fill>
              {inputWarning && (
                <>
                  <Text size="small" color="soul">
                    {inputWarning}
                  </Text>
                </>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};
