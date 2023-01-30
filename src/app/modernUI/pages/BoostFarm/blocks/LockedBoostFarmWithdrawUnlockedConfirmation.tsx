import { useMode } from 'app/common/state';
import { useLockedBoostFarmWithdrawal } from 'app/common/state/boostFarm';
import { Info, NumericInput, SubmitButton } from 'app/modernUI/components';
import { Box, Button, Heading, Layer, ResponsiveContext } from 'grommet';
import { FormClose } from 'grommet-icons';

export const LockedBoostFarmWithdrawUnlockedConfirmation = ({
  selectedFarmInfo,
  selectedSupportedToken,
  selectedSupportedTokenInfo,
  selectSupportedToken,
  cancelConfirmations,
  // loading
  isLoading,
  // steps
  startProcessingSteps,
  steps,
}) => {
  // theme
  const { isLightMode } = useMode();

  // just use farm withdrawal here aswel
  const { isFetchingSupportedTokenInfo, updateStepsAndStartProcessing } =
    useLockedBoostFarmWithdrawal({
      selectedFarmInfo,
      selectedSupportedToken,
      selectedSupportedTokenInfo,
      steps,
      startProcessingSteps,
    });

  return (
    <ResponsiveContext.Consumer>
      {size => (
        <Layer
          onEsc={() => cancelConfirmations()}
          onClickOutside={() => cancelConfirmations()}
        >
          <Box
            round={'16px'}
            overflow="auto"
            width="medium"
            height="375px"
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
                🔒 Withdraw unlocked funds
              </Heading>
              <Button
                plain
                fill="vertical"
                onClick={() => cancelConfirmations()}
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
            <Box fill="horizontal" margin={{ top: '48px' }}>
              <NumericInput
                label="Withdraw"
                value={selectedSupportedTokenInfo.current?.unlocked}
                tokenOptions={selectedFarmInfo.current?.supportedTokens || []}
                selectedToken={selectedSupportedToken}
                setSelectedToken={selectSupportedToken}
                disableNumber={true}
              />
            </Box>
            <Box margin={{ top: '7px' }}>
              <Info
                label="Gass fee"
                value="View fee in your wallet"
                isLoading={false}
                border={false}
              />
            </Box>
            <Box margin={{ top: '32px' }}>
              <SubmitButton
                primary
                label="Withdraw now"
                disabled={isFetchingSupportedTokenInfo || isLoading}
                onClick={() => {
                  updateStepsAndStartProcessing();
                }}
              />
            </Box>
          </Box>
        </Layer>
      )}
    </ResponsiveContext.Consumer>
  );
};
