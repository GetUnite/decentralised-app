import { Button } from 'grommet';

export const SubmitButton = ({ label, disabled, onClick, ...rest }) => {
  return (
    <Button
      disabled={disabled}
      label={label}
      onClick={onClick}
      {...rest}
      style={{ height: '52px' }}
    />
  );
};
