import { Avatar, Box, Button, Layer, ResponsiveContext } from 'grommet';
import { Close, Menu as MenuIcon } from 'grommet-icons';
import { useState } from 'react';

import { useMode } from 'app/common/state';
import { ConnectionButton } from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import { MenuItem } from './blocks';

import moonIcon from '../../images/moonIcon.svg';
import sunIcon from '../../images/sunIcon.svg';

const Drop = () => {
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
            {!isSmall(size) && (
              <a
                href="https://alluo.com/about"
                target="_blank"
                style={{
                  color: isLightMode ? 'black' : 'white',
                  textDecoration: 'none',
                  fontSize: '14px',
                  marginRight: '34px'
                }}
              >
                About Alluo
              </a>
            )}
            {!isSmall(size) && <ConnectionButton />}
            {isSmall(size) && isModalOpen && (
              <Button
                plain
                onClick={() => {
                  toggleModal();
                }}
              >
                <ConnectionButton />
              </Button>
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
