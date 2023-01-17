import { isSafeApp } from 'app/common/state/atoms';
<<<<<<< HEAD
import { Text } from 'grommet';
import { useRecoilState } from 'recoil';
import { BiconomyToggle } from '../Toggles';
=======
import { Box, Text } from 'grommet';
import { useRecoilState } from 'recoil';
import { RightAlignToggle } from '../Toggles';
import { Tooltip } from '../Tooltips';
>>>>>>> staging
import { Info } from './Info';

export const FeeInfo = ({
  showWalletFee,
  biconomyToggle = true,
<<<<<<< HEAD
  useBiconomy,
  setUseBiconomy,
=======
  useBiconomy = false,
  setUseBiconomy = null,
>>>>>>> staging
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
<<<<<<< HEAD
            <span>No fees 🎉 - Paid for by Alluo via </span>
            <a href="https://twitter.com/biconomy" target="_blank">
              Biconomy
            </a>
          </>
        )}
        {!isSafeAppAtom && biconomyToggle && (
          <BiconomyToggle
            useBiconomy={useBiconomy}
            setUseBiconomy={setUseBiconomy}
            disabled={disableBiconomy}
          />
=======
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
>>>>>>> staging
        )}
      </div>
    </Info>
  );
};
