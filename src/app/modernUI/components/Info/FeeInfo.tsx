import { BiconomyToggle } from '../Biconomy';
import { Info } from './Info';

export const FeeInfo = ({
  showWalletFee,
  biconomyToggle,
  useBiconomy,
  setUseBiconomy,
  ...rest
}) => {
  return (
    <Info label="Gas fee" value={null} border={false}>
      <div style={{ textAlign: 'right', fontSize: 'small' }}>
        {showWalletFee ? (
          <span>View fee in your wallet</span>
        ) : (
          <>
            <span>No fees 🎉 - Paid for by Alluo via </span>
            <a href="https://twitter.com/biconomy">Biconomy</a>
          </>
        )}
        {biconomyToggle && (
          <BiconomyToggle
            biconomyStatus={useBiconomy}
            setBiconomyStatus={setUseBiconomy}
          />
        )}
      </div>
    </Info>
  );
};
