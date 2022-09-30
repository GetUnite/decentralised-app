import {
  Spinner,
  SubmitButton,
  StreamInput,
  Info,
  FeeInfo,
  ProjectedWeeklyInfo,
  DateInput,
} from 'app/modernUI/components';
import { Box } from 'grommet';
import { useAutoInvest } from 'app/common/state/autoInvest';
import { RightAlignToggle } from 'app/modernUI/components/Toggles';

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
  } = useAutoInvest();

  return (
    <Box fill>
      <Box style={{ minHeight: '382px' }} justify="center">
        {isLoading || isStartingStream ? (
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
          onClick={() => handleStartStream()}
        />
      </Box>
    </Box>
  );
};
