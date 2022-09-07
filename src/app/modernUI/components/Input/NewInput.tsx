import { useState, Ref, LegacyRef } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';
import {
  Layer,
  Box,
  Button,
  TextInput,
  Select,
  Text,
  ButtonExtendedProps,
  SelectExtendedProps,
  TextInputProps,
  RangeInput,
  RangeInputProps,
  RangeInputExtendedProps,
} from 'grommet';
import { Down } from 'grommet-icons';
import { normalizeColor } from 'grommet/utils';
import NumberFormat from 'react-number-format';

import usdc from 'app/modernUI/images/usdc.svg';
import usdt from 'app/modernUI/images/usdt.svg';
import dai from 'app/modernUI/images/dai.svg';
import eurt from 'app/modernUI/images/eurt.svg';
import eurs from 'app/modernUI/images/eurs.png';
import jeur from 'app/modernUI/images/jeur.svg';
import ageur from 'app/modernUI/images/ageur.png';
import weth from 'app/modernUI/images/weth.png';
import wbtc from 'app/modernUI/images/wbtc.png';
import iballuousd from 'app/modernUI/images/iballuousd.svg';
import iballuoeur from 'app/modernUI/images/iballuoeur.svg';
import iballuoeth from 'app/modernUI/images/iballuoeth.svg';
import iballuobtc from 'app/modernUI/images/iballuobtc.svg';
import coinPlaceholder from 'app/modernUI/images/coinPlaceholder.svg';

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
  selectedTokenInfo?: any;
  setSelectedToken?: Function;
}

export const NewInput = ({
  coinIcon,
  headerText,
  inputProps,
  isRangeInput,
  rangeInputProps,
  selectProps,
  maxButtonProps,
  farmInfo,
  selectedTokenInfo,
  setSelectedToken,
  ...rest
}: IInputProps) => {
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
            Max
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
              value={selectedTokenInfo?.label}
              valueLabel={option => {
                if (option === 'USDC' || option === 'tUSDC')
                  return <img width="24" height="24" src={usdc} />;
                if (option === 'USDT' || option === 'tUSDT')
                  return <img width="24" height="24" src={usdt} />;
                if (option === 'DAI' || option === 'tDAI')
                  return <img width="24" height="24" src={dai} />;

                if (option === 'jEUR' || option === 'tjEUR')
                  return <img width="24" height="24" src={jeur} />;
                if (option === 'EURT' || option === 'tEURT')
                  return <img width="24" height="24" src={eurt} />;
                if (option === 'EURS' || option === 'tEURS')
                  return <img width="24" height="24" src={eurs} />;
                if (option === 'agEUR' || option === 'tagEUR')
                  return <img width="24" height="24" src={ageur} />;

                if (option === 'WETH' || option === 'tWETH')
                  return <img width="24" height="24" src={weth} />;

                if (option === 'WBTC' || option === 'tWBTC')
                  return <img width="24" height="24" src={wbtc} />;

                if (option === 'USD')
                  return <img width="24" height="24" src={iballuousd} />;
                if (option === 'EUR')
                  return <img width="24" height="24" src={iballuoeur} />;
                if (option === 'ETH')
                  return <img width="24" height="24" src={iballuoeth} />;
                if (option === 'BTC')
                  return <img width="24" height="24" src={iballuobtc} />;
                return <img width="24" height="24" src={coinPlaceholder} />;
              }}
              onChange={({ option }) => setSelectedToken(option)}
              labelKey="label"
              valueKey="address"
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
          {'Deposit ' + selectedTokenInfo?.label}
        </Text>
        <Text size="medium" color="soul">
          {!!selectedTokenInfo &&
            'Wallet: ' +
              coinIcon +
              (+(+selectedTokenInfo?.balance)).toLocaleString()}
        </Text>
      </Box>
      <RelativeBox margin={{ top: 'xxsmall' }} isRangeInput={isRangeInput}>
        {renderInput()}
      </RelativeBox>
    </>
  );
};
