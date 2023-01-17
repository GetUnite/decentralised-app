import { useMode } from 'app/common/state';
import { Box, Image, Text } from 'grommet';
import discordDark from '../../images/discord-dark.svg';
import discord from '../../images/discord.svg';
import mediumDark from '../../images/medium-dark.svg';
import medium from '../../images/medium.svg';
import notSupported from '../../images/notSupported.svg';
import proLogoDark from '../../images/proLogo-dark.svg';
import proLogo from '../../images/proLogo.svg';
import telegramDark from '../../images/telegram-dark.svg';
import telegram from '../../images/telegram.svg';
import twitterDark from '../../images/twitter-dark.svg';
import twitter from '../../images/twitter.svg';

export const Mobile = () => {
  const { isLightMode } = useMode();

  return (
    <Box>
      <Box justify="center" pad={{ top: '20px' }} fill direction="row">
        <Image src={isLightMode ? proLogo : proLogoDark} width="130px" />
      </Box>
      <Image src={notSupported} fit="contain" />
      <Box gap="8px" fill pad={{horizontal:"30px"}}>
        <Text size="24px" weight={700} textAlign='center'>
          Alluo Pro is not supported on mobile just yet...
        </Text>
        <Text size="16px" weight={500} textAlign='center'>
          Visit app.alluo.finance from your desktop for the full experience
        </Text>
      </Box>
      <Box direction="row" gap="45px" margin={{top: "30px"}} justify="center">
        <a target="_blank" href="https://discord.com/invite/RgprRgdRTD" rel="noreferrer">
          <Image src={isLightMode ? discord : discordDark} />
        </a>
        <a href="https://blog.alluo.io/" target="_blank" rel="noreferrer">
          <Image src={isLightMode ? medium : mediumDark} />
        </a>
        <a href="https://twitter.com/AlluoApp" target="_blank" rel="noreferrer">
          <Image src={isLightMode ? twitter : twitterDark} />
        </a>
        <a href="https://t.me/+Ir2-mWe8fQhhNzQ0" target="_blank" rel="noreferrer">
          <Image src={isLightMode ? telegram : telegramDark} />
        </a>
      </Box>
    </Box>
  );
};
