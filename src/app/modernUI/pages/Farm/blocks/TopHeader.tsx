import { Text } from 'grommet';

export const TopHeader = ({ selectedFarm, ...rest }) => {
  const { first, second } = selectedFarm?.depositDividedAmount || 0;
  const dotIndex = first?.indexOf('.');
  const integerPart = (+first?.substring(0, dotIndex)).toLocaleString();
  const floatPart = dotIndex < 0 ? '' : first?.substring(dotIndex);
  return (
    <Text textAlign="center" weight="bold" size='18px'>
      Your balance currently earning <br />
      {selectedFarm.interest}% APY is {selectedFarm.sign}
      {integerPart + floatPart}
      <Text color="softText" margin={{ left: 'hair' }}>
        {second}
      </Text>
    </Text>
  );
};
