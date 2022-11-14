import { EChain } from 'app/common/constants/chains';
import { toExactFixed } from 'app/common/functions/utils';
import { useCurrentPath } from 'app/common/hooks';
import { ENotificationId, useNotification } from 'app/common/state';
import { TFarmDepositCoinType, walletAccount } from 'app/common/state/atoms';
import { useConnectionButton } from 'app/common/state/components';
import { ChainBadge, TokenIcon } from 'app/modernUI/components';
import { isSmall } from 'app/modernUI/theme';
import { Box, Button, Card, Grid, ResponsiveContext, Text } from 'grommet';
import { Link } from 'react-router-dom';
import { useRecoilState } from 'recoil';

const Disabled = () => {
  return (
    <Box
      background="rgba(0,0,0,.7)"
      justify="center"
      align="center"
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
    >
      <Text size="xlarge">Coming soon...</Text>
    </Box>
  );
};

interface IFarmCard {
  id: number;
  type?: TFarmDepositCoinType;
  name: string;
  totalAssetSupply: string | number;
  interest: string | number;
  isLoading: any;
  sign: string;
  icons: Array<{ src: string }>;
  disabled: boolean;
  chain: EChain;
  isBooster: boolean;
  viewType: string;
  balance?: string;
  poolShare?: number;
}

export const FarmCard = ({
  id,
  type,
  name,
  totalAssetSupply,
  interest,
  balance,
  isLoading,
  sign,
  icons,
  disabled,
  chain,
  isBooster = false,
  viewType,
  poolShare,
  ...rest
}: IFarmCard) => {
  const { navigate } = useCurrentPath();
  const { setNotification } = useNotification();
  const { handleConnectWallet } = useConnectionButton();

  const [walletAccountAtom] = useRecoilState(walletAccount);

  const tvl = isLoading
    ? 'Loading...'
    : sign + (+toExactFixed(totalAssetSupply, 2))?.toLocaleString();

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <>
          {isSmall(size) ? (
            <Card
              onClick={() => {
                if (!disabled && !!walletAccountAtom) navigate('/farm/' + id);
                else
                  setNotification({
                    id: ENotificationId.ASSET_CARD,
                    type: 'error',
                    message: 'Connect your wallet',
                  });
              }}
              style={{ position: 'relative' }}
              pad={{ horizontal: 'medium', vertical: 'medium' }}
              margin={{ top: 'small' }}
              height="fit"
              background="card"
              align="center"
              justify="center"
              fill="horizontal"
            >
              {disabled && <Disabled />}
              <Box fill direction="row" justify="between">
                <Box>
                  <Box direction="row" gap="small">
                    {icons.map((icon, i) => (
                      <TokenIcon key={i} label={icon} />
                    ))}
                  </Box>
                  <Box pad="none" margin={{ top: 'medium' }}>
                    <Text>Asset</Text>
                    <Text size="xlarge" weight="bold">
                      {name}
                    </Text>
                  </Box>
                </Box>
                <Box>
                  <Box align="end">
                    <ChainBadge chain={chain} />
                  </Box>
                  <Box pad="none" margin={{ top: 'medium' }} align="end">
                    <Text>APY</Text>
                    <Text size="xlarge" weight="bold">
                      {interest}%
                    </Text>
                  </Box>
                  <Box pad="none" margin={{ top: 'medium' }} align="end">
                    <Text margin="none">TVL</Text>
                    <Text margin={{ top: '-5px' }}>{tvl}</Text>
                  </Box>
                </Box>
              </Box>
              <Box fill="horizontal" margin={{ top: 'medium' }} />
            </Card>
          ) : (
            <Card
              pad={{ horizontal: 'medium', vertical: 'none' }}
              margin={{ top: 'small' }}
              height="120px"
              background="card"
              align="center"
              justify="center"
              fill="horizontal"
            >
              <Grid
                fill="horizontal"
                rows="xxsmall"
                align="center"
                columns={{ size: 'xsmall', count: 'fit' }}
                pad={{ top: '10px', bottom: '10px' }}
                style={{ fontSize: '16px' }}
              >
                {viewType != 'your' ? (
                  <>
                    <span style={{ fontWeight: 'bold' }}>
                      {name}
                      {isBooster && (
                        <span style={{ color: '#1C1CFF' }}> BOOST</span>
                      )}
                    </span>
                    <Box direction="row" gap="small">
                      {icons.map((icon, i) => (
                        <TokenIcon key={i} label={icon} size={26} />
                      ))}
                    </Box>
                    <ChainBadge chain={chain} />
                    <span>{tvl}</span>
                    <Box direction="row" justify="between" align="center">
                      <span>{interest}%</span>
                      {walletAccountAtom ? (
                        <Link to={(isBooster ? '/boostfarm/' : '/farm/') + id}>
                          <Button label={'Farm'} />
                        </Link>
                      ) : (
                        <Button
                          style={{ borderWidth: '1px' }}
                          size={isSmall(size) ? 'small' : undefined}
                          label={'Connect wallet'}
                          onClick={handleConnectWallet}
                          {...rest}
                        />
                      )}
                    </Box>
                  </>
                ) : (
                  <>
                    <span style={{ fontWeight: 'bold' }}>
                      {name}
                      {isBooster && (
                        <span style={{ color: '#1C1CFF' }}> BOOST</span>
                      )}
                    </span>
                    <ChainBadge chain={chain} />
                    <span>{poolShare}%</span>
                    <span>{tvl}</span>
                    <span>{sign + balance}</span>
                    <Box direction="row" justify="between" align="center">
                      <span>{interest}%</span>
                      <Link to={(isBooster ? '/boostfarm/' : '/farm/') + id}>
                        <Button label={'Farm'} />
                      </Link>
                    </Box>
                  </>
                )}
              </Grid>
            </Card>
          )}
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
