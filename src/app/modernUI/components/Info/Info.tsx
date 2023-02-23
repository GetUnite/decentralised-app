import { Box, Text } from 'grommet';
import Skeleton from 'react-loading-skeleton';

export const Info = ({ label, value, border = true, isLoading, ...rest }) => {
  return (
    <>
      <Box
        direction="row"
        justify="between"
        pad="small"
        style={border ? { borderBottom: '1px solid #EDEDED' } : {}}
      >
        {isLoading ? (
          <Box height="21px" fill="horizontal">
            <Skeleton height="14px" borderRadius="20px"/>
          </Box>
        ) : (
          <>
            <Text size="14px">
              {label}
            </Text>
            <Text size="14px">{value ? value : rest.children}</Text>
          </>
        )}
      </Box>
    </>
  );
};
