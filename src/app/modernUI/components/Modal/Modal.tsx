import { EChain } from 'app/common/functions/Web3Client';
import { ENotificationId, walletAccount } from 'app/common/state/atoms';
import { useNotification } from 'app/common/state';
import {
  ChainBadge,
  ConnectionModal,
  Layout,
  Spinner,
} from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import { Box, Button, Heading, ResponsiveContext, Text } from 'grommet';
import { FormClose } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

interface IModal {
  size: any;
  chain: EChain;
  heading: any;
  isLoading?: boolean;
  notificationId?: ENotificationId;
  children: React.ReactNode;
}

export const Modal = ({
  size,
  chain,
  heading,
  isLoading = false,
  children,
}: IModal) => {
  const { resetNotification } = useNotification();
  const navigate = useNavigate();
  const toggleForm = () => {
    resetNotification();
    navigate('/');
  };

  const [walletAccountAtom] = useRecoilState(walletAccount);

  return (
    <Box fill justify="center" align="center">
      <Box
        margin={isSmall(size) ? 'none' : { vertical: 'small' }}
        round={'medium'}
        overflow="auto"
        width="medium"
        align="start"
        justify="between"
        gap="small"
        direction="column"
        background="modal"
        pad={{ vertical: 'medium', horizontal: 'medium' }}
      >
        <Box fill flex="grow" height="100vh">
          <Box
            direction="row"
            justify="between"
            align="center"
            fill="horizontal"
          >
            <Heading size="small" level={3} margin="none" fill>
              {!isLoading && heading}
            </Heading>
            <Box direction="row" gap="small" align="center">
              {!isLoading && <ChainBadge chain={chain} />}
              <Button plain fill="vertical" onClick={toggleForm}>
                <Box
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 32,
                    backgroundColor: 'rgba(42, 115, 255, 0.1)',
                  }}
                  justify="center"
                  align="center"
                >
                  <FormClose size="medium" />
                </Box>
              </Button>
            </Box>
          </Box>
          <Box
            direction="column"
            fill
            margin={{ top: 'medium' }}
            gap="small"
          >
            {!walletAccountAtom ? (
              <Box margin={{ vertical: 'large' }}>
                <Text textAlign="center" weight="bold">
                  <ConnectionModal />
                </Text>
              </Box>
            ) : isLoading ? (
              <Box
                align="center"
                justify="center"
                margin={{ top: 'large', bottom: 'medium' }}
              >
                <Spinner pad="large" />
              </Box>
            ) : (
              <>{children}</>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
