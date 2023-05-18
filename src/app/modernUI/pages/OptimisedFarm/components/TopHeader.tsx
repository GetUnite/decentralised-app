import { toExactFixed } from 'app/common/functions/utils';
import { Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';

export const TopHeader = ({ selectedFarmInfo, isLoading, ...rest }) => {
  const { first, second } = selectedFarmInfo?.depositDividedAmount || 0;
  return (
    <>
      {isLoading ? (
        <Skeleton count={2} height="22px" borderRadius="20px"/>
      ) : (
        <Text textAlign="center" weight="bold" size="18px">
          Your balance currently earning <br />
          {toExactFixed(selectedFarmInfo.interest, 2)}% APY is{' '}
          {selectedFarmInfo.sign}
          {(+first).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          <Text color="softText" size="18px">
            {second}
          </Text>
        </Text>
      )}
    </>
  );
};
