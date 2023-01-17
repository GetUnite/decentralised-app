import { useTransfer } from 'app/common/state/transfer';
import {
  FeeInfo,
  NumericInput,
  Spinner,
  SubmitButton
} from 'app/modernUI/components';
import { Box, Text, TextInput } from 'grommet';
import { TopHeader } from './TopHeader';

export const TransferTab = ({ ...rest }) => {
  const {
    hasErrors,
    transferValueError,
    recipientAddressError,
    transferValue,
    selectedIbAlluoInfo,
    setSelectedIbAlluoBySymbol,
    handleTransferValueChange,
    isTransferring,
    handleTransfer,
    ibAlluosInfo,
    recipientAddress,
    recipientAddressValue,
    handleRecipientAddressChange,
    useBiconomy,
    setUseBiconomy,
    isLoading,
  } = useTransfer();

  return (
    <Box fill>
      <Box style={{ minHeight: '380px' }} justify="center">
        {isTransferring ? (
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
            <Box margin={{ top: '11px' }}>
              <Box direction="row" justify="between">
              <Text size="13px" color="soul">
                   {recipientAddressValue === '' ? 'Recipient' : `Recipient: ${recipientAddressValue}`}
                </Text>
              </Box>
              <TextInput
                value={recipientAddress}
                onChange={handleRecipientAddressChange}
<<<<<<< HEAD
                placeholder="Address or domain"
=======
                placeholder="Address or Unstoppable domain"
>>>>>>> staging
                disabled={isLoading}
              />
              <Text color="error" size="small" margin={{ top: 'small' }}>
                {recipientAddressError}
              </Text>
            </Box>
            <FeeInfo
              useBiconomy={useBiconomy}
              setUseBiconomy={setUseBiconomy}
              showWalletFee={!useBiconomy}
              disableBiconomy={isLoading}
              isLoading={isLoading}
            />
          </Box>
        )}
      </Box>
      <Box margin={{ top: 'large' }}>
        <SubmitButton
          primary
          disabled={
            isTransferring ||
            !(+(transferValue || 0) > 0) ||
            hasErrors ||
            recipientAddress === ''
          }
          label="Transfer"
          onClick={() => handleTransfer()}
        />
      </Box>
    </Box>
  );
};
