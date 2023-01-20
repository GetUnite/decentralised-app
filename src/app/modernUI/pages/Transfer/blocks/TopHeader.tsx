import { toExactFixed } from 'app/common/functions/utils';
import { Box, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';

export const TopHeader = ({ ibAlluosInfo, isLoading, ...rest }) => {
  const alluoTextBalances = ibAlluosInfo
    .filter(token => token.balance > 0)
    .map(token => {
      return toExactFixed(token.balance, 5) + ' ' + token.label;
    });
  return (
    <Box height="54px">
      {isLoading ? (
        <Skeleton borderRadius="20px" height="22px" />
      ) : (
        <>
          {alluoTextBalances.length > 0 ? (
            <>
              <Text textAlign="center" weight="bold" size="18px">
                Assets earning yield:
              </Text>
              <Text textAlign="center" weight="bold" size="18px">
                {alluoTextBalances.join(', ')}
              </Text>
            </>
          ) : (
            <Text textAlign="center" weight="bold" size="18px">
              You don’t have any assets earning yield.
            </Text>
          )}
        </>
      )}
    </Box>
  );
};
