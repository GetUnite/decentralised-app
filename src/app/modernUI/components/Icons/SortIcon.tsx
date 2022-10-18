import { useMode } from 'app/common/state';
import arrowDownDark from 'app/modernUI/images/arrowDown-dark.svg';
import arrowDown from 'app/modernUI/images/arrowDown.svg';
import arrowUpDark from 'app/modernUI/images/arrowUp-dark.svg';
import arrowUp from 'app/modernUI/images/arrowUp.svg';
import { Button } from 'grommet';

export const SortIcon = ({ onClick, isAsc, ...rest }) => {
  const { isLightMode } = useMode();

  const arrowAsc = isLightMode ? arrowUp : arrowUpDark;
  const arrowDesc = isLightMode ? arrowDown : arrowDownDark;
  return (
    <Button onClick={onClick}>
      <img
        height="10px"
        src={isAsc ? arrowAsc : arrowDesc}
        alt="sortIcon"
        {...rest}
      />
    </Button>
  );
};
