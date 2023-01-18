import { EChain } from 'app/common/constants/chains';
import { useFarm } from 'app/common/state/farm';
import { Layout, Modal, Spinner, Tab, Tabs } from 'app/modernUI/components';
import { Box, ResponsiveContext, Text } from 'grommet';
import { useParams } from 'react-router-dom';
import { FarmDepositTab, FarmWithdrawalTab } from './blocks';

export const Farm = () => {
  const { id } = useParams();

  const {
    selectedFarm,
    updateFarmInfo,
    isLoading,
    selectSupportedToken,
    selectedSupportedToken,
    // deposit
    depositValue,
    setDepositValue,
    handleApprove,
    handleDeposit,
    //withdraw
    withdrawValue,
    setWithdrawValue,
    handleWithdraw,
    isWithdrawing,
    // biconomy
    useBiconomy,
    setUseBiconomy,
    isApproving,
    isDepositing,
  } = useFarm({
    id,
  });

  return (
    <ResponsiveContext.Consumer>
      {_ => (
        <Layout>
          <Modal
            chain={selectedFarm?.chain}
            heading={selectedFarm?.name}
            showChainBadge={!isLoading}
          >
            {isDepositing || isApproving || isWithdrawing ? (
              <Box
                align="center"
                justify="center"
                fill="vertical"
                margin={{ top: 'large', bottom: 'medium' }}
                style={{
                  minHeight:
                    selectedFarm?.chain == EChain.POLYGON ? '504px' : '475px',
                }}
              >
                <Spinner pad="large" />
              </Box>
            ) : (
              <Tabs>
                <Tab title="Deposit">
                  <FarmDepositTab
                    selectedFarm={selectedFarm}
                    isLoading={isLoading}
                    selectedSupportedToken={selectedSupportedToken}
                    selectSupportedToken={selectSupportedToken}
                    depositValue={depositValue}
                    setDepositValue={setDepositValue}
                    handleApprove={handleApprove}
                    handleDeposit={handleDeposit}
                    useBiconomy={useBiconomy}
                    setUseBiconomy={setUseBiconomy}
                  />
                </Tab>
                <Tab title="Withdraw">
                  <FarmWithdrawalTab
                    selectedFarm={selectedFarm}
                    isLoading={isLoading}
                    selectedSupportedToken={selectedSupportedToken}
                    selectSupportedToken={selectSupportedToken}
                    withdrawValue={withdrawValue}
                    setWithdrawValue={setWithdrawValue}
                    handleWithdraw={handleWithdraw}
                    isWithdrawing={isWithdrawing}
                    useBiconomy={useBiconomy}
                    setUseBiconomy={setUseBiconomy}
                  />
                </Tab>
              </Tabs>
            )}
            <Box margin={{ top: '26px' }} justify="center" direction="row">
              <Text size="12px">
                Find out where these funds are being invested{' '}
                <a
                  target="_blank"
                  href="https://docsend.com/view/26j9j8se4vrfu2wh"
                  style={{
                    textDecoration: 'none',
                  }}
                >
                  here
                </a>
              </Text>
            </Box>
          </Modal>
        </Layout>
      )}
    </ResponsiveContext.Consumer>
  );
};
