import { useDepositForm } from 'app/common/state/farm';
import { NewInput, Spinner } from 'app/modernUI/components';
import { Box, Button, Text } from 'grommet';
import { Infos } from './Infos';
import { TopHeader } from './TopHeader';

export const DepositForm = ({
  selectedFarm,
  updateFarmInfo,
  selectStableCoin,
  selectedStableCoin,
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
  } = useDepositForm({ selectedFarm, selectedStableCoin, updateFarmInfo });

  return (
    <Box fill>
      {!selectedStableCoin || isApproving || isDepositing ? (
        <Box
          align="center"
          justify="center"
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
                  max: selectedStableCoin?.balance || 0,
                }}
                maxButtonProps={{
                  onClick: setToMax,
                }}
                selectProps={{
                  options: selectedFarm.stableCoins || [],
                }}
                selectedTokenInfo={selectedStableCoin}
                setSelectedToken={selectStableCoin}
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
              ? +selectedStableCoin?.allowance >= +depositValue
                ? 'Deposit'
                : 'Approve'
              : 'Enter amount'
          }
          onClick={
            +selectedStableCoin?.allowance >= +depositValue
              ? handleDeposit
              : handleApprove
          }
        />
      </Box>
    </Box>
  );
};
