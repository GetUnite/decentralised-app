import { theme as modernUITheme } from 'app/modernUI/theme';
import { Box, Button, Grommet, Image, Text } from 'grommet';
import discord from '../../images/discord.svg';
import medium from '../../images/medium.svg';
import notSupported from '../../images/notSupported.svg';
import proLogo from '../../images/proLogo.svg';
import telegram from '../../images/telegram.svg';
import twitter from '../../images/twitter.svg';

export const Mobile = ({ setUseWebApp }) => {
  return (
    <Grommet theme={modernUITheme}>
      <Box gap="30px" pad={{ vertical: '20px' }}>
        <Box justify="center" fill direction="row">
          <Image src={proLogo} width="130px" />
        </Box>
        <Image src={notSupported} fit="contain" />
        <Box gap="8px" fill pad={{ horizontal: '30px' }}>
          <Text size="20px" weight={700} textAlign="center">
            Alluo Pro isn’t fully supported on mobile just yet...
          </Text>
          <Text size="16px" weight={500} textAlign="center">
            Visit app.alluo.finance from your desktop for the full experience
          </Text>
        </Box>
        <Box gap="8px" fill justify="center" direction="row">
          <Button
            primary
            label="Continue anyway"
            onClick={() => setUseWebApp(true)}
            style={{ borderRadius: '58px', width: '174px' }}
          />
        </Box>
        <Box direction="row" gap="45px" justify="center">
          <a
            target="_blank"
            href="https://discord.com/invite/RgprRgdRTD"
            rel="noreferrer"
          >
            <Image src={discord} width="18px" />
          </a>
          <a href="https://blog.alluo.io/" target="_blank" rel="noreferrer">
            <Image src={medium} width="18px" />
          </a>
          <a
            href="https://twitter.com/AlluoApp"
            target="_blank"
            rel="noreferrer"
          >
            <Image src={twitter} width="18px" />
          </a>
          <a
            href="https://t.me/+Ir2-mWe8fQhhNzQ0"
            target="_blank"
            rel="noreferrer"
          >
            <Image src={telegram} width="18px" />
          </a>
        </Box>
      </Box>
    </Grommet>
  );
};
