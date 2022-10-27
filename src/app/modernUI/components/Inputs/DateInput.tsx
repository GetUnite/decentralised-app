import { useMode } from 'app/common/state';
import { Box, Text, TextInput } from 'grommet';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DateInput.css';

interface IDateInput {
  label?: string;
  date?: string;
  setDate: Function;
  disabled: boolean;
}

export const DateInput = ({
  label,
  date,
  setDate,
  disabled = false,
  ...rest
}: IDateInput) => {
  const { isLightMode } = useMode();
  return (
    <>
      <Text size="medium" color="soul">
        {label}
      </Text>
      <Box margin={{ top: 'xxsmall' }}>
        <DatePicker
          disabled={disabled}
          selected={date}
          onChange={date => setDate(date)}
          customInput={<TextInput />}
          calendarClassName={!isLightMode ? 'dark' : ''}
        />
      </Box>
    </>
  );
};
