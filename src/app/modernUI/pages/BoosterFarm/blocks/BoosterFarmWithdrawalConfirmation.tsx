import { roundNumberDown } from 'app/common/functions/utils';
import exclamation from 'app/modernUI/images/blackExclamation.svg';
import { Box, Button, Text } from 'grommet';

export const BoosterFarmWithdrawalConfirmation = ({
  selectedFarm,
  withdrawValue,
  withdrawTokenLabel,
  handleWithdraw,
  cancelBoosterWithdrawalConfirmation,
  nextHarvestDate,
  losablePendingRewards,
  ...rest
}) => {
  return (
    <>
      <Box margin={{ top: '45px' }} align="center">
        <img src={exclamation} alt="exclamation" />
        <Box gap="35px" margin={{ top: '45px' }}>
          <Text textAlign="center" weight="bold" size="24px">
            If you withdraw {withdrawValue} {withdrawTokenLabel} now, about
            ${roundNumberDown(losablePendingRewards, 6)} in pending rewards won't be realised.
          </Text>
          <Text textAlign="center" weight={400} size="16px">
            Any unrealised rewards will be redistributed amongst the pool. Wait
            until the next harvest on {nextHarvestDate.format('DD MMM')} to earn
            all pending rewards.
          </Text>
        </Box>

        <Box gap="30px" margin={{ top: '48px' }}>
          <Button
            primary
            label="I still want to withdraw now"
            onClick={handleWithdraw}
            style={{ width: '360px' }}
          />
          <Button
            plain
            label={`Cancel withdraw and comeback on ${nextHarvestDate.format(
              'DD MMMM',
            )}`}
            onClick={cancelBoosterWithdrawalConfirmation}
            style={{
              textAlign: 'center',
              color: '#2A73FF',
              fontSize: '14px',
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>
    </>
  );
};
