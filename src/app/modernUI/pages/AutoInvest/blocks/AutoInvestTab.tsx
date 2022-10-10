import { useAutoInvestTab } from 'app/common/state/autoInvest';
import {
  DateInput,
  FeeInfo,
  Info,
  ProjectedWeeklyInfo,
  Spinner,
  StreamInput,
  SubmitButton
} from 'app/modernUI/components';
import { RightAlignToggle } from 'app/modernUI/components/Toggles';
import { Box } from 'grommet';

export const AutoInvestTab = ({ ...rest }) => {
  const {
    streamValue,
    handleStreamValueChange,
    selectedSupportedFromToken,
    hasErrors,
    streamValueError,
    selectSupportedFromToken,
    supportedFromTokens,
    handleStartStream,
    isStartingStream,
    supportedToTokens,
    selectedSupportedToToken,
    selectSupportedToToken,
    targetFarmInfo,
    useBiconomy,
    setUseBiconomy,
    isLoading,
    useEndDate,
    setUseEndDate,
    endDate,
    setEndDate,
    allowance,
    handleApprove,
    isApproving,
  } = useAutoInvestTab();

  return (
    <Box fill>
      <Box style={{ minHeight: '382px' }} justify="center">
        {isLoading || isStartingStream || isApproving ? (
          <Box
            align="center"
            justify="center"
            fill="vertical"
            margin={{ top: 'large', bottom: 'medium' }}
          >
            <Spinner pad="large" />
          </Box>
        ) : (
          <Box margin={{ top: '46px' }}>
            <Box>
              <StreamInput
                label="Flow rate"
                tokenSign={selectedSupportedFromToken?.sign}
                onValueChange={handleStreamValueChange}
                value={streamValue}
                maxValue={selectedSupportedFromToken?.balance}
                fromTokenOptions={supportedFromTokens}
                selectedFromToken={selectedSupportedFromToken}
                setSelectedFromToken={selectSupportedFromToken}
                toTokenOptions={supportedToTokens}
                selectedToToken={selectedSupportedToToken}
                setSelectedToToken={selectSupportedToToken}
                error={streamValueError}
              />
              <RightAlignToggle
                isToggled={useEndDate}
                setIsToggled={setUseEndDate}
                label="Set end date for stream"
              />
              {useEndDate && (
                <DateInput
                  label="End date"
                  date={endDate}
                  setDate={setEndDate}
                />
              )}
            </Box>
            <Box margin={{ top: 'medium' }}>
              <ProjectedWeeklyInfo
                depositedAmount={targetFarmInfo.depositedAmount}
                inputValue={streamValueError}
                interest={targetFarmInfo.interest}
                sign={targetFarmInfo.sign}
              />
              <Info label="APY" value={targetFarmInfo.interest + '%'} />
              <Info
                label="Pool liquidity"
                value={
                  targetFarmInfo.sign +
                  (+targetFarmInfo.totalAssetSupply).toLocaleString()
                }
              />
              <FeeInfo
                useBiconomy={useBiconomy}
                setUseBiconomy={setUseBiconomy}
                showWalletFee={!useBiconomy}
              />
            </Box>
          </Box>
        )}
      </Box>
      <Box margin={{ top: 'large' }}>
        <SubmitButton
          primary
          disabled={isStartingStream || !(+(streamValue || 0) > 0) || hasErrors}
          label="Start stream"
          onClick={
            +allowance > +streamValue ? handleStartStream : handleApprove
          }
        />
      </Box>
    </Box>
  );
};
