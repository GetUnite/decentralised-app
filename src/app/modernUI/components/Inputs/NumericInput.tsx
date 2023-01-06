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
  onValueChange: Function;
  selectedToken?: TSupportedToken;
  setSelectedToken?: Function;
  tokenOptions?: TSupportedToken[];
  error: string;
  maxValue?: string | number;
  maxButton?: boolean;
  slippageWarning?: boolean;
  lowSlippageTokenLabels?: string[];
  isLoadingMaxValue?: boolean;
  disabled?: boolean;
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
  slippageWarning = false,
  lowSlippageTokenLabels,
  error,
  isLoadingMaxValue = false,
  disabled = false,
  ...rest
}: INumericInput) => {
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
          {!disabled && (
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
            placeholder="0.00"
            customInput={TextInput}
            disabled={disabled}
            thousandSeparator={thousandsSeparator}
            decimalSeparator={decimalSeparator}
            onValueChange={values => {
              const { formattedValue, value } = values;
              onValueChange(value);
              setFormattedValue(formattedValue);
            }}
          />
          <AbsoluteBox direction="row" gap="xsmall" style={!tokenOptions || disabled ? {right: "8px"} : {right: "0"}}>
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
          margin={{ top: 'small' }}
          height={slippageWarning ? '60px' : '13px'}
        >
          {error ? (
            <Text color="error" size="small">
              {error}
            </Text>
          ) : (
            <Box fill>
              {slippageWarning && (
                <>
                  <Text size="small" color="soul">
                    Withdrawing in any token other than{' '}
                    {lowSlippageTokenLabels?.join('/')} increases slippage.
                    Values shown are an approximation and may change subject to
                    exhange rates
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
