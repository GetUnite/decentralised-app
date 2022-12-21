import { Box, Button, Text } from 'grommet';
import { Tooltip } from '../Tooltips';

export function BiconomyToggle({ useBiconomy, setUseBiconomy, disabled }) {
  const useBiconomyButton = useBiconomy ? 'row' : 'row-reverse';
  const useBiconomyButtonColor = !useBiconomy ? '#CCCCCC' : '#2A73FF';

  return (
    <Box flex justify="end" direction="row">
      <Box
        flex
        direction="row"
        align="center"
        justify="end"
        margin={{ top: '9px' }}
      >
        <Text
          size="12px"
          margin={{ right: '8px' }}
          color="#999999"
          weight={500}
          style={{ cursor: 'default' }}
        >
          <>
            <Tooltip
              text="Turning off Biconomy means Alluo will no longer pay your
                    transaction fee."
            >
              <span style={{ textDecoration: 'underline', marginLeft: '5px' }}>
                Biconomy
              </span>
            </Tooltip>{' '}
            ON/OFF?
          </>
        </Text>
        <Button
          disabled={true}
          //disabled={disabled}
          onClick={() => setUseBiconomy(!useBiconomy)}
        >
          <Box
            width="46px"
            height="20px"
            round="10px"
            pad="0px 7px 0px 7px"
            background={useBiconomyButtonColor}
            direction={useBiconomyButton}
            justify="between"
            align="center"
          >
            <Text size="9px" color="white">
              {useBiconomy ? 'ON' : 'OFF'}
            </Text>
            <span
              style={{
                width: '13px',
                height: '13px',
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
