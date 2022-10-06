import { Button } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import styled from 'styled-components';

export const MaxButton = styled(Button)`
  background-color: ${props => normalizeColor('buttonMax', props.theme)};
  font-size: 14px;
  height: 30px;
  padding: 0 10px;
  border-radius: 4px;
`;
