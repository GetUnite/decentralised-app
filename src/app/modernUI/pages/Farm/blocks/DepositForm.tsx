import { useDepositForm } from 'app/common/state/farm';
import { NumericInput, Spinner, SubmitButton } from 'app/modernUI/components';
import { Box, Text } from 'grommet';
import { Infos } from './Infos';
import { TopHeader } from './TopHeader';

export const DepositForm = ({
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
    handleDepositFieldChange,
    isApproving,
    handleApprove,
    isDepositing,
    handleDeposit,
    setUseBiconomy,
    useBiconomy,
  } = useDepositForm({ selectedFarm, selectedSupportedToken, updateFarmInfo });

  return (
    <Box fill>
      {!selectedSupportedToken || isApproving || isDepositing ? (
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
                onValueChange={handleDepositFieldChange}
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
            <Infos
              selectedFarm={selectedFarm}
              inputValue={depositValue}
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
            isApproving || isDepositing || !(+depositValue > 0) || hasErrors
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
