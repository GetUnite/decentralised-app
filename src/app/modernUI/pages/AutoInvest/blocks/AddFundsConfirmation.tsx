import { useMode } from 'app/common/state';
import { farmOptions } from 'app/common/state/farm/useFarm';
import arrowRightDark from 'app/modernUI/images/arrowRight-dark.svg';
import arrowRight from 'app/modernUI/images/arrowRight.svg';
import openVault from 'app/modernUI/images/vaults/openVault.svg';
import { Box, Button, Layer, ResponsiveContext, Text } from 'grommet';
import { FormClose } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';

export const AddFundsConfirmation = ({
  addFundsConfirmation,
  setAddFundsConfirmation,
  setIsEditMode,
  fromAddress,
}) => {
  // react
  const navigate = useNavigate();

  // theme
  const { isLightMode } = useMode();

  // source farm
  const sourceFarmId = farmOptions.find(
    farm => farm.farmAddress == fromAddress,
  )?.id;

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <>
          <Button plain onClick={() => setAddFundsConfirmation(true)}>
            <Text weight="bold" size="14px" color="text">
              Add funds <img src={isLightMode ? arrowRight : arrowRightDark} />
            </Text>
          </Button>
          {addFundsConfirmation && (
            <Layer
              onEsc={() => setAddFundsConfirmation(false)}
              onClickOutside={() => setAddFundsConfirmation(false)}
            >
              <Box
                round={'16px'}
                overflow="auto"
                width="medium"
                justify="between"
                background="modal"
                pad={{ vertical: 'medium', horizontal: 'medium' }}
              >
                <Box
                  direction="row"
                  align="center"
                  justify="end"
                  fill="horizontal"
                  gap="small"
                >
                  <Button
                    plain
                    fill="vertical"
                    onClick={() =>
                      setAddFundsConfirmation(!addFundsConfirmation)
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
                <Box>
                  <Box fill="horizontal" align="center">
                    <Text size="24px" weight={600}>
                      Add funds
                    </Text>
                  </Box>
                  <Box justify="center" fill align="center" gap="25px">
                    <img
                      src={openVault}
                      alt="vault"
                      style={{ marginTop: '60px' }}
                    />
                    <Box pad={{ horizontal: '20px' }}>
                      <Text
                        textAlign="center"
                        weight="bold"
                        size="18px"
                        margin={{ top: '40px' }}
                      >
                        You need to add funds to your farm now to keep
                        streaming.
                      </Text>
                    </Box>
                    <Text textAlign="center" weight={400} size="14px">
                      Once you’ve added funds, you’ll need start editing your
                      stream again.
                    </Text>

                    <Box gap="12px" margin={{ top: '15px' }}>
                      <Button
                        primary
                        label="Add funds now"
                        onClick={() => {navigate(`/farm/${sourceFarmId}`)}}
                        style={{ width: '360px' }}
                      />
                      <Button
                        label="Cancel edit"
                        onClick={() => {
                          setIsEditMode(false);
                          setAddFundsConfirmation(false);
                        }}
                        style={{ width: '360px' }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Layer>
          )}
        </>
      )}
    </ResponsiveContext.Consumer>
  );
};
