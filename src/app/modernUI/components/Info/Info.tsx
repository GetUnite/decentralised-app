import { Box, Text } from 'grommet';

export const Info = ({ label, value, ...rest }) => {
  return (
    <>
      <Box
        direction="row"
        justify="between"
        pad="small"
        border= {{ color: 'casper', side: 'bottom' }}
      >
        <Text size="medium" color="soul">
          {label}
        </Text>
        <Text size="medium">{value ? value : rest.children}</Text>
      </Box>
    </>
  );
};
