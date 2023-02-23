import { EChain } from 'app/common/constants/chains';
import { useTransfer } from 'app/common/state/transfer';
import { Layout, Modal, StepsProcessing, Tab } from 'app/modernUI/components';
import { ResponsiveContext } from 'grommet';
import { TransferTab } from './blocks/TransferTab';

export const Transfer = ({ ...rest }) => {
  const {
    hasErrors,
    transferValueError,
    recipientAddressError,
    transferValue,
    selectedIbAlluoInfo,
    setSelectedIbAlluoBySymbol,
    handleTransferValueChange,
    ibAlluosInfo,
    recipientAddress,
    recipientAddressValue,
    handleRecipientAddressChange,
    useBiconomy,
    setUseBiconomy,
    isLoading,
    // steps
    isProcessing,
    isHandlingStep,
    currentStep,
    stepWasSuccessful,
    stepError,
    startProcessingSteps,
    stopProcessingSteps,
    steps,
    handleCurrentStep,
  } = useTransfer();

  return (
    <ResponsiveContext.Consumer>
      {_ => (
        <Layout>
          <Modal
            chain={EChain.POLYGON}
            heading={'Transfer Asset'}
            closeAction={isProcessing ? stopProcessingSteps : undefined}
            noHeading={isProcessing}
          >
            {isProcessing ? (
              <StepsProcessing
                title="Tranfer funds..."
                steps={steps.current}
                currentStep={currentStep}
                isHandlingStep={isHandlingStep}
                stepWasSuccessful={stepWasSuccessful.current}
                stepError={stepError.current}
                stopProcessingSteps={stopProcessingSteps}
                handleCurrentStep={handleCurrentStep}
                minHeight="512px"
              />
            ) : (
              <Tab title="Transfer">
                <TransferTab
                  hasErrors={hasErrors}
                  transferValueError={transferValueError}
                  recipientAddressError={recipientAddressError}
                  transferValue={transferValue}
                  selectedIbAlluoInfo={selectedIbAlluoInfo}
                  setSelectedIbAlluoBySymbol={setSelectedIbAlluoBySymbol}
                  handleTransferValueChange={handleTransferValueChange}
                  ibAlluosInfo={ibAlluosInfo}
                  recipientAddress={recipientAddress}
                  recipientAddressValue={recipientAddressValue}
                  handleRecipientAddressChange={handleRecipientAddressChange}
                  useBiconomy={useBiconomy}
                  setUseBiconomy={setUseBiconomy}
                  isLoading={isLoading}
                  startProcessingSteps={startProcessingSteps}
                />
              </Tab>
            )}
          </Modal>
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
