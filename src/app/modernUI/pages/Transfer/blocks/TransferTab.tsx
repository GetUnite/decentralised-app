import {
  FeeInfo,
  NumericInput, SubmitButton
} from 'app/modernUI/components';
import { Box, Text, TextInput } from 'grommet';
import { TopHeader } from './TopHeader';

export const TransferTab = ({
  hasErrors,
  transferValueError,
  recipientAddressError,
  transferValue,
  selectedIbAlluoInfo,
  setSelectedIbAlluoBySymbol,
  handleTransferValueChange,
  ibAlluosInfo,
  recipientAddress,
  recipientAddressValue,
  handleRecipientAddressChange,
  useBiconomy,
  setUseBiconomy,
  isLoading,
  startProcessingSteps,
}) => {
  return (
    <Box fill>
      <Box margin={{ top: 'large' }}>
        <TopHeader ibAlluosInfo={ibAlluosInfo} isLoading={isLoading} />
        <Box margin={{ top: 'medium' }}>
          <NumericInput
            label="Transfer"
            tokenSign={selectedIbAlluoInfo?.sign}
            onValueChange={handleTransferValueChange}
            value={transferValue}
            maxValue={selectedIbAlluoInfo?.balance}
            maxButton={true}
            tokenOptions={ibAlluosInfo}
            selectedToken={selectedIbAlluoInfo}
            setSelectedToken={setSelectedIbAlluoBySymbol}
            error={transferValueError}
            disabled={isLoading}
          />
        </Box>
        <Box margin={{ top: '6px' }}>
          <Box direction="row" justify="between">
            <Text size="14px" color="soul">
              Recipient
            </Text>
          </Box>
          <Box margin={{ top: 'xxsmall' }}>
            <TextInput
              value={recipientAddress}
              onChange={handleRecipientAddressChange}
              placeholder="Address or Unstoppable domain"
              disabled={isLoading}
            />
          </Box>
          <Box height="13px" margin={{ top: '4px', bottom: '12px' }}>
            <Text
              color={recipientAddressValue != '' ? 'soul' : 'error'}
              size="small"
            >
              {recipientAddressValue != ''
                ? recipientAddressValue
                : recipientAddressError}
            </Text>
          </Box>
        </Box>
        <FeeInfo
          useBiconomy={useBiconomy}
          setUseBiconomy={setUseBiconomy}
          showWalletFee={!useBiconomy}
          disableBiconomy={isLoading}
          isLoading={isLoading}
        />
      </Box>
      <Box margin={{ top: 'medium' }}>
        <SubmitButton
          primary
          disabled={
            !(+(transferValue || 0) > 0) || hasErrors || recipientAddress === ''
          }
          label="Transfer"
          onClick={() => startProcessingSteps()}
        />
      </Box>
    </Box>
  );
};
