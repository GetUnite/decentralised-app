import { useState } from 'react';
import styled from 'styled-components';
import {
  Box,
  Button,
  Text,
  ButtonExtendedProps,
} from 'grommet';
import { normalizeColor } from 'grommet/utils';

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
  border-radius: 6px;
`;

export const Tabs = ({ children = [], ...rest }) => {
  const [selected, setSelected] = useState(0);
  return (
    <>
      <Box
        background="tab"
        direction="row"
        height="36px"
        round="xsmall"
        justify="stretch"
        pad="hair"
      >
        {children.map((tab, i) => (
          <Box flex direction="row" key={i}>
            <StyledButton
              size="small"
              selected={selected === i}
              justify="center"
              fill
              key={i}
              onClick={() => setSelected(i)}
            >
              <Box fill justify="center" align="center">
                <Text size="small">{tab.props.title}</Text>
              </Box>
            </StyledButton>
          </Box>
        ))}
      </Box>
      {children[selected]}
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
