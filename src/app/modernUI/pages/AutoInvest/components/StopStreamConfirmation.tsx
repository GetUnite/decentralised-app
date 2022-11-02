import { useMode } from 'app/common/state';
import stopStreamDark from 'app/modernUI/images/stopStream-dark.svg';
import stopStream from 'app/modernUI/images/stopStream.svg';
import { Box, Button, Heading, Layer, ResponsiveContext, Text } from 'grommet';
import { FormClose } from 'grommet-icons';

export const StopStreamConfirmation = ({
  stopStreamConfirmation,
  setStopStreamConfirmation,
  fromAddress,
  toAddress,
  handleStopStream,
  ...rest
}) => {
  const { isLightMode } = useMode();

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <>
          <Button onClick={() => setStopStreamConfirmation(true)}>
            <img src={isLightMode ? stopStream : stopStreamDark} />
          </Button>
          {stopStreamConfirmation && (
            <Layer
              onEsc={() => setStopStreamConfirmation(false)}
              onClickOutside={() => setStopStreamConfirmation(false)}
            >
              <Box
                round={'medium'}
                overflow="auto"
                width="medium"
                height="375px"
                justify="between"
                background="modal"
                pad={{ vertical: 'medium', horizontal: 'medium' }}
              >
                <Box
                  direction="row"
                  align="center"
                  justify="between"
                  fill="horizontal"
                  gap="small"
                >
                  <Heading size="small" level={3} margin="none">
                    Stop Stream
                  </Heading>
                  <Button
                    plain
                    fill="vertical"
                    onClick={() =>
                      setStopStreamConfirmation(!stopStreamConfirmation)
                    }
                  >
                    <Box
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 32,
                        backgroundColor: 'rgba(42, 115, 255, 0.1)',
                      }}
                      justify="center"
                      align="center"
                    >
                      <FormClose size="large" color="black" />
                    </Box>
                  </Button>
                </Box>
                <Box justify="center" align="center" fill="horizontal">
                  <Text size="18">Do you really want to stop your stream?</Text>
                </Box>
                <Box direction="row" justify="around">
                  <Button
                    label="Keep stream"
                    onClick={() =>
                      setStopStreamConfirmation(!stopStreamConfirmation)
                    }
                    style={{ width: '170px' }}
                  />

                  <Button
                    primary
                    label="Yes, stop now"
                    onClick={async () => {
                      await handleStopStream(fromAddress, toAddress);
                      setStopStreamConfirmation(!stopStreamConfirmation);
                    }}
                    color={'red'}
                    style={{ color: 'white', width: '170px' }}
                  />
                </Box>
              </Box>
            </Layer>
          )}
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
