import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContext,
  Box,
  Nav,
  Image,
  Footer,
} from 'grommet';
import { MenuItem } from '../Menu/blocks';
import { useMode } from 'app/common/state/shortcuts';
import { isSmall } from 'app/modernUI/theme';

import { Menu, Notification } from 'app/modernUI/components';

import logo from '../../images/logo.png';
import logoDark from '../../images/logo-dark.svg';
import logoIcon from '../../images/logoIcon.svg';
import logoIconDark from '../../images/logoIcon-dark.svg';
import discord from '../../images/discord.svg';
import discordDark from '../../images/discord-dark.svg';
import twitter from '../../images/twitter.svg';
import twitterDark from '../../images/twitter-dark.svg';
import medium from '../../images/medium.svg';
import mediumDark from '../../images/medium-dark.svg';
import telegram from '../../images/telegram.svg';
import telegramDark from '../../images/telegram-dark.svg';
import { modernUiPaths } from 'app/common/hooks';

export const Layout = ({ children, notificationId = null, ...rest }) => {
  const { isLightMode } = useMode();

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
              style={{ marginTop: '60px', marginBottom: '123px' }}
            >
              {children}
            </Box>
            <Footer direction="column" margin={{ bottom: '80px' }}>
              <Box direction="row" gap="large">
                <a target="_blank" href="https://discord.com/invite/RgprRgdRTD">
                  <Image src={isLightMode ? discord : discordDark} />
                </a>
                <a href="https://blog.alluo.io/" target="_blank">
                  <Image src={isLightMode ? medium : mediumDark} />
                </a>
                <a href='https://twitter.com/AlluoApp' target="_blank">
                  <Image src={isLightMode ? twitter : twitterDark} />
                </a>
                <a href='https://t.me/+Ir2-mWe8fQhhNzQ0' target="_blank">
                  <Image src={isLightMode ? telegram : telegramDark} />
                </a>
              </Box>
              <Box direction="row" gap="medium">
                <a
                  target="_blank"
                  href="https://alluo-terms-of-service.s3.eu-west-2.amazonaws.com/Alluo+-+Terms+of+Service.pdf"
                  style={{ color: isLightMode ? 'black' : 'white', textDecoration: 'none' }}
                >
                  Terms and Conditions
                </a>
                <a
                  target="_blank"
                  href="https://www.privacypolicies.com/live/dc166d48-be35-4e1f-9d02-2c3a786e705c"
                  style={{ color: isLightMode ? 'black' : 'white', textDecoration: 'none' }}
                >
                  Privacy Policy
                </a>
              </Box>
            </Footer>
          </Box>
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
