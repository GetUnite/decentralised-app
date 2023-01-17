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
<<<<<<< HEAD
  selectedFarm,
  selectSupportedToken,
  selectedSupportedToken,
  ...rest
=======
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
>>>>>>> staging
}) => {
  const {
    hasErrors,
    depositValueError,
<<<<<<< HEAD
    depositValue,
    handleDepositValueChange,
    isApproving,
    isDepositing,
    setUseBiconomy,
    useBiconomy,
=======
    handleDepositValueChange,
    isApproving,
>>>>>>> staging
    isFetchingSupportedTokenInfo,
    selectedSupportedTokenInfo,
    currentStep,
    selectedSupportedTokenSteps,
    handleCurrentStep,
<<<<<<< HEAD
  } = useBoostFarmDeposit({ selectedFarm, selectedSupportedToken });

  return (
    <Box fill>
      <Box
        style={{
          minHeight: selectedFarm?.chain == EChain.POLYGON ? '462px' : '433px',
        }}
      >
=======
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
>>>>>>> staging
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
<<<<<<< HEAD
              <TopHeader selectedFarm={selectedFarm} isLoading={isLoading} />
=======
              <TopHeader selectedFarmInfo={selectedFarmInfo} isLoading={isLoading} />
>>>>>>> staging
            </Box>
            <Box margin={{ top: 'medium' }}>
              <NumericInput
                label={`Deposit ${
                  selectedSupportedToken ? selectedSupportedToken?.label : ''
                }`}
<<<<<<< HEAD
                tokenSign={selectedFarm?.sign}
=======
                tokenSign={selectedSupportedToken?.sign}
>>>>>>> staging
                onValueChange={handleDepositValueChange}
                value={depositValue}
                isLoadingMaxValue={isFetchingSupportedTokenInfo}
                maxButton={true}
<<<<<<< HEAD
                maxValue={selectedSupportedTokenInfo?.balance}
                tokenOptions={selectedFarm?.supportedTokens || []}
=======
                maxValue={selectedSupportedTokenInfo.current?.balance}
                tokenOptions={selectedFarmInfo.current?.supportedTokens || []}
>>>>>>> staging
                selectedToken={selectedSupportedToken}
                setSelectedToken={selectSupportedToken}
                error={depositValueError}
                disabled={isLoading}
              />
            </Box>
            <Box margin={{ top: '11px' }}>
              <ProjectedWeeklyInfo
<<<<<<< HEAD
                depositedAmount={selectedFarm?.depositedAmount}
                inputValue={depositValue}
                interest={selectedFarm?.interest}
                sign={selectedFarm?.sign}
=======
                depositedAmount={selectedFarmInfo.current?.depositedAmount}
                inputValue={depositValue}
                interest={selectedFarmInfo.current?.interest}
                sign={selectedFarmInfo.current?.sign}
>>>>>>> staging
                isLoading={isLoading}
              />
              <Info
                label="APY"
                value={
<<<<<<< HEAD
                  toExactFixed(selectedFarm?.interest, 2).toLocaleString() + '%'
=======
                  toExactFixed(selectedFarmInfo.current?.interest, 2).toLocaleString() + '%'
>>>>>>> staging
                }
                isLoading={isLoading}
              />
              <Info
                label="Pool liquidity"
                value={
<<<<<<< HEAD
                  selectedFarm?.sign +
                  (+selectedFarm?.totalAssetSupply).toLocaleString()
=======
                  selectedFarmInfo.current?.sign +
                  (+selectedFarmInfo.current?.totalAssetSupply).toLocaleString()
>>>>>>> staging
                }
                isLoading={isLoading}
              />
              <FeeInfo
<<<<<<< HEAD
                biconomyToggle={selectedFarm?.chain == EChain.POLYGON}
                useBiconomy={useBiconomy}
                setUseBiconomy={setUseBiconomy}
                showWalletFee={
                  !useBiconomy || selectedFarm?.chain != EChain.POLYGON
=======
                biconomyToggle={selectedFarmInfo.current?.chain == EChain.POLYGON}
                useBiconomy={false}
                setUseBiconomy={setUseBiconomy}
                showWalletFee={
                  !useBiconomy || selectedFarmInfo.current?.chain != EChain.POLYGON
>>>>>>> staging
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
<<<<<<< HEAD
              : selectedSupportedTokenSteps?.length > 1
              ? `Step ${currentStep + 1} of ${
                  selectedSupportedTokenSteps?.length
                }: ${selectedSupportedTokenSteps[currentStep]?.label}`
              : `${selectedSupportedTokenSteps[currentStep]?.label}`
=======
              : selectedSupportedTokenSteps.current?.length > 1
              ? `Step ${currentStep + 1} of ${
                  selectedSupportedTokenSteps.current?.length
                }: ${selectedSupportedTokenSteps.current[currentStep]?.label}`
              : `${selectedSupportedTokenSteps.current[currentStep]?.label}`
>>>>>>> staging
          }
          onClick={handleCurrentStep}
        />
      </Box>
    </Box>
  );
};
