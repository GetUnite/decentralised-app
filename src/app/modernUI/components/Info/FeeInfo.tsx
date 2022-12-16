import { isSafeApp } from 'app/common/state/atoms';
import { Text } from 'grommet';
import { useRecoilState } from 'recoil';
import { BiconomyToggle } from '../Toggles';
import { Info } from './Info';

export const FeeInfo = ({
  showWalletFee,
  biconomyToggle = true,
  useBiconomy,
  setUseBiconomy,
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
        )}
      </div>
    </Info>
  );
};
