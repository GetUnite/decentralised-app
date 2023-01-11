
import { toExactFixed } from 'app/common/functions/utils';
import { Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';

export const TopHeader = ({ selectedFarmInfo, isLoading, ...rest }) => {
  const { first, second } = selectedFarmInfo.current?.depositDividedAmount || 0;
  const dotIndex = first?.indexOf('.');
  const integerPart = (+first?.substring(0, dotIndex)).toLocaleString();
  const floatPart = dotIndex < 0 ? '' : first?.substring(dotIndex);
  return (
    <>
      {isLoading ? (
        <Skeleton count={2} height="18px" />
      ) : (
        <Text textAlign="center" weight="bold" size="18px">
          Your balance currently earning <br />
          {toExactFixed(selectedFarmInfo.current?.interest, 2).toLocaleString()}% APY is{' '}
          {selectedFarmInfo.current?.sign}
          {integerPart + floatPart}
          <Text color="softText" size="18px">
            {second}
          </Text>
        </Text>
      )}
    </>
  );
};
