import { useState, useEffect } from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import styled from 'styled-components';
import {
  Grommet,
  ResponsiveContext,
  Layer,
  Box,
  Spinner,
  Button,
  Heading,
  Text,
} from 'grommet';

import { CircleInformation, FormClose } from 'grommet-icons';

import { isSmall, theme } from 'app/modernUI/theme';
import { useConnection } from 'app/common/state/shortcuts';
import { walletAccount, mode } from 'app/common/state/atoms';

import metamaskIcon from 'app/modernUI/images/metamaskIcon.svg';
import walletConnectIcon from 'app/modernUI/images/walletConnectIcon.svg';

const StyledButton = styled(Button)`
  ${props =>
    props.size === 'small'
      ? `font-size: 12px;
  padding: 6px 7px;
  border-radius: 8px;
  `
      : ``}
`;

const Wallets = ({ setShowInfo, setIsModalOpen }) => {
  const {
    walletName,
    handleConnectMetamask,
    handleConnectWaletConnect,
    resetAndChangeWallet,
  } = useConnection(setIsModalOpen);
  return (
    <>
      <Box direction="column" justify="between" align="center" fill>
        <Box
          fill
          direction="column"
          justify="center"
          align="center"
          gap="small"
          margin={{ top: 'large' }}
        >
          <Button
            secondary
            onClick={handleConnectMetamask}
            size="large"
            fill="horizontal"
            label={
              <Box
                direction="row"
                align="center"
                gap="small"
                pad={{ horizontal: 'xsmall' }}
              >
                <img src={metamaskIcon} />
                <Text weight="normal" size="large">
                  MetaMask
                </Text>
              </Box>
            }
          />
          <Button
            secondary
            onClick={handleConnectWaletConnect}
            size="large"
            fill="horizontal"
            label={
              <Box
                direction="row"
                align="center"
                gap="small"
                pad={{ horizontal: 'xsmall' }}
              >
                <img src={walletConnectIcon} />
                <Text weight="normal" size="large">
                  WalletConnect
                </Text>
              </Box>
            }
          />
        </Box>
        <Box
          fill
          direction="row"
          justify="start"
          align="center"
          margin={{ top: 'large' }}
        >
          <Button plain size="small" onClick={() => setShowInfo(true)}>
            <Box direction="row" align="center" gap="xxsmall">
              <CircleInformation size="medium" />
              <Text size="small">What is this?</Text>
            </Box>
          </Button>
        </Box>
      </Box>
    </>
  );
};

const WhatIsThis = ({ setShowInfo }) => {
  return (
    <Box
      direction="column"
      justify="center"
      align="center"
      fill
      margin={{ vertical: 'medium' }}
      gap="small"
    >
      <Box gap="xsmall">
        <Text size="large">What is a crypto wallet and why do I need one?</Text>
        <Text size="medium">
          A crypto wallet is a secure digital wallet for your cryptocurrency.
          They keep your private keys, which are the passwords that give you
          secure access to your cryptocurrencies, so you can safely send and
          receive cryptocurrencies. If you’ve never used a wallet before, we
          suggest you use the most popular non-custodial wallet, MetaMask.
        </Text>
      </Box>
      <Box direction="row" fill="horizontal">
        <Button
          primary
          size="small"
          label="Got it!"
          onClick={() => setShowInfo(false)}
        />
      </Box>
    </Box>
  );
};

export const ConnectionModal = ({ ...rest }) => {
  const [modeAtom] = useRecoilState(mode);
  const [walletAccountAtom, setWalletAccountAtom] =
    useRecoilState(walletAccount);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { resetAndChangeWallet } = useConnection(setIsModalOpen);
  const [showInfo, setShowInfo] = useState(false);
  const toggleModal = () => {
    setIsModalOpen(prev => !prev);
    setShowInfo(false);
    resetAndChangeWallet();
  };

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <>
          <Grommet
            theme={{
              ...theme,
              layer: { overlay: { background: 'rgba(0, 0, 0, 0.5)' } },
            }}
            themeMode={modeAtom}
            style={{background:"transparent"}}
          >
            <StyledButton
              size={isSmall(size) ? 'small' : undefined}
              label={
                walletAccountAtom
                  ? 'Connected: ' +
                    walletAccountAtom.substring(0, 6) +
                    '...' +
                    walletAccountAtom.substring(walletAccountAtom.length - 4)
                  : 'Connect your wallet'
              }
              primary={!walletAccountAtom}
              onClick={toggleModal}
              {...rest}
            />
            {isModalOpen && (
              <Layer
                background="transparent"
                onEsc={toggleModal}
                onClickOutside={toggleModal}
              >
                <Box
                  fill={isSmall(size)}
                  round="medium"
                  overflow="auto"
                  width="medium"
                  style={{ minHeight: 389 }}
                  align="start"
                  justify="start"
                  gap="small"
                  direction="column"
                  alignSelf="center"
                  background="modal"
                  pad={{ vertical: 'medium', horizontal: 'medium' }}
                >
                  <Box
                    direction="row"
                    justify="between"
                    align="center"
                    fill={isSmall(size) ? 'horizontal' : true}
                  >
                    <Heading size="small" level={3} margin="none" fill>
                      Connect a wallet
                    </Heading>
                    <Button plain fill="vertical" onClick={toggleModal}>
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
                  <Box fill>
                    {showInfo ? (
                      <WhatIsThis setShowInfo={setShowInfo} />
                    ) : (
                      <Wallets
                        setShowInfo={setShowInfo}
                        setIsModalOpen={setIsModalOpen}
                      />
                    )}
                  </Box>
                </Box>
              </Layer>
            )}
          </Grommet>
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
