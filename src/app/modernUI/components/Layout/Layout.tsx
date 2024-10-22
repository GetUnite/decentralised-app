import { modernUiPaths } from 'app/common/hooks';
import { useMode } from 'app/common/state';
import { notification } from 'app/common/state/atoms';
import { Menu, Notification } from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import { Box, Footer, Image, Nav, ResponsiveContext, Text } from 'grommet';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import appStore from '../../images/appStore.svg';
import discordDark from '../../images/discord-dark.svg';
import discord from '../../images/discord.svg';
import googlePlay from '../../images/googlePlay.svg';
import logoDark from '../../images/logo-dark.svg';
import logo from '../../images/logo.svg';
import logoIconDark from '../../images/logoIcon-dark.svg';
import logoIcon from '../../images/logoIcon.svg';
import mediumDark from '../../images/medium-dark.svg';
import medium from '../../images/medium.svg';
import proLogoDark from '../../images/proLogo-dark.svg';
import proLogo from '../../images/proLogo.svg';
import telegramDark from '../../images/telegram-dark.svg';
import telegram from '../../images/telegram.svg';
import twitterDark from '../../images/twitter-dark.svg';
import twitter from '../../images/twitter.svg';
import { MenuItem } from '../Menu/blocks';

export const Layout = ({ children, notificationId = null, ...rest }) => {
  const { isLightMode } = useMode();
  const [notificationAtom] = useRecoilState(notification);

  useEffect(() => {
    if (isLightMode) document.body.style.backgroundColor = 'white';
    else document.body.style.backgroundColor = 'black';
  }, [isLightMode]);

  const dividerColor = isLightMode ? '#EBEBEB' : '#999999';

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <>
          <Box
            align="center"
            justify="start"
            fill="horizontal"
            height={
              isSmall(size)
                ? notificationAtom.message != ''
                  ? '108px'
                  : '60px'
                : notificationAtom.message != ''
                ? '148px'
                : '100px'
            }
            style={{ position: 'sticky', top: '0px', zIndex: 2 }}
          >
            <Nav
              background="bg"
              justify="between"
              flex={false}
              direction="row"
              pad={{ horizontal: 'medium', vertical: 'small' }}
              gap="none"
              fill="horizontal"
              height={isSmall(size) ? '60px' : '100px'}
              style={{justifyContent: isSmall(size) ? 'space-between' : ''}}
            >
              <Box direction="row" align="center" flex={!isSmall(size) ? true : false}>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Link to={modernUiPaths.MAIN}>
                    <Image
                      src={
                        isLightMode
                          ? isSmall(size)
                            ? logoIcon
                            : proLogo
                          : isSmall(size)
                          ? logoIconDark
                          : proLogoDark
                      }
                      fit="contain"
                      height={31}
                    />
                  </Link>
                </div>
              </Box>
              {!isSmall(size) && (
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
            {notificationAtom.message != '' && (
              <Notification id={notificationId} />
            )}
          </Box>
          <Box
            fill
            background="container"
            style={{ minHeight: '100vh' }}
            overflow="auto"
            flex="grow"
          >
            <Box align="center">
              <Box
                width="xlarge"
                pad={{ horizontal: 'medium', vertical: 'medium' }}
                style={{
                  marginTop: notificationAtom.message != '' ? '12px' : '60px',
                  marginBottom: '123px',
                  minHeight: '510px',
                }}
              >
                {children}
              </Box>
            </Box>
            <Footer
              direction="column"
              margin={{
                bottom: '80px',
                horizontal: isSmall(size) ? '' : '150px',
              }}
            >
              <Box
                direction={isSmall(size) ? 'column' : 'row'}
                justify={isSmall(size) ? 'center' : 'between'}
                pad={{ horizontal: isSmall(size) ? '20px' : '' }}
                fill
              >
                <Box
                  direction={'column'}
                  fill
                  justify={isSmall(size) ? 'center' : 'start'}
                  align={isSmall(size) ? 'center' : 'start'}
                >
                  <img width="137px" src={isLightMode ? logo : logoDark} />
                  <Box
                  fill
                    direction="row"
                    gap={isSmall(size) ? '' : '24px'}
                    margin={{ top: isSmall(size) ? '20px' : '40px' }}
                    justify={isSmall(size) ? 'around' : 'start'}
                  >
                    <a
                      href="https://apps.apple.com/us/app/alluo/id1604572992"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img src={appStore} width="155px" />
                    </a>
                    <a
                      href="https://play.google.com/store/apps/details?id=com.alluo"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img src={googlePlay} width="168px" />
                    </a>
                  </Box>
                </Box>
                <Box direction="row" gap="64px" justify={isSmall(size) ? 'center' : 'end'} margin={{top: isSmall(size) ? '20px' : ''}}>
                  <Box width="110px">
                    <Text size="14px" weight={700} margin={{ bottom: '38px' }}>
                      About us
                    </Text>
                    <a
                      href="https://alluo.com/about"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: isLightMode ? 'black' : 'white',
                        textDecoration: 'none',
                        fontSize: '14px',
                      }}
                    >
                      The team
                    </a>
                    <a
                      href="https://blog.alluo.com"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: isLightMode ? 'black' : 'white',
                        textDecoration: 'none',
                        fontSize: '14px',
                      }}
                    >
                      Blog
                    </a>
                    <a
                      href="https://vote.alluo.com/#/"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: isLightMode ? 'black' : 'white',
                        textDecoration: 'none',
                        fontSize: '14px',
                      }}
                    >
                      The vote
                    </a>
                  </Box>
                  <Box width="110px">
                    <Text size="14px" weight={700} margin={{ bottom: '38px' }}>
                      Social
                    </Text>
                    <a
                      href="https://discord.gg/alluo"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: isLightMode ? 'black' : 'white',
                        textDecoration: 'none',
                        fontSize: '14px',
                      }}
                    >
                      Discord
                    </a>
                    <a
                      href="https://www.linkedin.com/company/alluo/?"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: isLightMode ? 'black' : 'white',
                        textDecoration: 'none',
                        fontSize: '14px',
                      }}
                    >
                      LinkedIn
                    </a>
                    <a
                      href="https://twitter.com/AlluoApp"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: isLightMode ? 'black' : 'white',
                        textDecoration: 'none',
                        fontSize: '14px',
                      }}
                    >
                      Twitter
                    </a>
                    <a
                      href="https://t.me/alluoApp"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: isLightMode ? 'black' : 'white',
                        textDecoration: 'none',
                        fontSize: '14px',
                      }}
                    >
                      Telegram
                    </a>
                  </Box>
                  <Box width="110px">
                    <Text size="14px" weight={700} margin={{ bottom: '38px' }}>
                      Support
                    </Text>
                    <a
                      href="https://docs.alluo.com"
                      target="_blank"
                      style={{
                        color: isLightMode ? 'black' : 'white',
                        textDecoration: 'none',
                        fontSize: '14px',
                      }}
                    >
                      Developer docs
                    </a>
                  </Box>
                </Box>
              </Box>
              <Box
                direction={isSmall(size) ? 'column' : 'row'}
                justify={isSmall(size) ? 'center' : 'between'}
                align={isSmall(size) ? 'center' : 'between'}
                gap={isSmall(size) ? '20px' : ''}
                fill
                pad={{ top: isSmall(size) ? '20px' : '50px'}}
                style={{ borderTop: `2px solid ${dividerColor}` }}
              >
                <Box direction="row" gap="medium">
                  <a
                    target="_blank"
                    href="https://alluo-terms-of-service.s3.eu-west-2.amazonaws.com/Alluo+-+Terms+of+Service.pdf"
                    rel="noreferrer"
                    style={{
                      color: isLightMode ? 'black' : 'white',
                      textDecoration: 'none',
                      fontSize: '13px',
                    }}
                  >
                    Terms and Conditions
                  </a>
                  <a
                    target="_blank"
                    href="https://www.privacypolicies.com/live/dc166d48-be35-4e1f-9d02-2c3a786e705c"
                    rel="noreferrer"
                    style={{
                      color: isLightMode ? 'black' : 'white',
                      textDecoration: 'none',
                      fontSize: '13px',
                    }}
                  >
                    Privacy Policy
                  </a>
                </Box>
                <Box direction="row" gap="45px">
                  <a
                    target="_blank"
                    href="https://discord.com/invite/RgprRgdRTD"
                    rel="noreferrer"
                  >
                    <Image src={isLightMode ? discord : discordDark} />
                  </a>
                  <a
                    href="https://blog.alluo.io/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Image src={isLightMode ? medium : mediumDark} />
                  </a>
                  <a
                    href="https://twitter.com/AlluoApp"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Image src={isLightMode ? twitter : twitterDark} />
                  </a>
                  <a
                    href="https://t.me/+Ir2-mWe8fQhhNzQ0"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Image src={isLightMode ? telegram : telegramDark} />
                  </a>
                </Box>
              </Box>
            </Footer>
          </Box>
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
