import { getCoinIcon } from 'app/common/functions/getCoinIcon';
import { usePolygonInfoAtom } from 'app/common/state/shortcuts';
import {
  NewInput,
  Spinner,
  SubmitButton,
  BiconomyToggle,
  FeeInfo,
} from 'app/modernUI/components';
import { Info } from 'app/modernUI/components';
import { useState } from 'react';
import { Box, Text, TextInput } from 'grommet';
import { useTransfer } from 'app/common/state/transfer';
import { TopHeader } from './TopHeader';
import { useRecoilState } from 'recoil';
import { isSafeApp } from 'app/common/state/atoms';

export const TransferTab = ({ ...rest }) => {
  const {
    error,
    transferValue,
    selectedIbAlluoInfo,
    setSelectedIbAlluoBySymbol,
    handleTransferValueChange,
    setToMax,
    isTransferring,
    handleTransfer,
    ibAlluosInfo,
    recipientAddress,
    handleRecipientAddressChange,
    isSafeAppAtom,
    useBiconomy,
    setUseBiconomy,
  } = useTransfer();

  const coinIcon = getCoinIcon(selectedIbAlluoInfo?.type);
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
            <NewInput
              inputLabel="Transfer"
              coinIcon={coinIcon}
              inputProps={{
                value: transferValue || '',
                onChange: handleTransferValueChange,
                max: selectedIbAlluoInfo?.balance || 0,
              }}
              maxButtonProps={{
                onClick: setToMax,
              }}
              selectProps={{
                options: ibAlluosInfo,
              }}
              selectedTokenInfo={selectedIbAlluoInfo}
              setSelectedToken={setSelectedIbAlluoBySymbol}
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
              {error}
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
            error !== '' ||
            recipientAddress === ''
          }
          label="Transfer"
          onClick={() => handleTransfer()}
        />
      </Box>
    </Box>
  );
};
