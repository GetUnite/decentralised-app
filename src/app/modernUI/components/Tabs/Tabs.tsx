import { mode } from 'app/common/state/atoms';
import { colors } from 'app/modernUI/theme';
import { Box, Button, ButtonExtendedProps, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

const StyledButton = styled(Button)<ButtonExtendedProps | any>`
  background-color: ${props =>
    props.selected ? normalizeColor('tabSelected', props.theme) : 'inherit'};
  border-width: ${props => (props.selected ? '1px' : 0)};
  border-style: ${props => (props.selected ? 'solid' : 'none')};

  border-color: ${props =>
    props.selected
      ? normalizeColor('tabSelectedBorder', props.theme)
      : 'inherit'};
  color: ${props =>
    props.selected
      ? normalizeColor('primary', props.theme)
      : normalizeColor('tabText', props.theme)};
  border-radius: 7px;
  font-weight: bold;
`;

export const Tabs = ({
  children = [],
  selectedTab,
  setSelectedTab,
  ...rest
}) => {
  const [modeAtom] = useRecoilState(mode);
  return (
    <>
      <Box
        style={{
          boxShadow: `inset 0px 0px 0px 1px ${
            modeAtom === 'light' ? colors.BLACK_8 : colors.BLUE_80
          }`,
        }}
        background="tabSwitch"
        direction="row"
        height="38px"
        round="xsmall"
        justify="stretch"
        pad="hair"
      >
        {children.map((tab, i) => (
          <Box flex direction="row" key={i}>
            <StyledButton
              size="small"
              selected={selectedTab === i}
              justify="center"
              fill
              key={i}
              onClick={() => setSelectedTab(i)}
            >
              <Box fill justify="center" align="center">
                <Text size="small">{tab.props.title}</Text>
              </Box>
            </StyledButton>
          </Box>
        ))}
      </Box>
      {children[selectedTab]}
    </>
  );
};

export const Tab = ({ children, ...rest }) => {
  return (
    <Box fill align="center" justify="center" {...rest}>
      {children}
    </Box>
  );
};
