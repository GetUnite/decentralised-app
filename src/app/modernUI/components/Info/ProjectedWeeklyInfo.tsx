import { Info } from './Info';

export const ProjectedWeeklyInfo = ({
  depositedAmount,
  inputValue,
  interest,
  sign,
  isLoading,
  ...rest
}) => {
  const balanceAndNewValue =
    (+depositedAmount || 0) + (+inputValue || 0);

  return (
    <Info
      label={'Projected weekly earnings'}
      value={
        sign +
        (+(
          (balanceAndNewValue > 0 ? balanceAndNewValue : 0) *
          (Math.pow(1.0 + interest / 100.0, 1.0 / 52.0) - 1.0)
        ).toFixed(2)).toLocaleString()
      }
      isLoading={isLoading}
    />
  );
};
