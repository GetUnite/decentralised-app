import { EChain } from 'app/common/constants/chains';
import { useFarm } from 'app/common/state/farm';
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
import { FarmDepositTab, FarmWithdrawalTab } from './blocks';

export const Farm = () => {
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
  } = useFarm({
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
                    <FarmDepositTab
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
                    <FarmWithdrawalTab
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
                <Box margin={{ top: '26px' }} justify="center" direction="row">
                  <Text size="12px">
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
