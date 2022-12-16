import { Box, Text, Tip } from 'grommet';

export const Tooltip = ({ children, text, ...rest }) => {
  return (
    <Tip
      content={
        <Box
          pad={{ vertical: '4px', horizontal: '8px' }}
          background="tooltip"
          flex
          round="4px"
          style={{
            maxWidth: '300px',
            boxShadow:
              '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)',
          }}
        >
          <Text size="11px">{text}</Text>
        </Box>
      }
    >
      {children}
    </Tip>
  );
};
