import { EChain } from 'app/common/constants/chains';
import { toExactFixed } from 'app/common/functions/utils';
import { useBoostFarmDeposit } from 'app/common/state/boostFarm';
import {
  FeeInfo,
  Info,
  NumericInput,
  ProjectedWeeklyInfo,
  Spinner,
  SubmitButton
} from 'app/modernUI/components';
import { Box } from 'grommet';
import { TopHeader } from '../components';

export const BoostFarmDepositTab = ({
  isLoading,
  selectedFarmInfo,
  selectSupportedToken,
  selectedSupportedToken,
  // deposit
  depositValue,
  setDepositValue,
  startBoostDepositConfirmation,
  handleDeposit,
  isDepositing,
  // biconomy
  useBiconomy,
  setUseBiconomy,
}) => {
  const {
    hasErrors,
    depositValueError,
    handleDepositValueChange,
    isApproving,
    isFetchingSupportedTokenInfo,
    selectedSupportedTokenInfo,
    currentStep,
    selectedSupportedTokenSteps,
    handleCurrentStep,
  } = useBoostFarmDeposit({
    selectedFarmInfo,
    selectedSupportedToken,
    depositValue,
    setDepositValue,
    startBoostDepositConfirmation,
    handleDeposit
  });

  return (
    <Box fill>
      <Box style={{
          minHeight: selectedFarmInfo.current?.chain == EChain.POLYGON ? '462px' : '433px',
        }}>
        {isApproving || isDepositing ? (
          <Box
            align="center"
            justify="center"
            fill="vertical"
            margin={{ top: 'large', bottom: 'medium' }}
          >
            <Spinner pad="large" />
          </Box>
        ) : (
          <>
            <Box margin={{ top: 'large' }}>
              <TopHeader selectedFarmInfo={selectedFarmInfo} isLoading={isLoading} />
            </Box>
            <Box margin={{ top: 'medium' }}>
              <NumericInput
                label={`Deposit ${
                  selectedSupportedToken ? selectedSupportedToken?.label : ''
                }`}
                tokenSign={selectedSupportedToken?.sign}
                onValueChange={handleDepositValueChange}
                value={depositValue}
                isLoadingMaxValue={isFetchingSupportedTokenInfo}
                maxButton={true}
                maxValue={selectedSupportedTokenInfo.current?.balance}
                tokenOptions={selectedFarmInfo.current?.supportedTokens || []}
                selectedToken={selectedSupportedToken}
                setSelectedToken={selectSupportedToken}
                error={depositValueError}
                disabled={isLoading}
              />
            </Box>
            <Box margin={{ top: '11px' }}>
              <ProjectedWeeklyInfo
                depositedAmount={selectedFarmInfo.current?.depositedAmount}
                inputValue={depositValue}
                interest={selectedFarmInfo.current?.interest}
                sign={selectedFarmInfo.current?.sign}
                isLoading={isLoading}
              />
              <Info
                label="APY"
                value={
                  toExactFixed(selectedFarmInfo.current?.interest, 2).toLocaleString() + '%'
                }
                isLoading={isLoading}
              />
              <Info
                label="Pool liquidity"
                value={
                  selectedFarmInfo.current?.sign +
                  (+selectedFarmInfo.current?.totalAssetSupply).toLocaleString()
                }
                isLoading={isLoading}
              />
              <FeeInfo
                biconomyToggle={selectedFarmInfo.current?.chain == EChain.POLYGON}
                useBiconomy={false}
                setUseBiconomy={setUseBiconomy}
                showWalletFee={
                  !useBiconomy || selectedFarmInfo.current?.chain != EChain.POLYGON
                }
                isLoading={isLoading}
              />
            </Box>
          </>
        )}
      </Box>
      <Box margin={{ top: 'medium' }}>
        <SubmitButton
          primary
          disabled={
            isLoading ||
            isApproving ||
            isDepositing ||
            !(+depositValue > 0) ||
            isFetchingSupportedTokenInfo ||
            hasErrors
          }
          label={
            isFetchingSupportedTokenInfo
              ? 'Loading...'
              : selectedSupportedTokenSteps.current?.length > 1
              ? `Step ${currentStep + 1} of ${
                  selectedSupportedTokenSteps.current?.length
                }: ${selectedSupportedTokenSteps.current[currentStep]?.label}`
              : `${selectedSupportedTokenSteps.current[currentStep]?.label}`
          }
          onClick={handleCurrentStep}
        />
      </Box>
    </Box>
  );
};
