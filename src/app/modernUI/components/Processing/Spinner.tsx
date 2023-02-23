import { Spinner as GrommetSpinner, Box, Image } from 'grommet';
import styled from 'styled-components';
import { useMode } from 'app/common/state';

import logoIcon from 'app/modernUI/images/logoIcon.svg';
import logoIconDark from 'app/modernUI/images/logoIcon-dark.svg';

const StyledImage = styled(Image)`
  width: 60%;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

export const Spinner = ({ imageProps = {}, ...rest }) => {
  const { isLightMode } = useMode();
  return (
    <Box justify="center" align="center" style={{ position: 'relative' }}>
      <StyledImage
        fit="contain"
        src={isLightMode ? logoIcon : logoIconDark}
        {...imageProps}
      />
      <Box>
        <GrommetSpinner color="text" pad="large" {...rest} size="xsmall" />
      </Box>
    </Box>
  );
};
