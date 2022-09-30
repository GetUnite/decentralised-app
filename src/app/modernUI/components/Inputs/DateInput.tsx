import { useMode } from 'app/common/state/shortcuts';
import { Box, TextInput, Text } from 'grommet';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DateInput.css';

interface IDateInput {
  label?: string;
  date?: string;
  setDate: Function;
}

export const DateInput = ({ label, date, setDate, ...rest }: IDateInput) => {
    const { isLightMode } = useMode();
  return (
    <>
      <Text size="medium" color="soul">
        {label}
      </Text>
      <Box margin={{ top: 'xxsmall' }}>
        <DatePicker
          selected={date}
          onChange={date => setDate(date)}
          customInput={<TextInput />}
          calendarClassName={!isLightMode ? "dark" : ""}
        />
      </Box>
    </>
  );
};
