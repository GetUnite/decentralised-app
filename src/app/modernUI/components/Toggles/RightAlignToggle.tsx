import { Box, Button, Text } from 'grommet';

export function RightAlignToggle({ label, isToggled, setIsToggled, disabled=false, weight=500 }) {
  const buttonColor = !isToggled ? '#CCCCCC' : '#2A73FF';
  const buttonDirection = !isToggled ? 'row' : 'row-reverse';

  return (
    <Box flex justify="end" direction="row">
      <Box
        flex
        direction="row"
        align="center"
        justify="end"
      >
        <Text
          size="12px"
          margin={{ right: '8px' }}
          weight={weight}
        >
          {label}
        </Text>
        <Button onClick={() => setIsToggled(!isToggled)} disabled={disabled}>
          <Box
            width="38px"
            height="20px"
            round="10px"
            pad="0px 3px 0px 3px"
            background={buttonColor}
            direction={buttonDirection}
   
            align="center"
          >
            <span
              style={{
                width: '16px',
                height: '16px',
                textAlign: 'center',
                backgroundColor: 'white',
                borderRadius: '50px',
                color: 'white',
                cursor: 'pointer',
                border: 'none',
              }}
            ></span>
          </Box>
        </Button>
      </Box>
    </Box>
  );
}
