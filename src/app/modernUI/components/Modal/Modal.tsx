import { EChain } from 'app/common/constants/chains';
import { useMode, useNotification } from 'app/common/state';
import { ENotificationId, walletAccount } from 'app/common/state/atoms';
import { ChainBadge, ConnectionButton, Spinner } from 'app/modernUI/components';
import { Box, Button, Text } from 'grommet';
import { FormClose } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

interface IModal {
  chain: EChain;
  heading: any;
  isLoading?: boolean;
  showChainBadge?: boolean;
  notificationId?: ENotificationId;
  children?: React.ReactNode;
  noHeading?: boolean;
  closeAction?: Function;
}

export const Modal = ({
  chain,
  heading,
  isLoading = false,
  showChainBadge = true,
  children = null,
  noHeading = false,
  closeAction,
}: IModal) => {
  const { isLightMode } = useMode();
  const { resetNotification } = useNotification();
  const navigate = useNavigate();
  const closeModal = () => {
    resetNotification();
    navigate('/');
  };

  const [walletAccountAtom] = useRecoilState(walletAccount);

  return (
    <Box justify="center" align="center">
      <Box
        round={'medium'}
        overflow="auto"
        width="medium"
        align="start"
        justify="between"
        gap="small"
        direction="column"
        background="modal"
        pad={
          walletAccountAtom
            ? { top: 'medium', horizontal: 'medium' }
            : { vertical: 'medium', horizontal: 'medium' }
        }
        style={isLightMode ? { border: '1px solid #EBEBEB' } : {}}
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
              <Box
                direction="row"
                fill="horizontal"
                justify="between"
                align="center"
              >
                <Text size="24px" weight={600}>{heading}</Text>
                <Box direction="row" gap="small" align="end">
                  {showChainBadge && <ChainBadge chain={chain} />}
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
              <Box
                margin={{ vertical: 'large' }}
                direction="row"
                justify="center"
              >
                <ConnectionButton />
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
