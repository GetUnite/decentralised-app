import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ResponsiveContext,
  Box,
  Nav,
  Image,
} from 'grommet';
import { Down } from 'grommet-icons';

import { MenuItem } from '../Menu/blocks';
import { useMode, useAlluoPrice } from 'app/common/state/shortcuts';
import { isSmall } from 'app/modernUI/theme';

import { Menu, Notification } from 'app/modernUI/components';

import logo from '../../images/logo.png';
import logoDark from '../../images/logo-dark.svg';
import logoIcon from '../../images/logoIcon.svg';
import logoIconDark from '../../images/logoIcon-dark.svg';
import { modernUiPaths } from 'app/common/hooks';

export const Layout = ({ children, notificationId = null, ...rest }) => {
  const { alluoPriceAtom, setAlluoPriceAtom, fetchAlluoPrice } =
    useAlluoPrice(true);
  const navigate = useNavigate();
  const { isLightMode, mode, setMode, toggleMode } = useMode();
  useEffect(() => {
    if (isLightMode) document.body.style.backgroundColor = 'white';
    else document.body.style.backgroundColor = 'black';
  }, [isLightMode]);
  return (
    <ResponsiveContext.Consumer>
      {size => (
        <>
          <Box
            fill="horizontal"
            style={{
              position: 'fixed',
              top: 'top',
              bottom: 'bottom',
              left: 'left',
              right: 'right',
              height: '100vh',
              zIndex: '-1',
            }}
          />
          <Box
            fill
            background="container"
            style={{ minHeight: '100vh' }}
            overflow="auto"
            align="center"
            flex="grow"
          >
            <Box align="center" justify="center" fill="horizontal">
              <Nav
                background="bg"
                align="center"
                justify="between"
                flex={false}
                direction="row"
                pad={{ horizontal: 'medium', vertical: 'small' }}
                gap="none"
                fill
              >
                <Box direction="row" align="end" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <Link to={modernUiPaths.MAIN}>
                      <Image
                        src={
                          isLightMode
                            ? isSmall(size)
                              ? logoIcon
                              : logo
                            : isSmall(size)
                            ? logoIconDark
                            : logoDark
                        }
                        fit="contain"
                        height={31}
                      />
                    </Link>
                  </div>
                </Box>
                {isSmall(size) || (
                  <MenuItem
                    direction="row"
                    gap="large"
                    align="center"
                    justify="center"
                    style={{ flex: 1 }}
                  />
                )}

                <Menu />
              </Nav>
            </Box>
            <Notification id={notificationId} />
            <Box
              width="xlarge"
              pad={{ horizontal: 'medium', vertical: 'medium' }}
              style={{marginTop: "60px"}}
            >
              {children}
            </Box>
          </Box>
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
