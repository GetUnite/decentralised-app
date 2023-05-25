import { EChain } from 'app/common/constants/chains';
import { toExactFixed } from 'app/common/functions/utils';
import { useFarmDeposit } from 'app/common/state/farm';
import {
  FeeInfo,
  Info,
  NumericInput,
  ProjectedWeeklyInfo,
  SubmitButton
} from 'app/modernUI/components';
import { Box } from 'grommet';
import { TopHeader } from '../components';

export const FarmDepositTab = ({
  selectedFarm,
  isLoading,
  selectedFarmInfo,
  selectSupportedToken,
  selectedSupportedToken,
  selectedSupportedTokenInfo,
  // deposit
  depositValue,
  setDepositValue,
  // biconomy
  useBiconomy,
  setUseBiconomy,
  // steps   
  steps,
  startProcessingSteps
}) => {
  const {
    hasErrors,
    depositValueError,
    handleDepositValueChange,
    isFetchingSupportedTokenInfo,
  } = useFarmDeposit({
    selectedFarm,
    selectedSupportedToken,
    selectedSupportedTokenInfo,
    steps,
    depositValue,
    setDepositValue,
  });

  return (
    <Box fill>
      <Box margin={{ top: 'large' }}>
        <TopHeader selectedFarmInfo={selectedFarmInfo} isLoading={isLoading} />
        <Box margin={{ top: 'medium' }}>
          <NumericInput
            label={`Deposit ${
              selectedSupportedToken ? selectedSupportedToken?.label : ''
            }`}
            tokenSign={selectedFarmInfo?.sign}
            onValueChange={handleDepositValueChange}
            value={depositValue}
            maxValue={selectedSupportedTokenInfo.current?.balance}
            maxButton={true}
            tokenOptions={selectedFarmInfo?.supportedTokens || []}
            selectedToken={selectedSupportedToken}
            setSelectedToken={selectSupportedToken}
            error={depositValueError}
            disabled={isLoading}
          />
        </Box>
      </Box>
      <Box margin={{ top: '11px' }}>
        <ProjectedWeeklyInfo
          depositedAmount={selectedFarmInfo?.depositedAmount}
          inputValue={depositValue}
          interest={selectedFarmInfo?.interest}
          sign={selectedFarmInfo?.sign}
          isLoading={isLoading}
        />
        <Info
          label="APY"
          value={toExactFixed(selectedFarmInfo?.interest, 2).toLocaleString() + '%'}
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
          showWalletFee={!useBiconomy || selectedFarm.current?.chain != EChain.POLYGON}
          disableBiconomy={isLoading}
          isLoading={isLoading}
        />
      </Box>
      <Box margin={{ top: 'medium' }}>
        <SubmitButton
          primary
          disabled={
            isLoading ||
            !(+depositValue > 0) ||
            isFetchingSupportedTokenInfo ||
            hasErrors
          }
          label={
            isFetchingSupportedTokenInfo
              ? 'Loading...'
              : 'Deposit'
          }
          onClick={startProcessingSteps}
        />
      </Box>
    </Box>
  );
};
