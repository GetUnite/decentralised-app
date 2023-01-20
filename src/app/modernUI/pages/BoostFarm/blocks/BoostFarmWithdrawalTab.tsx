import { EChain } from 'app/common/constants/chains';
import { toExactFixed } from 'app/common/functions/utils';
import { useBoostFarmWithdrawal } from 'app/common/state/boostFarm';
import {
  FeeInfo,
  Info,
  NumericInput,
  ProjectedWeeklyInfo, SubmitButton
} from 'app/modernUI/components';
import { Box } from 'grommet';
import { TopHeader } from '../components';

export const BoostFarmWithdrawalTab = ({
  // farm
  isLoading,
  selectedFarmInfo,
  selectSupportedToken,
  selectedSupportedToken,isCorrectNetworkAtom,
  // withdraw
  withdrawValue,
  setWithdrawValue,
  selectedSupportedTokenInfo,
  startBoostWithdrawalConfirmation,
  // biconomy
  useBiconomy,
  setUseBiconomy,
}) => {
  const {
    hasErrors,
    withdrawValueError,
    handleWithdrawalFieldChange,
    isFetchingSupportedTokenInfo,
  } = useBoostFarmWithdrawal({
    selectedFarmInfo,
    selectedSupportedToken,
    selectedSupportedTokenInfo,
    withdrawValue,
    setWithdrawValue,
  });

  return (
    <Box fill>
      <Box margin={{ top: 'large' }}>
        <TopHeader selectedFarmInfo={selectedFarmInfo} isLoading={isLoading} isCorrectNetworkAtom={isCorrectNetworkAtom}/>
      </Box>
      <Box margin={{ top: 'medium' }}>
        <NumericInput
          label={`Withdraw ${
            selectedSupportedToken ? selectedSupportedToken?.label : ''
          }`}
          available={selectedSupportedTokenInfo.current?.boostDepositedAmount}
          tokenSign={selectedSupportedToken?.sign}
          onValueChange={handleWithdrawalFieldChange}
          value={withdrawValue}
          maxButton={true}
          maxValue={selectedSupportedTokenInfo.current?.boostDepositedAmount}
          tokenOptions={selectedFarmInfo.current?.supportedTokens || []}
          selectedToken={selectedSupportedToken}
          setSelectedToken={selectSupportedToken}
          error={withdrawValueError}
          slippageWarning={true}
          lowSlippageTokenLabels={
            selectedFarmInfo.current?.lowSlippageTokenLabels
          }
          disabled={isLoading}
        />
      </Box>
      <Box margin={{ top: '11px' }}>
        <ProjectedWeeklyInfo
          depositedAmount={selectedFarmInfo.current?.depositedAmount}
          inputValue={-1 * +withdrawValue}
          interest={selectedFarmInfo.current?.interest}
          sign={selectedFarmInfo.current?.sign}
          isLoading={isLoading}
          isCorrectNetworkAtom={isCorrectNetworkAtom}
        />
        <Info
          label="APY"
          value={
            toExactFixed(
              selectedFarmInfo.current?.interest,
              2,
            ).toLocaleString() + '%'
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
          useBiconomy={useBiconomy}
          setUseBiconomy={setUseBiconomy}
          showWalletFee={
            !useBiconomy || selectedFarmInfo.current?.chain != EChain.POLYGON
          }
          disableBiconomy={isLoading}
          isLoading={isLoading}
        />
      </Box>
      <Box margin={{ top: 'medium' }}>
        <SubmitButton
          primary
          label="Withdraw"
          disabled={
            isLoading ||
            isFetchingSupportedTokenInfo ||
            withdrawValue == '' ||
            hasErrors
          }
          onClick={() =>
            startBoostWithdrawalConfirmation(
              selectedSupportedTokenInfo.current?.boostDepositedAmount,
            )
          }
        />
      </Box>
    </Box>
  );
};
