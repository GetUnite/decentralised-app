import { useRecoilState } from 'recoil';
import styled from 'styled-components';
import { Grommet, ResponsiveContext, Button } from 'grommet';
import { isSmall, theme } from 'app/modernUI/theme';
import { useConnectionButton } from 'app/common/state/components';
import { walletAccount, mode } from 'app/common/state/atoms';

const StyledButton = styled(Button)`
  ${props =>
    props.size === 'small'
      ? `font-size: 12px;
  padding: 6px 7px;
  border-radius: 8px;
  `
      : ``}
`;

export const ConnectionButton = ({ ...rest }) => {
  const [modeAtom] = useRecoilState(mode);
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const { handleConnectWallet } = useConnectionButton();

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Grommet
          theme={{
            ...theme,
            layer: { overlay: { background: 'rgba(0, 0, 0, 0.5)' } },
          }}
          themeMode={modeAtom}
          style={{ background: 'transparent' }}
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
            onClick={handleConnectWallet}
            {...rest}
          />
        </Grommet>
      )}
    </ResponsiveContext.Consumer>
  );
};
