import { useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';
import {
  Box,
  Button,
  TextInput,
  Select,
  Text,
  ButtonExtendedProps,
  SelectExtendedProps,
  TextInputProps,
  RangeInput,
  RangeInputExtendedProps,
} from 'grommet';
import { Down } from 'grommet-icons';
import { normalizeColor } from 'grommet/utils';
import NumberFormat from 'react-number-format';

import { selectedStableCoin } from 'app/common/state/atoms';

import usdc from 'app/modernUI/images/usdc.svg';
import usdt from 'app/modernUI/images/usdt.svg';
import dai from 'app/modernUI/images/dai.svg';

import eurt from 'app/modernUI/images/eurt.svg';
import eurs from 'app/modernUI/images/eurs.png';
import jeur from 'app/modernUI/images/jeur.svg';
import weth from 'app/modernUI/images/weth.png';
import wbtc from 'app/modernUI/images/wbtc.png';
import coinPlaceholder from 'app/modernUI/images/tokenPlaceholder.svg';

const AbsoluteBox = styled(Box)<{ isRangeInput?: boolean }>`
  position: absolute;
  right: ${({ isRangeInput }) => (isRangeInput ? 'auto' : '0.4em')};
  left: ${({ isRangeInput }) => (isRangeInput ? '0.4em' : 'auto')};
  bottom: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const RelativeBox = styled(Box)<{ isRangeInput: boolean }>`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding: ${({ isRangeInput }) => (isRangeInput ? '0 0.5em' : '0 0 0 0')};
  border-radius: ${({ isRangeInput }) => (isRangeInput ? '4px' : '0px')};
  border: ${({ isRangeInput }) =>
    isRangeInput ? '1px solid #CCCCCC' : 'none'};
`;

const MaxButton = styled(Button)`
  background-color: ${props => normalizeColor('buttonMax', props.theme)};
  font-size: 14px;
  height: 30px;
  padding: 0 10px;
  border-radius: 4px;
`;
const StyledSelect = styled(Select)<SelectExtendedProps | any>`
  width: 10px;
`;

const RangeInputValueText = styled(Box)`
  font-size: 14px;
  padding: 0 0.7em;
  text-align: center;
`;

interface IInputProps {
  coinIcon?: string;
  headerText?: string;
  inputProps?: TextInputProps;
  isRangeInput?: boolean;
  rangeInputProps?: RangeInputExtendedProps;
  selectProps?: Partial<SelectExtendedProps>;
  maxButtonProps?: ButtonExtendedProps;
  farmInfo?: any;
}

export const Input = ({
  coinIcon,
  headerText,
  inputProps,
  isRangeInput,
  rangeInputProps,
  selectProps,
  maxButtonProps,
  farmInfo,
  ...rest
}: IInputProps) => {
  const [selectedStableCoinAtom, setselectedStableCoinAtom] =
    useRecoilState(selectedStableCoin);

  const selectedStableCoinInfo =
    farmInfo?.stableCoinInfoAtom?.data?.find(
      coin => coin.tokenAddress === selectedStableCoinAtom?.value,
    ) || null;

  const [formattedValue, setFormattedValue] = useState('');
  const thousandsSeparator = Number(10000).toLocaleString().charAt(2);
  const decimalSeparator = Number(1.1).toLocaleString().charAt(1);

  const renderInput = () => {
    if (isRangeInput) {
      return (
        <>
          <RangeInputValueText>{rangeInputProps.value}%</RangeInputValueText>
          <RangeInput {...rangeInputProps} />
          <MaxButton primary {...maxButtonProps}>
            MAX
          </MaxButton>
        </>
      );
    }

    return (
      <>
        <NumberFormat
          value={formattedValue}
          placeholder="0.00"
          customInput={TextInput}
          thousandSeparator={thousandsSeparator}
          decimalSeparator={decimalSeparator}
          onValueChange={(values, sourceInfo) => {
            const { formattedValue, value } = values;
            const { event } = sourceInfo;

            if (event) {
              inputProps.onChange({
                ...event,
                target: { ...event.target, value: value },
              });
              setFormattedValue(formattedValue);
            }
          }}
        />
        <AbsoluteBox direction="row" gap="xsmall">
          <MaxButton
            primary
            onClick={event => {
              setFormattedValue(Number(inputProps.max).toLocaleString());
              return maxButtonProps.onClick(event);
            }}
          >
            Max
          </MaxButton>
          {!!selectProps && (
            <StyledSelect
              plain
              icon={<Down size="small" />}
              dropAlign={{ right: 'right', top: 'bottom' }}
              value={selectedStableCoinAtom?.label}
              valueLabel={option => {
                if (option === 'USDC' || option === 'tUSDC')
                  return <img width="24" height="24" src={usdc} alt="usdc" />;
                if (option === 'USDT' || option === 'tUSDT')
                  return <img width="24" height="24" src={usdt} alt="usdt" />;
                if (option === 'DAI' || option === 'tDAI')
                  return <img width="24" height="24" src={dai} alt="dai" />;

                if (option === 'jEUR' || option === 'tjEUR')
                  return <img width="24" height="24" src={jeur} alt="jeur" />;
                if (option === 'EURT' || option === 'tEURT')
                  return <img width="24" height="24" src={eurt} alt="eurt" />;
                if (option === 'EURS' || option === 'tEURS')
                  return <img width="24" height="24" src={eurs} alt="eurs" />;

                if (option === 'WETH' || option === 'tWETH')
                  return <img width="24" height="24" src={weth} alt="weth" />;

                if (option === 'WBTC' || option === 'tWBTC')
                  return <img width="24" height="24" src={wbtc} alt="wbtc" />;

                return (
                  <img
                    width="24"
                    height="24"
                    src={coinPlaceholder}
                    alt="placeholder"
                  />
                );
              }}
              onChange={({ option }) => setselectedStableCoinAtom(option)}
              labelKey="label"
              valueKey="value"
              {...selectProps}
            />
          )}
        </AbsoluteBox>
      </>
    );
  };

  return (
    <>
      <Box direction="row" justify="between">
        <Text size="medium" color="soul">
          {headerText || 'Amount'}
        </Text>
        <Text size="medium" color="soul">
          {!!selectedStableCoinInfo &&
            'Wallet: ' +
              coinIcon +
              (+(+selectedStableCoinInfo?.balance)).toLocaleString()}
        </Text>
      </Box>
      <RelativeBox margin={{ top: 'xxsmall' }} isRangeInput={isRangeInput}>
        {renderInput()}
      </RelativeBox>
    </>
  );
};
