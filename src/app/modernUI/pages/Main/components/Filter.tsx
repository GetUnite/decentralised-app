import {
  Select,
  ThemeContext
} from 'grommet';
import './filter.css';

export const Filter = ({ options, value, onChange, style, ...rest }) => {
  return (
    <ThemeContext.Extend
      value={{
        select: {
          options: {
            text: { size: '16px' },
          },
        },
      }}
    >
      <Select
        plain
        options={options}
        value={value}
        onChange={onChange}
        style={{ ...style, backgroundColor: 'transparent' }}
        {...rest}
      />
      {/*<DropButton
        id="filter"
        label="Fancy Selector"
        dropAlign={{ top: 'bottom', left: 'left' }}
        dropContent={
          <Box pad={{ horizontal: 'medium', top: '8px' }} round="8px" width="373px">
            <Heading size="18px">Tokens</Heading>
            <CheckBoxGroup options={options} onChange={(value) => {console.log(value)}}/>
          </Box>
        }
      />*/}
    </ThemeContext.Extend>
  );
};
