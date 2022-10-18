import { Select, ThemeContext } from 'grommet';

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
    </ThemeContext.Extend>
  );
};
