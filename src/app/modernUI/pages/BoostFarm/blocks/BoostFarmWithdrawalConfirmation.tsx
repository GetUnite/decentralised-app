import { toExactFixed } from 'app/common/functions/utils';
import exclamation from 'app/modernUI/images/blackExclamation.svg';
import { Box, Button, Text } from 'grommet';

export const BoostFarmWithdrawalConfirmation = ({
  selectedFarmInfo,
  withdrawValue,
  withdrawTokenLabel,
  startProcessingSteps,
  cancelBoostWithdrawalConfirmation,
  nextHarvestDate,
  losablePendingRewards,
  ...rest
}) => {
  return (
    <>
      <Box margin={{ top: '70px' }} align="center">
        <img src={exclamation} alt="exclamation" />
        <Box gap="40px" margin={{ top: '73px' }}>
          <Text textAlign="center" weight="bold" size="24px">
            If you withdraw {withdrawValue} {withdrawTokenLabel} now, about $
            {toExactFixed(losablePendingRewards, 6)} in pending rewards won't be
            realised.
          </Text>
          <Text textAlign="center" weight={400} size="16px">
            Any unrealised rewards will be redistributed amongst the pool. Wait
            until the next harvest to earn all pending rewards.
            {/*until the next harvest on {nextHarvestDate.current.format('DD MMM')} to earn
            all pending rewards.*/}
          </Text>
        </Box>

        <Box gap="32px" margin={{ top: '50px' }}>
          <Button
            primary
            label="I still want to withdraw now"
            onClick={startProcessingSteps}
            style={{ width: '360px' }}
          />
          <Button
            plain
            label="Cancel withdrawal and come back later"
            /*label={`Cancel withdraw and come back on ${nextHarvestDate.current.format(
              'DD MMMM',
            )}`}*/
            onClick={cancelBoostWithdrawalConfirmation}
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
