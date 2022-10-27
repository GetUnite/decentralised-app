import { useAutoInvestTab } from 'app/common/state/autoInvest';
import {
  DateInput,
  FeeInfo,
  Info,
  ProjectedWeeklyInfo,
  Spinner,
  StreamInput,
  SubmitButton
} from 'app/modernUI/components';
import { RightAlignToggle } from 'app/modernUI/components/Toggles';
import { Box } from 'grommet';

export const AutoInvestTab = ({ ...rest }) => {
  const {
    //loading 
    isLoading,
    isFetchingFarmInfo,
    isUpdatingSelectedStreamOption,
    // errors
    hasErrors,
    // inputs
    disableInputs,
    streamValue,
    handleStreamValueChange,
    selectedSupportedFromToken,
    streamValueError,
    selectSupportedFromToken,
    supportedFromTokens,
    supportedToTokens,
    selectedSupportedToToken,
    selectSupportedToToken,
    targetFarmInfo,
    useBiconomy,
    setUseBiconomy,
    useEndDate,
    setUseEndDate,
    endDate,
    setEndDate,
    currentStep,
    selectedStreamOptionSteps,
  } = useAutoInvestTab();

  return (
    <Box fill>
      <Box style={{ minHeight: '410px' }} justify="center">
        {isLoading ? (
          <Box
            align="center"
            justify="center"
            fill="vertical"
            margin={{ top: 'large', bottom: 'medium' }}
          >
            <Spinner pad="large" />
          </Box>
        ) : (
          <Box margin={{ top: '46px' }}>
            <Box>
              <StreamInput
                label="Flow rate"
                tokenSign={selectedSupportedFromToken?.sign}
                onValueChange={handleStreamValueChange}
                value={streamValue}
                maxValue={selectedSupportedFromToken?.balance}
                fromTokenOptions={supportedFromTokens}
                selectedFromToken={selectedSupportedFromToken}
                setSelectedFromToken={selectSupportedFromToken}
                toTokenOptions={supportedToTokens}
                selectedToToken={selectedSupportedToToken}
                setSelectedToToken={selectSupportedToToken}
                error={streamValueError}
                disabled={disableInputs}
              />
              <RightAlignToggle
                isToggled={useEndDate}
                setIsToggled={setUseEndDate}
                label="Set end date for stream"
                disabled={disableInputs}
              />
              {useEndDate && (
                <DateInput
                  label="End date"
                  date={endDate}
                  setDate={setEndDate}
                  disabled={disableInputs}
                />
              )}
            </Box>
            <Box
              margin={{ top: 'medium' }}
              style={{ minHeight: '224px' }}
              justify="center"
            >
              {isFetchingFarmInfo ? (
                <Box align="center" justify="center" fill="vertical">
                  <Spinner pad="large" />
                </Box>
              ) : (
                <>
                  <ProjectedWeeklyInfo
                    depositedAmount={targetFarmInfo.depositedAmount}
                    inputValue={streamValueError}
                    interest={targetFarmInfo.interest}
                    sign={targetFarmInfo.sign}
                  />
                  <Info label="APY" value={targetFarmInfo.interest + '%'} />
                  <Info
                    label="Pool liquidity"
                    value={
                      targetFarmInfo.sign +
                      (+targetFarmInfo.totalAssetSupply).toLocaleString()
                    }
                  />
                  <FeeInfo
                    useBiconomy={useBiconomy}
                    setUseBiconomy={setUseBiconomy}
                    disableBiconomy={true}
                    showWalletFee={!useBiconomy}
                  />
                </>
              )}
            </Box>
          </Box>
        )}
      </Box>
      <Box margin={{ top: 'large' }}>
        <SubmitButton
          primary
          disabled={
            isLoading || hasErrors || isUpdatingSelectedStreamOption
          }
          label={isLoading || isUpdatingSelectedStreamOption ? "Loading..." : `Step ${currentStep} of ${selectedStreamOptionSteps.length}: ${selectedStreamOptionSteps[currentStep-1].label}`}
          onClick={!isLoading && !isUpdatingSelectedStreamOption? selectedStreamOptionSteps[currentStep-1]?.method : null}
        />
      </Box>
    </Box>
  );
};
