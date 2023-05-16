import { EChain } from 'app/common/constants/chains';
import {
  Layout,
  Modal,
  StepsProcessing,
  Tab,
  Tabs
} from 'app/modernUI/components';
import { Box, ResponsiveContext, Text } from 'grommet';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { OptimisedFarmDepositTab, OptimisedFarmWithdrawalTab } from './blocks';
import { useOptimisedFarm } from 'app/common/state/optimisedFarm';

export const OptimisedFarm = () => {
  const { id } = useParams();

  const {
    isLoading,
    selectedFarm,
    selectedFarmInfo,
    selectedSupportedToken,
    selectSupportedToken,
    selectedSupportedTokenInfo,
    // deposit
    depositValue,
    setDepositValue,
    // withdraw
    withdrawValue,
    setWithdrawValue,
    // biconomy
    useBiconomy,
    setUseBiconomy,
    // steps
    isProcessing,
    currentStep,
    isHandlingStep,
    stepWasSuccessful,
    stepError,
    startProcessingSteps,
    stopProcessingSteps,
    steps,
    handleCurrentStep,
  } = useOptimisedFarm({
    id,
  });

  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <ResponsiveContext.Consumer>
      {_ => (
        <Layout>
          <Modal
            chain={selectedFarm.current?.chain}
            heading={selectedFarm.current?.name}
            noHeading={isProcessing}
            closeAction={isProcessing ? stopProcessingSteps : undefined}
          >
            {isProcessing ? (
              <StepsProcessing
                title={
                  selectedTab == 0
                    ? 'Depositing funds...'
                    : 'Withdrawing funds...'
                }
                steps={steps.current}
                currentStep={currentStep}
                isHandlingStep={isHandlingStep}
                stepWasSuccessful={stepWasSuccessful.current}
                stepError={stepError.current}
                stopProcessingSteps={stopProcessingSteps}
                handleCurrentStep={handleCurrentStep}
                minHeight={
                  selectedFarm.current?.chain == EChain.POLYGON
                    ? '627px'
                    : '598px'
                }
              />
            ) : (
              <>
                <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab}>
                  <Tab title="Deposit">
                    <OptimisedFarmDepositTab
                      selectedFarm={selectedFarm}
                      selectedFarmInfo={selectedFarmInfo}
                      isLoading={isLoading}
                      selectedSupportedToken={selectedSupportedToken}
                      selectSupportedToken={selectSupportedToken}
                      selectedSupportedTokenInfo={selectedSupportedTokenInfo}
                      depositValue={depositValue}
                      setDepositValue={setDepositValue}
                      useBiconomy={useBiconomy}
                      setUseBiconomy={setUseBiconomy}
                      // steps
                      startProcessingSteps={startProcessingSteps}
                      steps={steps}
                    />
                  </Tab>
                  <Tab title="Withdraw">
                    <OptimisedFarmWithdrawalTab
                      selectedFarm={selectedFarm}
                      selectedFarmInfo={selectedFarmInfo}
                      isLoading={isLoading}
                      selectedSupportedToken={selectedSupportedToken}
                      selectSupportedToken={selectSupportedToken}
                      withdrawValue={withdrawValue}
                      setWithdrawValue={setWithdrawValue}
                      // biconomy
                      useBiconomy={useBiconomy}
                      setUseBiconomy={setUseBiconomy}
                      // steps
                      startProcessingSteps={startProcessingSteps}
                      steps={steps}
                    />
                  </Tab>
                </Tabs>
                <Box margin={{ top: '26px' }} justify="center" direction="row" height="18px" >
                  {/*TODO: remove display none and update link*/}
                  <Text size="12px" style={{display: "none"}}>
                    Find out where these funds are being invested{' '}
                    <a
                      target="_blank"
                      href="https://docsend.com/view/np9ypdn38jajb9zj"
                      style={{
                        textDecoration: 'none',
                      }}
                    >
                      here
                    </a>
                    </Text>
                </Box>
              </>
            )}
          </Modal>
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
