import { Box, Button, Text } from 'grommet';
import { useCookies } from 'react-cookie';

import booster from 'app/modernUI/images/booster.svg';

export const BoosterFarmPresentation = ({
  selectedFarm,
  farmName,
  ...rest
}) => {
  const [, setCookies] = useCookies(['has_seen_boost_farms']);

  const rewardsLabel = selectedFarm?.rewards.label + ' or ' +  selectedFarm?.rewards.stableLabel;

  return (
    <>
      <Text textAlign="center" size="16px">
        {farmName} FARM
      </Text>
      <Box gap="large" margin={{ top: '20px' }} align="center">
        <Text textAlign="center" weight="bold" size="28px">
          Earn {selectedFarm.interest}% as {rewardsLabel} tokens
          <br />
        </Text>
        <img src={booster} alt="booster" width={275} />
        <Button
          primary
          label="Deposit to get started"
          onClick={() => setCookies('has_seen_boost_farms', true)}
          style={{ width: 310 }}
        />
      </Box>
    </>
  );
};
