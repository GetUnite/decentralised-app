import { mode, walletAccount, walletDomain } from 'app/common/state/atoms';
import { useConnectionButton } from 'app/common/state/components';
import { isSmall, theme } from 'app/modernUI/theme';
import { Button, Grommet, ResponsiveContext } from 'grommet';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

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
  const [walletDomainAtom] = useRecoilState(walletDomain);
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
          style={{ background: 'transparent'}}
        >
          <StyledButton
            size={isSmall(size) ? 'small' : undefined}
            label={
              walletAccountAtom
                ? 
                walletDomainAtom != null
                  ?
                  'Connected: ' +
                  walletDomainAtom
                  : 'Connected: ' +
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
