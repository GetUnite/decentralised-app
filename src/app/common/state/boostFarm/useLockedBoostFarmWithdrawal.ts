import { getMaximumLPValueAsToken } from 'app/common/functions/boostFarm';
import { TPossibleStep } from 'app/common/types/global';
import openVault from 'app/modernUI/animations/openVault.svg';
import vaultUnlocking from 'app/modernUI/animations/vaultUnlocking.svg';
import { useEffect, useState } from 'react';

export const possibleLockedWithdrawSteps: TPossibleStep[] = [
  {
    id: 5,
    label: '',
    errorLabel: 'Failed to withdraw tokens',
    successLabel: '',
    image: vaultUnlocking,
    successImage: openVault,
  },
];

export const useLockedBoostFarmWithdrawal = ({
  selectedFarmInfo,
  selectedSupportedToken,
  selectedSupportedTokenInfo,
  steps,
  startProcessingSteps,
}) => {
  // loading control
  const [isFetchingSupportedTokenInfo, setIsFetchingSupportedTokenInfo] =
    useState(true);

  // when the selected token changes, trigger balance update
  useEffect(() => {
    if (selectedFarmInfo && selectedSupportedToken) {
      updateSelectedTokenBalance();
    }
  }, [selectedSupportedToken]);

  // function that updates the balance of the selected token on change
  const updateSelectedTokenBalance = async () => {
    setIsFetchingSupportedTokenInfo(true);

    const unlockedBalance =
      selectedFarmInfo.current?.depositedAmountInLP > 0
        ? await getMaximumLPValueAsToken(
            selectedFarmInfo.current.farmAddress,
            selectedSupportedToken.address,
            selectedSupportedToken.decimals,
            selectedFarmInfo.current.unlockedBalance,
          )
        : 0;
    selectedSupportedTokenInfo.current = {
      ...selectedSupportedTokenInfo.current,
      unlocked: unlockedBalance,
    };

    setIsFetchingSupportedTokenInfo(false);
  };

  const updateSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    // Withdraw/Unlock step is always there
    var stepToAdd = possibleLockedWithdrawSteps[0];
    neededSteps.push({
      ...stepToAdd,
      label: `${stepToAdd.label} ${selectedSupportedTokenInfo.current?.unlocked} ${selectedSupportedToken.label}`,
      successLabel: `${selectedSupportedTokenInfo.current?.unlocked} ${selectedSupportedToken.label} withdrawn`,
    });

    steps.current = neededSteps;
  };

  const updateStepsAndStartProcessing = async () => {
    // updates steps
    await updateSteps();
    // starts steps
    startProcessingSteps();
  };

  return {
    isFetchingSupportedTokenInfo,
    updateStepsAndStartProcessing,
  };
};
