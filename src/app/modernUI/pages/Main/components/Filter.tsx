import { useMode } from 'app/common/state';
import 'app/modernUI/css/Dropdown.css';
import { colors } from 'app/modernUI/theme';
import { Box, Button, DropButton, Heading, Text } from 'grommet';
import { Down, FormClose } from 'grommet-icons';

export const Filter = ({
  icon = null,
  children,
  heading,
  onClear,
  onClose,
  buttonStyle = null,
  isFiltering = false,
  ...rest
}) => {
  const { isLightMode } = useMode();
  const dividerColor = isLightMode ? '#EBEBEB' : '#999999';
  const backgroundColor = isLightMode ? '#FFFFFF' : '#1D1D1D';
  const filteringBackgroundColor = isLightMode ? '#EAF1FF' : '#EAF1FF80';
  const textColor = isLightMode ? 'black' : 'white';
  const filteringTextColor = isLightMode ? colors.BLUE : 'white';

  return (
    <>
      <DropButton
        id="dropdown"
        plain
        onClose={onClose}
        label={
          <Box
            direction="row"
            gap={icon ? '4px' : isFiltering ? '4px' : '7px'}
            pad="5px 9px 5px 13px"
            align="center"
          >
            {icon && <img src={icon} />}
            <Text size="14px">{heading}</Text>
            {!icon && (
              <>
                {isFiltering ? (
                  <FormClose size="14px" color={filteringTextColor} />
                ) : (
                  <Down size="small" />
                )}
              </>
            )}
          </Box>
        }
        style={
          buttonStyle
            ? buttonStyle
            : {
                height: '32px',
                borderRadius: '8px',
                ...(isFiltering
                  ? { backgroundColor: filteringBackgroundColor, color: filteringTextColor }
                  : {
                      border: '1px solid #CCCCCC',
                    }),
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
