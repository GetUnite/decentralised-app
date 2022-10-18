import { isCorrectNetwork } from 'app/common/state/atoms';
import { Button } from 'grommet';
import { useRecoilState } from 'recoil';

export const SubmitButton = ({ label, disabled = false, onClick, ...rest }) => {
  const [isCorrectNetworkAtom] = useRecoilState(isCorrectNetwork);

  return (
    <Button
      disabled={!isCorrectNetworkAtom || disabled}
      label={label}
      onClick={onClick}
      {...rest}
      style={{ height: '52px' }}
    />
  );
};
