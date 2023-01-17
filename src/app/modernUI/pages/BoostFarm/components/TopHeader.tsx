
import { toExactFixed } from 'app/common/functions/utils';
import { Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';

<<<<<<< HEAD
export const TopHeader = ({ selectedFarm, isLoading, ...rest }) => {
  const { first, second } = selectedFarm?.depositDividedAmount || 0;
=======
export const TopHeader = ({ selectedFarmInfo, isLoading, ...rest }) => {
  const { first, second } = selectedFarmInfo.current?.depositDividedAmount || 0;
>>>>>>> staging
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
<<<<<<< HEAD
          {toExactFixed(selectedFarm.interest, 2).toLocaleString()}% APY is{' '}
          {selectedFarm.sign}
=======
          {toExactFixed(selectedFarmInfo.current?.interest, 2).toLocaleString()}% APY is{' '}
          {selectedFarmInfo.current?.sign}
>>>>>>> staging
          {integerPart + floatPart}
          <Text color="softText" size="18px">
            {second}
          </Text>
        </Text>
      )}
    </>
  );
};
