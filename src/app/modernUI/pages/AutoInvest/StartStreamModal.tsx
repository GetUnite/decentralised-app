import { EChain } from 'app/common/constants/chains';
import { useStartStream } from 'app/common/state/autoInvest';
import {
  DateInput,
  FeeInfo,
  Info,
  Layout,
  Modal,
  ProjectedWeeklyInfo,
  StepsProcessing,
  StreamInput,
  SubmitButton,
  Tooltip
} from 'app/modernUI/components';
import { RightAlignToggle } from 'app/modernUI/components/Toggles';
import { Box, ResponsiveContext, Text } from 'grommet';
import { CircleInformation } from 'grommet-icons';
import { useNavigate } from 'react-router-dom';

export const StartStreamModal = ({ ...rest }) => {
  const navigate = useNavigate();
  const closeModal = () => {
    navigate('/autoinvest');
  };

  const {
    //loading
    isLoading,
    isFetchingFarmInfo,
    isUpdatingSelectedStreamOption,
    // errors
    hasErrors,
    // inputs
    streamValue,
    validateInputs,
    selectedSupportedFromToken,
    streamValueError,
    selectSupportedFromToken,
    supportedFromTokens,
    supportedToTokens,
    selectedSupportedToToken,
    selectSupportedToToken,
    sourceFarmInfo,
    targetFarmInfo,
    useBiconomy,
    setUseBiconomy,
    useEndDate,
    setUseEndDate,
    endDate,
    setEndDate,
    endDateError,
    // steps
    isProcessing,
    currentStep,
    stepWasSuccessful,
    stepError,
    startProcessingSteps,
    stopProcessingSteps,
    steps,
    handleCurrentStep,
    isHandlingStep,
    // steps
  } = useStartStream();

  return (
    <ResponsiveContext.Consumer>
      {_ => (
        <Layout>
          <Modal
            chain={EChain.POLYGON}
            heading="Auto-Invest"
            noHeading={isProcessing}
            closeAction={isProcessing ? stopProcessingSteps : closeModal}
          >
            <Box fill>
              <Box justify="center">
                {isProcessing ? (
                  <StepsProcessing
                    title={'Starting stream...'}
                    steps={steps.current}
                    currentStep={currentStep}
                    isHandlingStep={isHandlingStep}
                    stepWasSuccessful={stepWasSuccessful.current}
                    stepError={stepError.current}
                    stopProcessingSteps={stopProcessingSteps}
                    handleCurrentStep={handleCurrentStep}
                    minHeight={useEndDate ? '657px' : '570px'}
                    allFinishedLabel="Go to autoInvest"
                    allFinishedLink='/autoinvest'
                  />
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
                          isLoading ||
                          isFetchingFarmInfo ||
                          isUpdatingSelectedStreamOption
                        }
                      />
                      <RightAlignToggle
                        isToggled={useEndDate}
                        setIsToggled={setUseEndDate}
                        label="Set end date for stream"
                        weight={400}
                        disabled={
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
                          />
                          {endDateError && (
                            <Text
                              color="error"
                              size="small"
                              margin={{ top: 'small' }}
                            >
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
                        inputValue={streamValue}
                        interest={targetFarmInfo?.interest}
                        sign={targetFarmInfo?.sign}
                        isLoading={
                          isLoading ||
                          isFetchingFarmInfo ||
                          isUpdatingSelectedStreamOption
                        }
                      />
                      <Info
                        label={`${sourceFarmInfo?.name} APY`}
                        value={sourceFarmInfo?.interest + '%'}
                        isLoading={
                          isLoading ||
                          isFetchingFarmInfo ||
                          isUpdatingSelectedStreamOption
                        }
                      />
                      <Info
                        label={`${targetFarmInfo?.name} APY`}
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
                          ((+streamValue * 0.5) / 100).toLocaleString()
                        }
                        isLoading={
                          isLoading ||
                          isFetchingFarmInfo ||
                          isUpdatingSelectedStreamOption
                        }
                      />
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
                    <Box margin={{ top: 'medium' }}>
                      <SubmitButton
                        primary
                        disabled={
                          isLoading ||
                          hasErrors ||
                          isUpdatingSelectedStreamOption ||
                          streamValue == ''
                        }
                        label={
                          isLoading || isUpdatingSelectedStreamOption
                            ? 'Loading...'
                            : `Start stream`
                        }
                        onClick={startProcessingSteps}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>{' '}
          </Modal>
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
