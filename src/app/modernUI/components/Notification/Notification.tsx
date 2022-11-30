import { EChain } from 'app/common/constants/chains';
import { useMode, useNotification } from 'app/common/state';
import { notification } from 'app/common/state/atoms';
import { Box, Button, Text } from 'grommet';
import { FormClose } from 'grommet-icons';
import { useRecoilState } from 'recoil';

export const Notification = ({ ...rest }) => {
  const { isLightMode } = useMode();
  const [notificationAtom] = useRecoilState(notification);
  const { resetNotification } = useNotification();

  const colors = { success: 'success', error: 'error', info: 'info' };
  const bgColors = isLightMode ? {
    success: 'successSoft',
    error: 'errorSoft',
    info: 'infoSoft',
  } : {
    success: 'darkSuccessSoft',
    error: 'darkErrorSoft',
    info: 'darkInfoSoft',
  };
  const backgroundColor = bgColors[notificationAtom.type];
  const color = colors[notificationAtom.type];

  return (
    <Box
      background={backgroundColor}
      fill="horizontal"
      height="48px"
      justify="center"
      align="center"
      direction="row"
      {...rest}
    >
      <Text textAlign="center" color={color}>
        {notificationAtom.message}
      </Text>
      {notificationAtom.txHash && (
        <Text textAlign="center" color={color}>
          .{' '}
          <a
            target="_blank"
            href={
              notificationAtom.chain == EChain.POLYGON
                ? `https://polygonscan.com/tx/${notificationAtom.txHash}`
                : `https://etherscan.io/tx/${notificationAtom.txHash}`
            }
            style={{ color: color }}
          >
            View transaction
          </a>
        </Text>
      )}
      {!notificationAtom.stick && (
        <Button
          plain
          fill="vertical"
          onClick={resetNotification}
          style={{
            position: 'absolute',
            right: '20px',
          }}
        >
          <Box
            style={{
              width: 16,
              height: 16,
              borderRadius: 16,
            }}
            justify="center"
            align="center"
          >
            <FormClose size="medium" color="black" />
          </Box>
        </Button>
      )}
    </Box>
  );
};
