import { toExactFixed } from 'app/common/functions/utils';
import { Tooltip } from 'app/modernUI/components';
import dollarInfo from 'app/modernUI/images/dollarInfo.svg';
import { Box, Text } from 'grommet';
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
            <>
              {!selectedFarmInfo.current?.isLocked ? (
                <Text textAlign="center" weight="bold" size="18px">
                  Your balance currently earning <br />
                  {toExactFixed(
                    selectedFarmInfo.current?.interest,
                    2,
                  ).toLocaleString()}
                  % APY is {selectedFarmInfo.current?.sign}
                  {(+first).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  <Text color="softText" size="18px">
                    {second}
                  </Text>
                </Text>
              ) : (
                <>
                  <Text
                    textAlign="center"
                    weight="bold"
                    size="18px"
                    style={{ justifyContent: 'center' }}
                  >
                    You have{' '}
                    {(+selectedFarmInfo.current
                      ?.depositedAmountInLP).toLocaleString()}{' '}
                    {selectedFarmInfo.current?.name}
                  </Text>
                  <Box direction="row" justify="center">
                    <Text
                      textAlign="center"
                      weight="bold"
                      size="18px"
                      style={{ justifyContent: 'center' }}
                    >
                      earning{' '}
                      {toExactFixed(
                        selectedFarmInfo.current?.interest,
                        2,
                      ).toLocaleString()}
                      % APY{' '}
                    </Text>
                    <Tooltip
                      text={
                        <Text>
                          Current value:
                          <br />
                          {(+selectedFarmInfo.current
                            ?.depositedAmount).toLocaleString()} USD
                        </Text>
                      }
                    >
                      <img src={dollarInfo} alt="dollarInfo" />
                    </Tooltip>
                  </Box>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};
