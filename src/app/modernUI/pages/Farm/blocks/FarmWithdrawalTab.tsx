import { EChain } from 'app/common/constants/chains';
import { toExactFixed } from 'app/common/functions/utils';
import { useFarmWithdrawal } from 'app/common/state/farm';
import {
  FeeInfo,
  Info,
  NumericInput,
  ProjectedWeeklyInfo,
  SubmitButton
} from 'app/modernUI/components';
import { Box } from 'grommet';
import { TopHeader } from '../components';

export const FarmWithdrawalTab = ({
  selectedFarm,
  selectedFarmInfo,
  isLoading,
  selectSupportedToken,
  selectedSupportedToken,
  // withdraw
  withdrawValue,
  setWithdrawValue,
  // biconomy
  useBiconomy,
  setUseBiconomy,
  // steps
  startProcessingSteps,
  steps,
}) => {
  const {
    hasErrors,
    withdrawValueError,
    handleWithdrawalFieldChange,
    isWithdrawalRequestsLoading,
  } = useFarmWithdrawal({
    withdrawValue,
    selectedSupportedToken,
    selectedFarmInfo,
    setWithdrawValue,
    steps,
  });

  return (
    <Box fill>
      <Box margin={{ top: 'large' }}>
        <TopHeader selectedFarmInfo={selectedFarmInfo} isLoading={isLoading} />
        <Box margin={{ top: 'medium' }}>
          <NumericInput
            label={`Withdraw ${
              selectedSupportedToken ? selectedSupportedToken?.label : ''
            }`}
            available={selectedFarmInfo?.depositedAmount}
            tokenSign={selectedFarmInfo?.sign}
            onValueChange={handleWithdrawalFieldChange}
            value={withdrawValue}
            maxButton={true}
            maxValue={selectedFarmInfo?.depositedAmount}
            tokenOptions={selectedFarmInfo?.supportedTokens || []}
            selectedToken={selectedSupportedToken}
            setSelectedToken={selectSupportedToken}
            error={withdrawValueError}
            disabled={isLoading}
          />
        </Box>
      </Box>
      <Box margin={{ top: '11px' }}>
        <ProjectedWeeklyInfo
          depositedAmount={selectedFarmInfo?.depositedAmount}
          inputValue={-1 * +withdrawValue}
          interest={selectedFarmInfo?.interest}
          sign={selectedFarmInfo?.sign}
          isLoading={isLoading}
        />
        <Info
          label="APY"
          value={
            toExactFixed(selectedFarmInfo?.interest, 2).toLocaleString() + '%'
          }
          isLoading={isLoading}
        />
        <Info
          label="Pool liquidity"
          value={
            selectedFarmInfo?.sign +
            (+selectedFarmInfo?.totalAssetSupply).toLocaleString()
          }
          isLoading={isLoading}
        />
        <FeeInfo
          biconomyToggle={selectedFarm.current?.chain == EChain.POLYGON}
          useBiconomy={useBiconomy}
          setUseBiconomy={setUseBiconomy}
          showWalletFee={
            !useBiconomy || selectedFarm.current?.chain != EChain.POLYGON
          }
          isLoading={isLoading}
        />
      </Box>
      <Box margin={{ top: 'medium' }}>
        <SubmitButton
          primary
          label={'Withdraw'}
          disabled={
            isLoading ||
            isWithdrawalRequestsLoading ||
            withdrawValue == '' ||
            hasErrors
          }
          onClick={startProcessingSteps}
        />
      </Box>
    </Box>
  );
};
