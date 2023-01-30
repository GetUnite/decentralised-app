import { isSafeApp } from 'app/common/state/atoms';
import { Box, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';
import { useRecoilState } from 'recoil';
import { RightAlignToggle } from '../Toggles';
import { Tooltip } from '../Tooltips';

export const FeeInfo = ({
  showWalletFee,
  biconomyToggle = true,
  useBiconomy = false,
  setUseBiconomy = null,
  disableBiconomy = false,
  isLoading = false,
  ...rest
}) => {
  const [isSafeAppAtom] = useRecoilState(isSafeApp);

  return (
    <Box direction="row" justify="between" pad="small">
      {isLoading ? (
        <Box height={!isSafeAppAtom && biconomyToggle ? "42" : "21px"} fill="horizontal">
          <Skeleton height="14px" borderRadius="20px" />
          {!isSafeAppAtom && biconomyToggle && (
            <Box fill justify="end" direction="row">
              <Box width="150px" height="23px">
                <Skeleton height="12px" borderRadius="20px" />
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        <>
          <Text size="14px" color="soul">
            Gas fee
          </Text>
          <Text size="14px">
            {' '}
            <div style={{ textAlign: 'right', fontSize: 'small' }}>
              {showWalletFee || isSafeAppAtom ? (
                <Text size="14px">View fee in your wallet</Text>
              ) : (
                <>
                  <Text size="14px">
                    No fees 🎉 - Paid for by Alluo via{' '}
                    <a href="https://twitter.com/biconomy" target="_blank">
                      Biconomy
                    </a>
                  </Text>
                </>
              )}
              {!isSafeAppAtom && biconomyToggle && (
                <Box margin={{ top: '9px' }}>
                  <RightAlignToggle
                    label={
                      <>
                        Turn {useBiconomy ? 'off' : 'on'}
                        <Tooltip
                          text="Turning off Biconomy means Alluo will no longer pay your
                    transaction fee."
                        >
                          <span
                            style={{
                              textDecoration: 'underline',
                              marginLeft: '5px',
                            }}
                          >
                            Biconomy
                          </span>
                        </Tooltip>
                      </>
                    }
                    isToggled={useBiconomy}
                    setIsToggled={setUseBiconomy}
                    disabled={disableBiconomy}
                  />
                </Box>
              )}
            </div>
          </Text>
        </>
      )}
    </Box>
  );
};
