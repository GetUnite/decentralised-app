import { EChain } from 'app/common/constants/chains';
import { shuffleArray, toExactFixed } from 'app/common/functions/utils';
import { useCurrentPath } from 'app/common/hooks';
import { useMode, useNotification } from 'app/common/state';
import { walletAccount } from 'app/common/state/atoms';
import { useConnectionButton } from 'app/common/state/components';
import { ChainBadge, TokenIcon } from 'app/modernUI/components';
import swap from 'app/modernUI/images/swap.svg';
import { isSmall } from 'app/modernUI/theme';
import { Box, Button, Card, Grid, ResponsiveContext, Text } from 'grommet';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
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
  type?: string;
  name: string;
  totalAssetSupply: string | number;
  interest: string | number;
  isLoading: any;
  sign: string;
  icons: string[];
  disabled: boolean;
  chain: EChain;
  isBoost: boolean;
  viewType: string;
  balance?: string;
  balanceInUSD?: string;
  poolShare?: number;
}

export const FarmCard = ({
  id,
  type,
  name,
  totalAssetSupply,
  interest,
  balance,
  balanceInUSD,
  isLoading,
  sign,
  icons,
  disabled,
  chain,
  isBoost = false,
  viewType,
  poolShare,
  ...rest
}: IFarmCard) => {
  const { isLightMode } = useMode();
  const { navigate } = useCurrentPath();
  const { setNotification } = useNotification();
  const { handleConnectWallet } = useConnectionButton();

  const [walletAccountAtom] = useRecoilState(walletAccount);

  const tvl = isLoading
    ? 'Loading...'
    : sign + toExactFixed(totalAssetSupply, 2);

  const [isHover, setIsHover] = useState<boolean>(false);

  const hoverColor = isLightMode ? '#F4F8FF' : '#4C4C4C40';
  const dividerColor = isLightMode ? '#EBEBEB' : '#999999';

  // for showing supported tokens icons
  const [seeAllSupportedTokens, setSeeAllSupportedTokens] =
    useState<boolean>(false);
  const [shuffledIcons] = useState(
    Array.isArray(icons) ? shuffleArray(icons.slice(2, icons.length)) : [],
  );
  const [randomIcon] = useState(shuffledIcons.pop());

  // for showing value in usd for non-usd farms
  const allowSwap = sign != '$';
  const [seeBalanceInUSD, setSeeBalanceInUSD] = useState<boolean>(false);

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <>
          {isSmall(size) ? (
            <Card
              onClick={() => {
                if (!disabled && !!walletAccountAtom) navigate('/farm/' + id);
                else setNotification('Connect your wallet', 'error');
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
            <Box
              pad={{ horizontal: '34px', vertical: 'none' }}
              style={{ borderTop: `0.5px solid ${dividerColor}` }}
              height="90px"
              align="center"
              justify="center"
              fill="horizontal"
              background={isHover ? hoverColor : ''}
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
            >
              <Grid
                fill="horizontal"
                rows="xxsmall"
                align="center"
                columns={
                  viewType != 'View my farms only'
                    ? ['250px', '200px', '155px', '155px', '105px', 'auto']
                    : [
                        '220px',
                        '155px',
                        '155px',
                        '155px',
                        '145px',
                        '105px',
                        'auto',
                      ]
                }
                pad={{ top: '10px', bottom: '10px' }}
                style={{ fontSize: '16px' }}
              >
                {isLoading ? (
                  <>
                    <Skeleton count={1} height="14px" width="76px" />
                    <Skeleton count={1} height="14px" width="76px" />
                    <Skeleton count={1} height="14px" width="76px" />
                    <Skeleton count={1} height="14px" width="76px" />
                    <Skeleton count={1} height="14px" width="76px" />
                    {viewType == 'View my farms only' && (
                      <Skeleton count={1} height="14px" width="76px" />
                    )}
                    <Box direction="row" justify="end" fill align="center">
                      <Skeleton count={1} height="14px" width="76px" />
                    </Box>
                  </>
                ) : (
                  <>
                    {viewType != 'View my farms only' ? (
                      <>
                        <span style={{ fontWeight: 'bold' }}>
                          {name}
                          {isBoost && (
                            <span style={{ color: '#1C1CFF' }}> BOOST</span>
                          )}
                        </span>
                        <Box direction="row" gap="small" align="center">
                          {icons.length < 4 || seeAllSupportedTokens ? (
                            <>
                              {icons.length > 3 ? (
                                <Button
                                  onClick={() =>
                                    setSeeAllSupportedTokens(
                                      !seeAllSupportedTokens,
                                    )
                                  }
                                >
                                  <Box align="center" direction="row">
                                    {icons.map((icon, i) => (
                                      <TokenIcon
                                        key={i}
                                        label={icon}
                                        size={24}
                                        style={
                                          i > 0 ? { marginLeft: '-0.4rem' } : {}
                                        }
                                      />
                                    ))}
                                  </Box>
                                </Button>
                              ) : (
                                <>
                                  {icons.map((icon, i) => (
                                    <TokenIcon
                                      key={i}
                                      label={icon}
                                      size={24}
                                      style={
                                        i > 0 ? { marginLeft: '-0.4rem' } : {}
                                      }
                                    />
                                  ))}
                                </>
                              )}
                            </>
                          ) : (
                            <Button
                              onClick={() =>
                                setSeeAllSupportedTokens(!seeAllSupportedTokens)
                              }
                            >
                              <Box align="center" direction="row">
                                {icons.slice(0, 2).map((icon, i) => (
                                  <TokenIcon
                                    key={i}
                                    label={icon}
                                    size={24}
                                    style={
                                      i > 0 ? { marginLeft: '-0.4rem' } : {}
                                    }
                                  />
                                ))}
                                <TokenIcon
                                  key={2}
                                  label={randomIcon}
                                  size={24}
                                  style={{ marginLeft: '-0.4rem' }}
                                />
                                <Text size="18px">...</Text>
                              </Box>
                            </Button>
                          )}
                        </Box>
                        <ChainBadge chain={chain} />
                        <span>{tvl}</span>
                        <span>
                          {toExactFixed(interest, 2).toLocaleString()}%
                        </span>
                        <Box justify="end">
                          {walletAccountAtom ? (
                            <Link
                              to={(isBoost ? '/boostfarm/' : '/farm/') + id}
                              style={{
                                display: 'flex',
                                justifyContent: 'end',
                                textDecoration: 'none',
                              }}
                            >
                              <Button label={'Farm'}></Button>
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
                          {isBoost && (
                            <span style={{ color: '#1C1CFF' }}> BOOST</span>
                          )}
                        </span>
                        <ChainBadge chain={chain} />
                        <span>{poolShare}%</span>
                        <span>{tvl}</span>
                        <Box direction="row" gap="4px">
                          {seeBalanceInUSD
                            ? `$${toExactFixed(balanceInUSD, 4)}`
                            : `${sign}${toExactFixed(balance, 4)}`}
                          {allowSwap && (
                            <>
                              <Button
                                onClick={() =>
                                  setSeeBalanceInUSD(!seeBalanceInUSD)
                                }
                              >
                                <Box justify="center" fill>
                                  <img src={swap} />
                                </Box>
                              </Button>
                            </>
                          )}
                        </Box>
                        <span>{toExactFixed(interest, 2)}%</span>
                        <Box justify="end" fill>
                          <Link
                            to={(isBoost ? '/boostfarm/' : '/farm/') + id}
                            style={{
                              display: 'flex',
                              justifyContent: 'end',
                              textDecoration: 'none',
                            }}
                          >
                            <Box justify="end" fill>
                              <Button label={'Farm'} />
                            </Box>
                          </Link>
                        </Box>
                      </>
                    )}
                  </>
                )}
              </Grid>
            </Box>
          )}
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
