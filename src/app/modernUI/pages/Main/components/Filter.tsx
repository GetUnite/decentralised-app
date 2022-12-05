import { useMode } from 'app/common/state';
import { Box, Button, DropButton, Heading, Text } from 'grommet';
import { Down } from 'grommet-icons';
import './Filter.css';

export const Filter = ({
  icon = null,
  children,
  heading,
  onClear,
  buttonStyle = null,
  ...rest
}) => {
  const { isLightMode } = useMode();
  const dividerColor = isLightMode ? '#EBEBEB' : '#999999';
  const backgroundColor = isLightMode ? '#FFFFFF' : '#1D1D1D';
  const textColor = isLightMode ? 'black' : 'white';

  return (
    <>
      <DropButton
        id="filter"
        plain
        label={
          <Box direction="row" gap={icon ? '4px' : '7px'} pad='5px 9px 5px 13px' align='center'>
            {icon && <img src={icon} />}
            <Text size="14px">{heading}</Text>
            {!icon && <Down size="small" />}
          </Box>
        }
        style={
          buttonStyle
            ? buttonStyle
            : {
              
                height: '32px',
                borderRadius: '8px',
                border: '1px solid #CCCCCC',
              }
        }
        dropAlign={{ top: 'bottom', left: 'left' }}
        dropContent={
          <Box
            pad={{ horizontal: 'medium', vertical: '8px' }}
            round="8px"
            width="373px"
            style={{
              display: 'block',
              background: backgroundColor,
              color: textColor,
            }}
          >
            <Box fill>
              <Heading size="18px">{heading}</Heading>
              {children}
            </Box>
            <Box
              justify="end"
              direction="row"
              fill
              pad="8px"
              style={{
                borderTop: `2px solid ${dividerColor}`,
              }}
            >
              <Button plain onClick={onClear}>
                <Text size="13px" color="#808080">
                  Clear all
                </Text>
              </Button>
            </Box>
          </Box>
        }
      />
    </>
  );
};
