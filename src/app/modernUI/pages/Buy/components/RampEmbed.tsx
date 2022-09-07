import { useLayoutEffect } from 'react';

import { useRecoilState } from 'recoil';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import { Box, Text } from 'grommet';

import { walletAccount } from 'app/common/state/atoms';
import { ConnectionModal } from 'app/modernUI/components';

const ENV = process.env.NODE_ENV;

export const RampEmbed = () => {
  const [walletAccountAtom, setWalletAccountAtom] = useRecoilState(
    walletAccount,
  );

  useLayoutEffect(() => {
    if (walletAccountAtom) {
      setTimeout(() => {
        let widget = new RampInstantSDK({
          hostAppName: 'Alluo',
          hostLogoUrl:
            'https://assets.website-files.com/613b4c4a426c9b2c4d31caaa/6168135b36da4560d493f4d3_Group%20242.png',
          url:
            ENV === 'development'
              ? 'https://ri-widget-staging.firebaseapp.com'
              : undefined,
          userAddress: walletAccountAtom,
          variant: 'embedded-mobile',
          containerNode: document.getElementById('ramp-container'),
          defaultAsset: 
          ENV === 'development'
            ? 'TEST_DAI'
            : 'MATIC_DAI',
          fiatValue: '100',
          hostApiKey:
            ENV === 'development'
              ? process.env.REACT_APP_RAMP_KEY_TEST
              : process.env.REACT_APP_RAMP_KEY,
        });
        widget.show();
      }, 1000);
    }
  }, [walletAccountAtom]);

  if (!walletAccountAtom) {
    return (
      <Box margin={{ top: 'large' }}>
        <Text textAlign="center" weight="bold">
          <ConnectionModal />
        </Text>
      </Box>
    );
  }
  return (
    <div
      style={{
        overflowY: 'auto',
        width: '100%',
        minWidth: 400,
        height: '100%',
        padding: '0',
        marginTop: 16,
      }}
    >
      <div
        style={{ width: '100%', minWidth: 320, height: 667 }}
        id="ramp-container"
      ></div>
    </div>
  );
};
