import { useWithdrawalForm } from 'app/common/state/farm';
import { NewInput, Spinner, SubmitButton, TokenAndValueInput } from 'app/modernUI/components';
import { Box, Text } from 'grommet';
import { Infos } from './Infos';
import { TopHeader } from './TopHeader';

export const WithdrawalForm = ({
  selectedFarm,
  isLoading,
  updateFarmInfo,
  selectSupportedToken,
  selectedSupportedToken,
  ...rest
}) => {
  const {
    hasErrors,
    withdrawValueError,
    withdrawValue,
    handleWithdrawalFieldChange,
    isWithdrawalRequestsLoading,
    isWithdrawing,
    handleWithdraw,
    useBiconomy,
    setUseBiconomy,
  } = useWithdrawalForm({
    selectedFarm,
    selectedSupportedToken,
    updateFarmInfo,
  });

  return (
    <Box fill>
      {!selectedSupportedToken ||
      isWithdrawing ||
      isWithdrawalRequestsLoading ? (
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
            <TokenAndValueInput
                label={'Withdraw ' + selectedSupportedToken.label}
                tokenSign={selectedFarm.sign}
                onValueChange={handleWithdrawalFieldChange}
                value={withdrawValue}
                maxValue={selectedFarm.depositedAmount}
                tokenOptions={selectedFarm.supportedTokens || []}
                selectedToken={selectedSupportedToken}
                setSelectedToken={selectSupportedToken}
                error={withdrawValueError}
              />
            </Box>
          </Box>

          <Box margin={{ top: 'medium' }}>
            <Infos
              selectedFarm={selectedFarm}
              inputValue={-1 * +withdrawValue}
              useBiconomy={useBiconomy}
              setUseBiconomy={setUseBiconomy}
            />
          </Box>
        </>
      )}
      <Box margin={{ top: 'medium' }}>
        <SubmitButton
          primary
          disabled={
            isWithdrawing ||
            isWithdrawalRequestsLoading ||
            !+withdrawValue ||
            hasErrors
          }
          label={+withdrawValue > 0 ? 'Withdraw' : 'Enter amount'}
          onClick={handleWithdraw}
        />
      </Box>
    </Box>
  );
};
