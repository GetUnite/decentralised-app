import { EChain } from 'app/common/constants/chains';
import { notification } from 'app/common/state/atoms';
import { Box, Text } from 'grommet';
import { useRecoilState } from 'recoil';

export const Notification = ({ ...rest }) => {
  const [notificationAtom] = useRecoilState(notification);

  const colors = { success: 'success', error: 'error', info: 'info' };
  const bgColors = {
    success: 'successSoft',
    error: 'errorSoft',
    info: 'infoSoft',
  };
  const backgroundColor = bgColors[notificationAtom.type] || 'transparent';
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
            style={{color: color}}
          >
            View transaction
          </a>
        </Text>
      )}
    </Box>
  );
};
