import { EChain } from 'app/common/functions/Web3Client';
import SlideButton from 'app/modernUI/components/SlideButton';
import { Info } from 'app/modernUI/components';

export const Infos = ({
  selectedFarm,
  inputValue,
  biconomyStatus,
  setBiconomyStatus,
  ...rest
}) => {
  const balanceAndNewValue =
    (+selectedFarm.depositDividedAmount?.first || 0) + (+inputValue || 0);

  return (
    <>
      <Info
        label={'Projected weekly earnings'}
        value={
          selectedFarm.sign +
          (+(
            (balanceAndNewValue > 0 ? balanceAndNewValue : 0) *
            (Math.pow(1.0 + selectedFarm.interest / 100.0, 1.0 / 52.0) - 1.0)
          ).toFixed(2)).toLocaleString()
        }
      />

      <Info label="APY" value={selectedFarm.interest + '%'} />
      <Info
        label="Pool liquidity"
        value={
          selectedFarm.sign + (+selectedFarm.totalAssetSupply).toLocaleString()
        }
      />
      {selectedFarm.chain === EChain.POLYGON ? (
        <Info label="Gas fee" value={null} border={false}>
          <div style={{ textAlign: 'right', fontSize: 'small' }}>
            {biconomyStatus ? (
              <>
                <span>No fees 🎉 - Paid for by Alluo via </span>
                <a href="https://twitter.com/biconomy">Biconomy</a>
              </>
            ) : (
              'View Fee in metamask'
            )}
          </div>
          <SlideButton
            biconomyStatus={biconomyStatus}
            setBiconomyStatus={setBiconomyStatus}
          />
        </Info>
      ) : (
        <Info label="Gas fee" value={null} border={false}>
          <div style={{ textAlign: 'right', fontSize: 'small' }}>
            View Fee in metamask.
          </div>
        </Info>
      )}
    </>
  );
};
