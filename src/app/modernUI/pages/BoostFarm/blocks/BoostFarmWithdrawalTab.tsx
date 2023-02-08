import { EChain } from 'app/common/constants/chains';
import { toExactFixed } from 'app/common/functions/utils';
import { useBoostFarmWithdrawal } from 'app/common/state/boostFarm';
import {
  FeeInfo,
  Info,
  NumericInput,
  ProjectedWeeklyInfo,
  SubmitButton
} from 'app/modernUI/components';
import { Box } from 'grommet';
import { TopHeader } from '../components';

export const BoostFarmWithdrawalTab = ({
  // farm
  selectedFarm,
  isLoading,
  selectedFarmInfo,
  selectSupportedToken,
  selectedSupportedToken,
  isCorrectNetworkAtom,
  // withdraw
  withdrawValue,
  setWithdrawValue,
  selectedSupportedTokenInfo,
  startBoostWithdrawalConfirmation,
  // biconomy
  useBiconomy,
  setUseBiconomy,
  // steps
  steps,
}) => {
  const {
    hasErrors,
    withdrawValueError,
    handleWithdrawalFieldChange,
    isFetchingSupportedTokenInfo,
  } = useBoostFarmWithdrawal({
    selectedFarmInfo,
    selectSupportedToken,
    selectedSupportedToken,
    selectedSupportedTokenInfo,
    withdrawValue,
    setWithdrawValue,
    steps,
  });

  return (
    <Box fill>
      <Box margin={{ top: 'large' }}>
        <TopHeader
          selectedFarmInfo={selectedFarmInfo}
          isLoading={isLoading}
          isCorrectNetworkAtom={isCorrectNetworkAtom}
        />
      </Box>
      <Box margin={{ top: 'medium' }}>
        <NumericInput
          label={`${selectedFarm.current?.isLocked ? 'Unlock' : 'Withdraw'} ${
            selectedSupportedToken ? selectedSupportedToken?.label : ''
          }`}
          available={
            selectedFarm.current?.isLocked
              ? selectedFarmInfo.current?.depositedAmountInLP
              : selectedSupportedTokenInfo.current?.boostDepositedAmount
          }
          tokenSign={selectedSupportedToken?.sign}
          onValueChange={handleWithdrawalFieldChange}
          value={withdrawValue}
          maxButton={true}
          maxValue={
            selectedFarm.current?.isLocked
              ? selectedFarmInfo.current?.depositedAmountInLP
              : selectedSupportedTokenInfo.current?.boostDepositedAmount
          }
          tokenOptions={
            (selectedFarm.current?.isLocked
              ? [selectedFarmInfo.current?.withdrawToken]
              : selectedFarmInfo.current?.supportedTokens) || []
          }
          selectedToken={selectedSupportedToken}
          setSelectedToken={selectSupportedToken}
          error={withdrawValueError}
          inputWarning={
            selectedFarmInfo.current?.isLocked
              ? `The current value of ${toExactFixed(
                  selectedFarmInfo.current?.depositedAmountInLP,
                  2,
                )} ${selectedFarmInfo.current?.name} is $${toExactFixed(
                  selectedSupportedTokenInfo.current?.boostDepositedAmount,
                  2,
                )}`
              : `Withdrawing in any token other than
                    ${selectedFarmInfo.current?.lowSlippageTokenLabels?.join(
                      '/',
                    )} increases slippage.
                    Values shown are an approximation and may change subject to
                    exhange rates`
          }
          slippageWarning={!selectedFarmInfo.current?.isLocked}
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
        {selectedFarm.current?.isLocked && (
          <Info
            label="Unlocked balance"
            value={
              selectedFarmInfo.current?.sign +
              (+selectedFarmInfo.current?.unlockedBalance).toLocaleString()
            }
            isLoading={isLoading}
          />
        )}
        <FeeInfo
          biconomyToggle={selectedFarm.current?.chain == EChain.POLYGON}
          useBiconomy={useBiconomy}
          setUseBiconomy={setUseBiconomy}
          showWalletFee={
            !useBiconomy || selectedFarm.current?.chain != EChain.POLYGON
          }
          disableBiconomy={isLoading}
          isLoading={isLoading}
        />
      </Box>
      <Box margin={{ top: 'medium' }}>
        <SubmitButton
          primary
          label={
            isFetchingSupportedTokenInfo
              ? 'Loading...'
              : selectedFarm.current?.isLocked
              ? 'Unlock'
              : 'Withdraw'
          }
          // TODO get disabled back here
          /*disabled={
            isLoading ||
            isFetchingSupportedTokenInfo ||
            withdrawValue == '' ||
            hasErrors
          }*/
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
