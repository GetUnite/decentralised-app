import { isSafeApp } from 'app/common/state/atoms';
import { Box, Text } from 'grommet';
import { useRecoilState } from 'recoil';
import { RightAlignToggle } from '../Toggles';
import { Tooltip } from '../Tooltips';
import { Info } from './Info';

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
    <Info label="Gas fee" value={null} border={false} isLoading={isLoading}>
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
                      style={{ textDecoration: 'underline', marginLeft: '5px' }}
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
    </Info>
  );
};
