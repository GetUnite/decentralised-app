import { Box, Button, Text } from 'grommet';
import { useCookies } from 'react-cookie';

import booster from 'app/modernUI/images/booster.svg';

export const BoosterFarmPresentation = ({ selectedFarm, ...rest }) => {
  const [cookies, setCookies] = useCookies(['has_seen_boost_farms']);

  const rewardLabels = selectedFarm.rewards.map(reward => {
    return reward.label;
  });
  const last = rewardLabels.pop();
  const result = rewardLabels.join(', ') + ' and ' + last;
  
  return (
    <Box gap='large' margin={{top:"20px"}}>
      <Text textAlign="center" weight="bold" size="18px">
        Earn X% as {result} tokens
        <br />
      </Text>
      <img src={booster} />
      <Button
          primary
          label='Deposit to get started'
          onClick={() => setCookies('has_seen_boost_farms', true)}
        />
    </Box>
  );
};
