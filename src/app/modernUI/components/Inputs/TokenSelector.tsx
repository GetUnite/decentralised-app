import { useMode } from 'app/common/state';
import 'app/modernUI/css/Dropdown.css';
import { Box, Button, DropButton, Text } from 'grommet';
import { Down } from 'grommet-icons';
import { useState } from 'react';
import { TokenIcon } from '../Icons';

export const TokenSelector = ({
  icon = null,
  tokenOptions,
  selectedToken,
  setSelectedToken,
  ...rest
}) => {
  const { isLightMode } = useMode();
  const backgroundColor = isLightMode ? '#FFFFFF' : '#1D1D1D';
  const textColor = isLightMode ? 'black' : 'white';
  const hoverColor = isLightMode ? '#2a73ff1a' : '#2a73ff66';

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <DropButton
        id="dropdown"
        open={isOpen}
        plain
        label={
          <Box align="center">
            <Button onClick={() => setIsOpen(!isOpen)}>
              <Box
                direction="row"
                gap="10px"
                align="center"
                margin={{ right: '16px' }}
              >
                <TokenIcon label={selectedToken.label} />
                <Down size="small" />
              </Box>
            </Button>
          </Box>
        }
        dropAlign={{ top: 'bottom', right: 'right' }}
        dropContent={
          <Box
            pad={{ vertical: '12px' }}
            round="8px"
            style={{
              minWidth: '142px',
              display: 'block',
              background: backgroundColor,
              color: textColor,
            }}
          >
            <Box fill gap="4px">
              {tokenOptions.map((tokenOption, index) => {
                return (
                  <Button
                    key={index}
                    onClick={() => {
                      setSelectedToken(tokenOption);
                      setIsOpen(false);
                    }}
                    hoverIndicator={hoverColor}
                  >
                    <Box
                      direction="row"
                      gap="6px"
                      pad={{ horizontal: '12px', vertical: '4px' }}
                    >
                      <TokenIcon label={tokenOption.label} />
                      <Text size="16px">{tokenOption.label}</Text>
                    </Box>
                  </Button>
                );
              })}
            </Box>
          </Box>
        }
      />
    </>
  );
};
