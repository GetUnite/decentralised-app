import { toExactFixed } from 'app/common/functions/utils';
import { tokenInfo } from 'app/common/state/atoms';
import { useBuy } from 'app/common/state/buy';
import { Info, Input, Notification, Spinner } from 'app/modernUI/components';
import { Box, Button, Text } from 'grommet';
import { useState } from 'react';
import { useRecoilState } from 'recoil';

export const BuyTab = ({ ...rest }) => {
  const {
    notificationId,
    wethBalance,
    vlAlluoBalance,
    allowance,
    totalSupply,
    error,
    inputValue,
    isApproving,
    isBuying,
    handleValueChange,
    handleSetLockToMax,
    handleApprove,
    handleBuyAction,
    handleBuyAndLockAction,
    alluoPriceInWETH,
    setToMax,
  } = useBuy();
  const [tokenInfoAtom, setTokenInfoAtom] = useRecoilState(tokenInfo);
  const [reset, setReset] = useState(0);
  const alluoBeingBought = toExactFixed(
    (+inputValue || 0) * +alluoPriceInWETH,
    2,
  );
  return (
    <Box fill>
      {tokenInfoAtom.isLoading || isApproving || isBuying ? (
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
            {' '}
            <Text textAlign="center" weight="bold">
              You have {wethBalance.toLocaleString()} WETH available to buy
              $ALLUO
            </Text>
            <Box margin={{ top: 'medium' }}>
              <Input
                inputProps={{
                  value: inputValue || '',
                  onChange: handleValueChange,
                  max: wethBalance || 0,
                }}
                maxButtonProps={{ onClick: setToMax }}
              />
              <Text color="error" size="small" margin={{ top: 'small' }}>
                {error}
              </Text>
            </Box>
          </Box>
          <Box margin={{ top: 'medium' }}>
            <Info
              label="Amount of $ALLUO"
              value={(+alluoBeingBought).toLocaleString()}
            />
            <Info
              label="Total $ALLUO locked"
              value={(+totalSupply).toLocaleString()}
            />
            <Info
              label="You percentage of total supply"
              value={
                toExactFixed(
                  ((+alluoBeingBought + +vlAlluoBalance) / +totalSupply) * 100,
                  3,
                ) + '%'
              }
            />
          </Box>
        </>
      )}

      <Box margin={{ top: 'large' }}>
        {+allowance < +inputValue ? (
          <Button
            primary
            disabled={
              !(+inputValue > 0) ||
              +inputValue > +wethBalance ||
              tokenInfoAtom.isLoading ||
              isApproving ||
              isBuying
            }
            label={'Approve'}
            onClick={handleApprove}
          />
        ) : (
          <>
            <Button
              color="#BBDAFF"
              disabled={
                !(+inputValue > 0) ||
                +inputValue > +wethBalance ||
                tokenInfoAtom.isLoading ||
                isApproving ||
                isBuying
              }
              label={<Text color="text">Buy</Text>}
              onClick={handleBuyAction}
            />
            <Button
              primary
              disabled={
                !(+inputValue > 0) ||
                +inputValue > +wethBalance ||
                tokenInfoAtom.isLoading ||
                isApproving ||
                isBuying
              }
              margin={{ top: 'small' }}
              label={`Buy & Stake to earn ${tokenInfoAtom.apr}% APR`}
              onClick={handleBuyAndLockAction}
            />
          </>
        )}
      </Box>
    </Box>
  );
};
