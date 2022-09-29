import { Spinner, SubmitButton, StreamInput, Info, FeeInfo } from 'app/modernUI/components';
import { Box, Text, TextInput } from 'grommet';
import { useAutoInvest } from 'app/common/state/autoInvest';
import { useParams } from 'react-router-dom';

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
    selectSupportedToToken
  } = useAutoInvest();

  return (
    <Box fill>
      <Box style={{ minHeight: '380px' }} justify="center">
        {isStartingStream ? (
          <Box
            align="center"
            justify="center"
            fill="vertical"
            margin={{ top: 'large', bottom: 'medium' }}
          >
            <Spinner pad="large" />
          </Box>
        ) : (
          <Box margin={{ top: 'large' }}>
            <Box margin={{ top: 'medium' }}>
              <StreamInput
                label="Transfer"
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
            </Box>
            <Box margin={{ top: 'medium' }}>

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
