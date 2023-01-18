import { toExactFixed } from 'app/common/functions/utils';
import { Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';

export const TopHeader = ({ selectedFarm, isLoading, ...rest }) => {
  const { first, second } = selectedFarm?.depositDividedAmount || 0;
  const dotIndex = first?.indexOf('.');
  const integerPart = (+first?.substring(0, dotIndex)).toLocaleString();
  const floatPart = dotIndex < 0 ? '' : first?.substring(dotIndex);
  return (
    <>
      {isLoading ? (
        <Skeleton count={2} height="22px" borderRadius="20px"/>
      ) : (
        <Text textAlign="center" weight="bold" size="18px">
          Your balance currently earning <br />
          {toExactFixed(selectedFarm.interest, 2).toLocaleString()}% APY is{' '}
          {selectedFarm.sign}
          {integerPart + floatPart}
          <Text color="softText" size="18px">
            {second}
          </Text>
        </Text>
      )}
    </>
  );
};
