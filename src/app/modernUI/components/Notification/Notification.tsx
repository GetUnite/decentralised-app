import { Box, Text } from 'grommet';
import { useRecoilState } from 'recoil';
import { notification } from 'app/common/state/atoms';

export const Notification = ({ ...rest }) => {
  const [notificationAtom] = useRecoilState(notification);

  const colors = { success: 'success', error: 'error', info: 'info' };
  const bgColors = {
    success: 'successSoft',
    error: 'errorSoft',
    info: 'infoSoft',
  };
  const backgroundColor = bgColors[notificationAtom.type] || "transparent";
  const color = colors[notificationAtom.type];

  return (
    <Box
      background={backgroundColor}
      fill="horizontal"
      height="48px"
      justify="center"
      align="center"
      {...rest}
    >
      <Text textAlign="center" color={color}>
        {notificationAtom.message}
      </Text>
    </Box>
  );
};
