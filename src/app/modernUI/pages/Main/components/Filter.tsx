import { Box, DropButton, Menu, Select, Text, ThemeContext } from 'grommet';

export const Filter = ({ options, value, onChange, ...rest }) => {
  return (
    <ThemeContext.Extend
      value={{
        select: {
          options: {
            text: { size: '16px' },
          }
        },
      }}
    >
      <Select plain options={options} value={value} onChange={onChange} {...rest}/>
    </ThemeContext.Extend>
  );
};
