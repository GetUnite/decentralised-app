import { useState } from 'react';
import { ResponsiveContext, Layer, Box, Text, Button, Avatar } from 'grommet';
import { Menu as MenuIcon, Close } from 'grommet-icons';

import { isSmall } from 'app/modernUI/theme';
import { useMode } from 'app/common/state/shortcuts';
import { ConnectionButton } from 'app/modernUI/components';
import { MenuItem } from './blocks';

import sunIcon from '../../images/sunIcon.svg';
import moonIcon from '../../images/moonIcon.svg';

const Drop = () => {
  const { isLightMode, mode, setMode, toggleMode } = useMode();
  return (
    <Layer
      background="transparent"
      margin={{ top: 'large' }}
      full
      responsive={true}
      // onEsc={toggleForm}
      // onClickOutside={toggleForm}
    >
      <Box
        fill
        round="none"
        overflow="auto"
        align="start"
        justify="start"
        gap="small"
        direction="column"
        background="modal"
        pad={{ vertical: 'medium', horizontal: 'medium' }}
      >
        <MenuItem />
      </Box>
    </Layer>
  );
};

export const Menu = ({ ...rest }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => {
    setIsModalOpen(prev => !prev);
  };
  const { isLightMode, toggleMode } = useMode();
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <>
          <Box
            direction="row"
            gap={isSmall(size) ? 'medium' : 'small'}
            align="center"
            style={{ flex: 1 }}
            justify="end"
          >
            {((isSmall(size) && isModalOpen) || !isSmall(size)) && (
              <ConnectionButton />
            )}
            {((isSmall(size) && !isModalOpen) || !isSmall(size)) && (
              <Button
                plain
                onClick={() => {
                  toggleMode();
                }}
              >
                <Avatar
                  align="center"
                  margin="none"
                  src={isLightMode ? sunIcon : moonIcon}
                  size="small"
                  justify="center"
                />
              </Button>
            )}
            {isSmall(size) && (
              <Button plain alignSelf="center" onClick={toggleModal} {...rest}>
                <Box align="center">
                  {isModalOpen ? (
                    <Close size="large" />
                  ) : (
                    <MenuIcon size="large" />
                  )}
                </Box>
              </Button>
            )}
          </Box>
          {isModalOpen && <Drop />}
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
