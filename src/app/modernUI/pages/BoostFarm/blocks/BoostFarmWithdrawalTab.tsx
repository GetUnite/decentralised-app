import { EChain } from 'app/common/constants/chains';
import { toExactFixed } from 'app/common/functions/utils';
import { useBoostFarmWithdrawal } from 'app/common/state/boostFarm/useBoostFarmWithdrawal';
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
import { BoostFarmWithdrawalConfirmation } from './BoostFarmWithdrawalConfirmation';

export const BoostFarmWithdrawalTab = ({
  selectedFarm,
  isLoading,
  updateFarmInfo,
  selectSupportedToken,
  selectedSupportedToken,
  nextHarvestDate,
  showBoosterWithdrawalConfirmation,
  startBoosterWithdrawalConfirmation,
  cancelBoosterWithdrawalConfirmation,
  losablePendingRewards,
  ...rest
}) => {
  const {
    hasErrors,
    withdrawValueError,
    withdrawValue,
    handleWithdrawalFieldChange,
    isFetchingSupportedTokenInfo,
    isWithdrawing,
    handleWithdraw,
    useBiconomy,
    setUseBiconomy,
    selectedSupportedTokenInfo,
  } = useBoostFarmWithdrawal({
    selectedFarm,
    selectedSupportedToken,
    updateFarmInfo,
  });

  return (
    <Box fill>
      <Box
        style={{
          minHeight: selectedFarm?.isBooster
            ? '504px'
            : selectedFarm?.chain == EChain.POLYGON
            ? '462px'
            : '433px',
        }}
        justify="center"
      >
        {showBoosterWithdrawalConfirmation ? (
          <BoostFarmWithdrawalConfirmation
            selectedFarm={selectedFarm}
            withdrawValue={withdrawValue}
            withdrawTokenLabel={selectedSupportedToken.label}
            handleWithdraw={handleWithdraw}
            cancelBoosterWithdrawalConfirmation={
              cancelBoosterWithdrawalConfirmation
            }
            nextHarvestDate={nextHarvestDate}
            losablePendingRewards={losablePendingRewards}
          />
        ) : (
          <>
            {isLoading || !selectedSupportedToken || isWithdrawing ? (
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
                  <TopHeader selectedFarm={selectedFarm} />
                  <Box margin={{ top: 'medium' }}>
                    <NumericInput
                      label={'Withdraw ' + selectedSupportedToken.label}
                      available={
                        selectedSupportedTokenInfo.boostDepositedAmount
                      }
                      tokenSign={selectedSupportedToken.sign}
                      onValueChange={handleWithdrawalFieldChange}
                      value={withdrawValue}
                      maxValue={selectedSupportedTokenInfo.boostDepositedAmount}
                      tokenOptions={selectedFarm.supportedTokens || []}
                      selectedToken={selectedSupportedToken}
                      setSelectedToken={selectSupportedToken}
                      error={withdrawValueError}
                      slippageWarning={selectedFarm.isBooster}
                      lowSlippageTokenLabels={
                        selectedFarm.lowSlippageTokenLabels
                      }
                    />
                  </Box>
                </Box>

                <Box margin={{ top: 'medium' }}>
                  <ProjectedWeeklyInfo
                    depositedAmount={selectedFarm.depositedAmount}
                    inputValue={-1 * +withdrawValue}
                    interest={selectedFarm.interest}
                    sign={selectedFarm.sign}
                  />
                  <Info label="APY" value={toExactFixed(selectedFarm.interest,2).toLocaleString() + '%'} />
                  <Info
                    label="Pool liquidity"
                    value={
                      selectedFarm.sign +
                      (+selectedFarm.totalAssetSupply).toLocaleString()
                    }
                  />
                  <FeeInfo
                    biconomyToggle={selectedFarm.chain == EChain.POLYGON}
                    useBiconomy={useBiconomy}
                    setUseBiconomy={setUseBiconomy}
                    showWalletFee={
                      !useBiconomy || selectedFarm.chain != EChain.POLYGON
                    }
                  />
                </Box>
              </>
            )}
          </>
        )}
      </Box>
      {!showBoosterWithdrawalConfirmation && (
        <Box margin={{ top: 'medium' }}>
          <SubmitButton
            primary
            label={+withdrawValue > 0 ? 'Withdraw' : 'Enter amount'}
            disabled={
              isLoading ||
              isWithdrawing ||
              isFetchingSupportedTokenInfo ||
              !+withdrawValue ||
              hasErrors
            }
            onClick={() =>
              selectedFarm?.isBooster
                ? startBoosterWithdrawalConfirmation(withdrawValue)
                : handleWithdraw()
            }
          />
        </Box>
      )}
    </Box>
  );
};
