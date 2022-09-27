import { toExactFixed } from 'app/common/functions/utils';
import { useBuy } from 'app/common/state/buy';
import {
  Info,
  NumericInput,
  Spinner,
  SubmitButton,
} from 'app/modernUI/components';
import { Box, Button, Text } from 'grommet';

export const BuyTab = ({ ...rest }) => {
  const {
    isLoading,
    alluoStakingAPR,
    wethBalance,
    vlAlluoBalance,
    allowance,
    totalSupply,
    inputValueError,
    inputValue,
    isApproving,
    isBuying,
    handleInputValueChange,
    handleApprove,
    handleBuyAction,
    handleBuyAndLockAction,
    alluoPriceInWETH,
    hasErrors,
  } = useBuy();
  const alluoBeingBought = toExactFixed(
    (+inputValue || 0) * +alluoPriceInWETH,
    2,
  );
  return (
    <Box fill>
      {isLoading || isApproving || isBuying ? (
        <Box
          align="center"
          justify="center"
          fill="vertical"
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
              <NumericInput
                label="Amount"
                onValueChange={handleInputValueChange}
                value={inputValue}
                maxValue={wethBalance}
                error={inputValueError}
              />
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
              isLoading ||
              isApproving ||
              isBuying ||
              hasErrors
            }
            label={'Approve'}
            onClick={handleApprove}
          />
        ) : (
          <>
            <SubmitButton
              color="#BBDAFF"
              disabled={
                !(+inputValue > 0) ||
                +inputValue > +wethBalance ||
                isLoading ||
                isApproving ||
                isBuying ||
                hasErrors
              }
              label={<Text color="text">Buy</Text>}
              onClick={handleBuyAction}
            />
            <SubmitButton
              primary
              disabled={
                !(+inputValue > 0) ||
                +inputValue > +wethBalance ||
                isLoading ||
                isApproving ||
                isBuying ||
                hasErrors
              }
              margin={{ top: 'small' }}
              label={`Buy & Stake to earn ${alluoStakingAPR}% APR`}
              onClick={handleBuyAndLockAction}
            />
          </>
        )}
      </Box>
    </Box>
  );
};
