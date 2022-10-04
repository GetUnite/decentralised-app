import { ENotificationId, walletAccount } from 'app/common/state/atoms';
import { useNotification } from 'app/common/state';
import { ChainBadge, ConnectionButton, Spinner } from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import { Box, Button, Heading, Text } from 'grommet';
import { FormClose } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { EChain } from 'app/common/constants/chains';

interface IModal {
  chain: EChain;
  heading: any;
  isLoading?: boolean;
  notificationId?: ENotificationId;
  children: React.ReactNode;
  noHeading?: boolean;
  closeAction?: Function;
}

export const Modal = ({
  chain,
  heading,
  isLoading = false,
  children,
  noHeading = false,
  closeAction,
}: IModal) => {
  const { resetNotification } = useNotification();
  const navigate = useNavigate();
  const closeModal = () => {
    resetNotification();
    navigate('/');
  };

  const [walletAccountAtom] = useRecoilState(walletAccount);

  return (
    <Box fill justify="center" align="center">
      <Box
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
            justify={!noHeading ? 'between' : 'end'}
            align="center"
            fill="horizontal"
            gap="small"
          >
            {!noHeading && (
              <Box direction="row" fill="horizontal" justify="between">
                <Heading size="small" level={3} margin="none">
                  <Box alignContent="between" direction="row" fill="horizontal">
                    {!isLoading && heading}
                  </Box>
                </Heading>
                <Box direction="row" gap="small" align="end">
                  {!isLoading && <ChainBadge chain={chain} />}
                </Box>
              </Box>
            )}
            <Button
              plain
              fill="vertical"
              onClick={() => (closeAction ? closeAction() : closeModal())}
            >
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
                <FormClose size="large" color="black" />
              </Box>
            </Button>
          </Box>
          <Box direction="column" fill="vertical" gap="small">
            {!walletAccountAtom ? (
              <Box margin={{ vertical: 'large' }}>
                <Text textAlign="center" weight="bold">
                  <ConnectionButton />
                </Text>
              </Box>
            ) : (
              <Box
                direction="column"
                fill="vertical"
                margin={{ vertical: 'medium' }}
                gap="small"
              >
                {isLoading ? (
                  <Box
                    align="center"
                    justify="center"
                    fill="vertical"
                    margin={{ top: 'large', bottom: 'medium' }}
                  >
                    <Spinner pad="large" />
                  </Box>
                ) : (
                  <>{children}</>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
