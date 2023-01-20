import { toExactFixed } from 'app/common/functions/utils';
import { Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';

export const TopHeader = ({
  selectedFarmInfo,
  isLoading,
  isCorrectNetworkAtom,
}) => {
  const { first, second } = selectedFarmInfo.current?.depositDividedAmount || 0;
  return (
    <>
      {isLoading ? (
        <Skeleton count={2} height="22px" borderRadius="20px" />
      ) : (
        <>
          {!isCorrectNetworkAtom ? (
            <Text textAlign="center" weight="bold" size="18px">
              Switch network to Ethereum Mainnet to view balances
            </Text>
          ) : (
            <Text textAlign="center" weight="bold" size="18px">
              Your balance currently earning <br />
              {toExactFixed(
                selectedFarmInfo.current?.interest,
                2,
              ).toLocaleString()}
              % APY is {selectedFarmInfo.current?.sign}
              {(+first).toLocaleString()}
              <Text color="softText" size="18px">
                {second}
              </Text>
            </Text>
          )}
        </>
      )}
    </>
  );
};
