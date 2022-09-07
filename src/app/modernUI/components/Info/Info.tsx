import { Box, Text } from 'grommet';

export const Info = ({ label, value, border = true, ...rest }) => {
  return (
    <>
      <Box
        direction="row"
        justify="between"
        pad="small"
        style={border ? { borderBottom: '1px solid #EDEDED' } : {}}
      >
        <Text size="medium" color="soul">
          {label}
        </Text>
        <Text size="medium">{value ? value : rest.children}</Text>
      </Box>
    </>
  );
};
