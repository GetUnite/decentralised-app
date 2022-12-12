import { toExactFixed } from 'app/common/functions/utils';
import { Text } from 'grommet';

export const TopHeader = ({ selectedFarm, ...rest }) => {
  const { first, second } = selectedFarm?.depositDividedAmount || 0;
  return (
    <Text textAlign="center" weight="bold" size="18px">
      Your balance currently earning <br />
      {toExactFixed(selectedFarm.interest, 2).toLocaleString()}% APY is{' '}
      {selectedFarm.sign}
      {(+first).toLocaleString()}
      {+second > 0 && (
        <Text color="softText" margin={{ left: 'hair' }} size="18px">
          {second}
        </Text>
      )}
    </Text>
  );
};
