import { Box, Button, Text } from 'grommet';

<<<<<<< HEAD
export function RightAlignToggle({ label, isToggled, setIsToggled, disabled=false }) {
=======
export function RightAlignToggle({ label, isToggled, setIsToggled, disabled=false, weight=500 }) {
>>>>>>> staging
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
<<<<<<< HEAD
          weight={500}
=======
          weight={weight}
>>>>>>> staging
        >
          {label}
        </Text>
        <Button onClick={() => setIsToggled(!isToggled)} disabled={disabled}>
          <Box
            width="46px"
            height="20px"
            round="10px"
<<<<<<< HEAD
            pad="0px 7px 0px 7px"
            background={buttonColor}
            direction={buttonDirection}
            justify="between"
=======
            pad="0px 3px 0px 3px"
            background={buttonColor}
            direction={buttonDirection}
   
>>>>>>> staging
            align="center"
          >
            <span
              style={{
<<<<<<< HEAD
                width: '13px',
                height: '13px',
=======
                width: '16px',
                height: '16px',
>>>>>>> staging
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
