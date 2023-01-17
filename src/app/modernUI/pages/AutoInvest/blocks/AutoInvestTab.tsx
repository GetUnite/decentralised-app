import { useAutoInvestTab } from 'app/common/state/autoInvest';
import {
  DateInput,
  FeeInfo,
  Info,
  ProjectedWeeklyInfo,
  Spinner,
  StreamInput,
<<<<<<< HEAD
  SubmitButton
} from 'app/modernUI/components';
import { RightAlignToggle } from 'app/modernUI/components/Toggles';
import { Box, Text } from 'grommet';
=======
  SubmitButton,
  Tooltip
} from 'app/modernUI/components';
import { RightAlignToggle } from 'app/modernUI/components/Toggles';
import { Box, Text } from 'grommet';
import { CircleInformation } from 'grommet-icons';
>>>>>>> staging

export const AutoInvestTab = ({ ...rest }) => {
  const {
    //loading
    isLoading,
    isStartingStream,
    isApproving,
    isDepositing,
    isFetchingFarmInfo,
    isUpdatingSelectedStreamOption,
    // errors
    hasErrors,
    // inputs
    disableInputs,
    streamValue,
    validateInputs,
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
    endDateError,
    currentStep,
    selectedStreamOptionSteps,
    handleCurrentStep,
  } = useAutoInvestTab();

  return (
    <Box fill>
<<<<<<< HEAD
      <Box style={{ minHeight: '410px' }} justify="center">
=======
      <Box
        style={{ minHeight: useEndDate ? '535px' : '448px' }}
        justify="center"
      >
>>>>>>> staging
        {isStartingStream || isApproving || isDepositing ? (
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
                onValueChange={validateInputs}
                value={streamValue}
                maxValue={selectedSupportedFromToken?.balance}
                fromTokenOptions={supportedFromTokens}
                selectedFromToken={selectedSupportedFromToken}
                setSelectedFromToken={selectSupportedFromToken}
                toTokenOptions={supportedToTokens}
                selectedToToken={selectedSupportedToToken}
                setSelectedToToken={selectSupportedToToken}
                error={streamValueError}
                disabled={
                  disableInputs ||
                  isLoading ||
                  isFetchingFarmInfo ||
                  isUpdatingSelectedStreamOption
                }
              />
              <RightAlignToggle
                isToggled={useEndDate}
                setIsToggled={setUseEndDate}
                label="Set end date for stream"
<<<<<<< HEAD
=======
                weight={400}
>>>>>>> staging
                disabled={
                  disableInputs ||
                  isLoading ||
                  isFetchingFarmInfo ||
                  isUpdatingSelectedStreamOption
                }
              />
              {useEndDate && (
                <>
                  <DateInput
                    label="End date"
                    date={endDate}
                    setDate={setEndDate}
                    disabled={disableInputs}
                  />
                  {endDateError && (
                    <Text color="error" size="small" margin={{ top: 'small' }}>
                      {endDateError}
                    </Text>
                  )}
                </>
              )}
            </Box>
            <Box
              margin={{ top: 'medium' }}
              style={{ minHeight: '224px' }}
              justify="center"
            >
              <ProjectedWeeklyInfo
                depositedAmount={targetFarmInfo?.depositedAmount}
                inputValue={streamValueError}
                interest={targetFarmInfo?.interest}
                sign={targetFarmInfo?.sign}
                isLoading={
                  isLoading ||
                  isFetchingFarmInfo ||
                  isUpdatingSelectedStreamOption
                }
              />
              <Info
                label="APY"
                value={targetFarmInfo?.interest + '%'}
                isLoading={
                  isLoading ||
                  isFetchingFarmInfo ||
                  isUpdatingSelectedStreamOption
                }
              />
              <Info
                label="Pool liquidity"
                value={
                  targetFarmInfo?.sign +
                  (+targetFarmInfo?.totalAssetSupply).toLocaleString()
                }
                isLoading={
                  isLoading ||
                  isFetchingFarmInfo ||
                  isUpdatingSelectedStreamOption
                }
              />
<<<<<<< HEAD
=======
              <Info
                label={
                  <Box
                    justify="center"
                    direction="row"
                    gap="4px"
                    align="center"
                    fill
                  >
                    <span>Monthly transaction fee</span>
                    <Tooltip text="AutoInvest incurs a transaction fee of 0.5% of your monthly stream rate to cover Ricochet’s DCA fees. ">
                      <CircleInformation
                        color="soul"
                        size="18px"
                        style={{ marginTop: '-2px' }}
                      />
                    </Tooltip>
                  </Box>
                }
                value={
                  selectedSupportedFromToken?.sign +
                  (+streamValue * 0.5 / 100).toLocaleString()
                }
                isLoading={
                  isLoading ||
                  isFetchingFarmInfo ||
                  isUpdatingSelectedStreamOption
                }
              />
>>>>>>> staging
              <FeeInfo
                useBiconomy={useBiconomy}
                setUseBiconomy={setUseBiconomy}
                disableBiconomy={true}
                showWalletFee={!useBiconomy}
                isLoading={
                  isLoading ||
                  isFetchingFarmInfo ||
                  isUpdatingSelectedStreamOption
                }
              />
            </Box>
          </Box>
        )}
      </Box>
      <Box margin={{ top: 'large' }}>
<<<<<<< HEAD
        {console.log(streamValue)}
=======
>>>>>>> staging
        <SubmitButton
          primary
          disabled={
            isLoading ||
            hasErrors ||
            isUpdatingSelectedStreamOption ||
            isApproving ||
            isDepositing ||
            streamValue == ''
          }
          label={
            isLoading || isUpdatingSelectedStreamOption
              ? 'Loading...'
              : `Step ${currentStep + 1} of ${
                  selectedStreamOptionSteps?.length
                }: ${selectedStreamOptionSteps[currentStep]?.label}`
          }
          onClick={handleCurrentStep}
<<<<<<< HEAD
          glowing={currentStep > 0 && !isDepositing && !isApproving && !isLoading}
=======
          glowing={
            currentStep > 0 && !isDepositing && !isApproving && !isLoading
          }
>>>>>>> staging
        />
      </Box>
    </Box>
  );
};
