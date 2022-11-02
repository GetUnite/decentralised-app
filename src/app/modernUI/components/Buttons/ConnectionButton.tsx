import { useRecoilState } from 'recoil';
import styled from 'styled-components';
import { Grommet, ResponsiveContext, Button } from 'grommet';
import { isSmall, theme } from 'app/modernUI/theme';
import { useConnectionButton } from 'app/common/state/components';
import { walletAccount, mode } from 'app/common/state/atoms';
import { connectToWallet } from 'app/common/functions/Web3Client';
import { useEffect, useState } from 'react';

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
  const walletAddress =  connectToWallet();
  const [label, setLabel] = useState('')
  const [domain, setDomain] = useState('')
  useEffect(() => {
    (async () => {
     if (walletAddress) {
      await walletAddress.then(response =>{
        setDomain(response && response.domain ? response.domain: '')
        setLabel(response && response.label ? response.label: '')
       })
    }
    })();
  
  }, [walletAddress]);

  useEffect(() => {
    (async () => {
     if (walletAddress) {
      await walletAddress.then(response =>{
        setDomain(response && response.domain ? response.domain: '')
        setLabel(response && response.label ? response.label: '')
       })
    }
    })();
  
  }, []);

  const [modeAtom] = useRecoilState(mode);
  const [walletAccountAtom] = useRecoilState(walletAccount);
  const { handleConnectWallet } = useConnectionButton();
  let updatedWalletAccountAtom : any;

  if(typeof walletAccountAtom === 'object' && label === ''){
    updatedWalletAccountAtom = walletAccountAtom && walletAccountAtom!== null &&  walletAccountAtom.walletAddress ? walletAccountAtom.walletAddress : null
  }
  else{
    updatedWalletAccountAtom = walletAccountAtom
  }

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
          {(label === 'Unstoppable' && <StyledButton
            size={isSmall(size) ? 'small' : undefined}
            label={walletAccountAtom
              ? 'Connected: ' +
              domain
              : 'Connect your wallet'
            }
            primary={!walletAccountAtom}
            onClick={handleConnectWallet}
            {...rest}
          /> )}
          {(label !== 'Unstoppable' && <StyledButton
          size={isSmall(size) ? 'small' : undefined}
          label={updatedWalletAccountAtom && updatedWalletAccountAtom !== null && updatedWalletAccountAtom !=='null'
            ? ('Connected: ' +
            updatedWalletAccountAtom.substring(0, 6) +
            '...' +
            updatedWalletAccountAtom.substring(updatedWalletAccountAtom.length - 4)
            ) : 'Connect your wallet'
          }
          primary={!walletAccountAtom}
          onClick={handleConnectWallet}
          {...rest}
        />
          )}
        </Grommet>
      )}
    </ResponsiveContext.Consumer>
  );
};
