import { useDepositForm } from 'app/common/state/farm';
import { NewInput, Spinner } from 'app/modernUI/components';
import { Box, Button, Text } from 'grommet';
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
    error,
    depositValue,
    handleDepositFieldChange,
    setToMax,
    isApproving,
    handleApprove,
    isDepositing,
    handleDeposit,
    setBiconomyStatus,
    biconomyStatus,
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
              <NewInput
                coinIcon={selectedFarm.sign}
                inputProps={{
                  value: depositValue || '',
                  onChange: handleDepositFieldChange,
                  max: selectedSupportedToken?.balance || 0,
                }}
                maxButtonProps={{
                  onClick: setToMax,
                }}
                selectProps={{
                  options: selectedFarm.stableCoins || [],
                }}
                selectedTokenInfo={selectedSupportedToken}
                setSelectedToken={selectSupportedToken}
              />
              <Text color="error" size="small" margin={{ top: 'small' }}>
                {error}
              </Text>
            </Box>
          </Box>
          <Box margin={{ top: 'medium' }}>
            <Infos
              selectedFarm={selectedFarm}
              inputValue={depositValue}
              biconomyStatus={biconomyStatus}
              setBiconomyStatus={setBiconomyStatus}
            />
          </Box>
        </>
      )}

      <Box margin={{ top: 'medium' }}>
        <Button
          primary
          disabled={
            isApproving || isDepositing || !(+depositValue > 0) || error !== ''
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
