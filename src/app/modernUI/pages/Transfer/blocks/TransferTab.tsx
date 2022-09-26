import {
  Spinner,
  SubmitButton,
  FeeInfo,
  NumericInput,
} from 'app/modernUI/components';
import { Box, Text, TextInput } from 'grommet';
import { useTransfer } from 'app/common/state/transfer';
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
    handleRecipientAddressChange,
    useBiconomy,
    setUseBiconomy,
  } = useTransfer();

  return (
    <Box fill>
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
          <TopHeader ibAlluosInfo={ibAlluosInfo} />
          <Box margin={{ top: 'medium' }}>
            <NumericInput
              label="Transfer"
              tokenSign={selectedIbAlluoInfo?.sign}
              onValueChange={handleTransferValueChange}
              value={transferValue}
              maxValue={selectedIbAlluoInfo?.balance}
              tokenOptions={ibAlluosInfo}
              selectedToken={selectedIbAlluoInfo}
              setSelectedToken={setSelectedIbAlluoBySymbol}
              error={transferValueError}
            />
          </Box>
          <Box margin={{ top: 'medium' }}>
            <Box direction="row" justify="between">
              <Text size="medium" color="soul">
                Recipient
              </Text>
            </Box>
            <TextInput
              value={recipientAddress}
              onChange={handleRecipientAddressChange}
              placeholder="Address"
            />
            <Text color="error" size="small" margin={{ top: 'small' }}>
              {recipientAddressError}
            </Text>
          </Box>
          <FeeInfo
            useBiconomy={useBiconomy}
            setUseBiconomy={setUseBiconomy}
            showWalletFee={!useBiconomy}
          />
        </Box>
      )}
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
