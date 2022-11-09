import { isSafeApp } from 'app/common/state/atoms';
import { useRecoilState } from 'recoil';
import { BiconomyToggle } from '../Toggles';
import { Info } from './Info';

export const FeeInfo = ({
  showWalletFee,
  biconomyToggle = true,
  useBiconomy,
  setUseBiconomy,
  disableBiconomy = false,
  ...rest
}) => {
  const [isSafeAppAtom] = useRecoilState(isSafeApp);

  return (
    <Info label="Gas fee" value={null} border={false}>
      <div style={{ textAlign: 'right', fontSize: 'small' }}>
        {showWalletFee || isSafeAppAtom ? (
          <span>View fee in your wallet</span>
        ) : (
          <>
            <span>No fees 🎉 - Paid for by Alluo via </span>
            <a href="https://twitter.com/biconomy">Biconomy</a>
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
