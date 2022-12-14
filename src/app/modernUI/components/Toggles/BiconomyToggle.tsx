import { Box, Button, Text, Tip } from 'grommet';

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
          style={{cursor: "default"}}
        >
          <>
            <Tip
              content={
                <Box
                  pad="12px"
                  background="modal"
                  round="8px"
                  style={{
                    boxShadow: '0px 0px 10px #2a73ff',
                  }}
                >
                  <span>
                    Turning off Biconomy means Alluo will no longer pay your
                    transaction fee.
                  </span>
                </Box>
              }
            >
              <span style={{ textDecoration: 'underline', marginLeft: '5px' }}>
                Biconomy
              </span>
            </Tip>{' '}
            ON/OFF?
          </>
        </Text>
<Button disabled={disabled} onClick={() => setUseBiconomy(!useBiconomy)}>
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
