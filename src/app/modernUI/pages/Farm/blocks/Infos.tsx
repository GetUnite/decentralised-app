import { EChain } from 'app/common/constants/chains';
import { FeeInfo, Info } from 'app/modernUI/components';

export const Infos = ({
  selectedFarm,
  inputValue,
  useBiconomy,
  setUseBiconomy,
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
      <FeeInfo
        biconomyToggle={selectedFarm.chain == EChain.POLYGON}
        useBiconomy={useBiconomy}
        setUseBiconomy={setUseBiconomy}
        showWalletFee={!useBiconomy || selectedFarm.chain != EChain.POLYGON}
      />
    </>
  );
};
