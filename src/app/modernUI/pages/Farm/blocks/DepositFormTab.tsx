import { EChain } from 'app/common/constants/chains';
import { useDeposit } from 'app/common/state/farm';
import {
  FeeInfo,
  Info,
  NumericInput,
  ProjectedWeeklyInfo,
  Spinner,
  SubmitButton
} from 'app/modernUI/components';
import { Box } from 'grommet';
import { TopHeader } from '../components/TopHeader';

export const DepositFormTab = ({
  isLoading,
  selectedFarm,
  updateFarmInfo,
  selectSupportedToken,
  selectedSupportedToken,
  ...rest
}) => {
  const {
    hasErrors,
    depositValueError,
    depositValue,
    handleDepositValueChange,
    isApproving,
    handleApprove,
    isDepositing,
    handleDeposit,
    setUseBiconomy,
    useBiconomy,
  } = useDeposit({ selectedFarm, selectedSupportedToken, updateFarmInfo });

  return (
    <Box fill>
      <Box
        style={{
          minHeight: selectedFarm?.chain == EChain.POLYGON ? '462px' : '433px',
        }}
        justify="center"
      >
        {isLoading || !selectedSupportedToken || isApproving || isDepositing ? (
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
                  label={'Deposit ' + selectedSupportedToken.label}
                  tokenSign={selectedFarm.sign}
                  onValueChange={handleDepositValueChange}
                  value={depositValue}
                  maxValue={selectedSupportedToken?.balance}
                  tokenOptions={selectedFarm.supportedTokens || []}
                  selectedToken={selectedSupportedToken}
                  setSelectedToken={selectSupportedToken}
                  error={depositValueError}
                />
              </Box>
            </Box>
            <Box margin={{ top: 'medium' }}>
              <ProjectedWeeklyInfo
                depositedAmount={selectedFarm.depositedAmount}
                inputValue={depositValue}
                interest={selectedFarm.interest}
                sign={selectedFarm.sign}
              />
              <Info label="APY" value={selectedFarm.interest + '%'} />
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
      </Box>
      <Box margin={{ top: 'medium' }}>
        <SubmitButton
          primary
          disabled={
            isLoading ||
            isApproving ||
            isDepositing ||
            !(+depositValue > 0) ||
            hasErrors
          }
          label={
            +depositValue > 0
              ? +selectedSupportedToken?.allowance >= +depositValue
                ? 'Deposit'
                : 'Approve'
              : 'Enter amount'
          }
          onClick={
            +selectedSupportedToken?.allowance >= +depositValue
              ? handleDeposit
              : handleApprove
          }
        />
      </Box>
    </Box>
  );
};
