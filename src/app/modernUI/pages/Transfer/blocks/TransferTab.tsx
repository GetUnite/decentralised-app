import { getCoinIcon } from 'app/common/functions/getCoinIcon';
import { usePolygonInfoAtom } from 'app/common/state/shortcuts';
import { NewInput, Spinner } from 'app/modernUI/components';
import { Info } from 'app/modernUI/components';
import SlideButton from 'app/modernUI/components/SlideButton';
import { useState } from 'react';
import { Box, Button, Text, TextInput } from 'grommet';
import { useTransfer } from 'app/common/state/transfer';
import { TopHeader } from './TopHeader';

export const TransferTab = ({ ...rest }) => {
  const { polygonInfoAtom, setPolygonInfoAtom, fetchTotalAssetSupply } =
    usePolygonInfoAtom();

  const [biconomyStatus, setBiconomyStatus] = useState(true);

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
  } = useTransfer();

  const coinIcon = getCoinIcon(selectedIbAlluoInfo?.type);
  return (
    <Box fill>
      {polygonInfoAtom.isLoading || isTransferring ? (
        <Box
          align="center"
          justify="center"
          margin={{ top: 'large', bottom: 'medium' }}
        >
          <Spinner pad="large" />
        </Box>
      ) : (
        <Box margin={{ top: 'large' }}>
          <TopHeader ibAlluosInfo={ibAlluosInfo} />
          <Box margin={{ top: 'medium' }}>
            <NewInput
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

             {biconomyStatus ? (
        <Info label="Gas fee" value={null}
          style={{
            border: 'none'
          }}
        >
          <div style={{fontSize: 'small'}}>
            <span>No fees 🎉 - Paid for by Alluo via </span>
            <a href="https://twitter.com/biconomy">Biconomy</a>
          </div>
          <SlideButton biconomyStatus={biconomyStatus} setBiconomyStatus={setBiconomyStatus}/>
        </Info>
      )
      :
      <Info label="Gas fee" 
        value={null} 
        style={{
          borderBottom: '0px'
        }} >
          <div style={{ textAlign: 'right', fontSize: 'small'}}>
            View Fee in metamask.
          </div>
          <SlideButton biconomyStatus={biconomyStatus} setBiconomyStatus={setBiconomyStatus}/>
      </Info>
    }
        </Box>
      )}
    
      <Box margin={{ top: 'large' }}>
        <Button
          primary
          disabled={
            isTransferring ||
            !(+(transferValue || 0) > 0) ||
            error !== '' ||
            recipientAddress === ''
          }
          label="Transfer"
          onClick={() => handleTransfer(biconomyStatus)}
        />
      </Box>
    </Box>
  );
};
