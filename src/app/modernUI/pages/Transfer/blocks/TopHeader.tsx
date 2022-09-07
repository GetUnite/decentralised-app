import { Text } from 'grommet';

export const TopHeader = ({ ibAlluosInfo, ...rest }) => {
  const alluoTextBalances = ibAlluosInfo
    .filter(token => token.balance > 0)
    .map(token => {
      return Number(token.balance).toFixed(2) + ' ' + token.label;
    });
  return (
    <>
      {alluoTextBalances.length > 0 ? (
        <Text textAlign="center" weight="bold">
          Assets earning yield: {alluoTextBalances.join(', ')}
        </Text>
      ) : (
        <Text textAlign="center" weight="bold">
          You don’t have any assets earning yield.
        </Text>
      )}
    </>
  );
};
