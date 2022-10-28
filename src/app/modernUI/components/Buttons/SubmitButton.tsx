import { isCorrectNetwork } from 'app/common/state/atoms';
import { Button } from 'grommet';
import { useRecoilState } from 'recoil';
import './SubmitButton.css';

export const SubmitButton = ({ label, disabled = false, onClick, glowing = false, ...rest }) => {
  const [isCorrectNetworkAtom] = useRecoilState(isCorrectNetwork);
  let style = { height: '52px', animation: "none" };
  if(glowing && !disabled){
    style = {...style, animation: "glowing 1300ms infinite"}
  }
  
  return (
    <Button
      disabled={!isCorrectNetworkAtom || disabled}
      label={label}
      onClick={onClick}
      {...rest}
      style={style}
    />
  );
};
