import { startStream, stopStream } from 'app/common/functions/autoInvest';
import { TPossibleStep } from 'app/common/types/global';
import { useEffect, useRef, useState } from 'react';
import { useProcessingSteps } from '../useProcessingSteps';

const possibleEditStreamSteps: TPossibleStep[] = [
  {
    id: 0,
    label: 'Cancel old stream',
    successLabel: 'Old stream cancelled',
    errorLabel: 'Failed to cancel old stream',
  },
  {
    id: 1,
    label: 'Start new stream',
    errorLabel: 'Failed to start new stream',
  },
];

export const useStreamCard = ({
  endDate,
  from,
  sourceDepositedAmount,
  fromAddress,
  fromStAddress,
  to,
  toAddress,
  toStAddress,
  updateAutoInvestInfo,
}) => {
  // edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    isProcessing,
    setIsProcessing,
    currentStep,
    steps,
    stepWasSuccessful,
    stepError,
    successTransactionHash,
    resetProcessing,
    isHandlingStep,
    setIsHandlingStep,
  } = useProcessingSteps();

  // inputs
  const [streamValue, setStreamValue] = useState<string>('');
  const [streamValueError, setStreamValueError] = useState<string>('');

  const [newEndDate, setNewEndDate] = useState<string>(endDate);
  const [newEndDateError, setNewEndDateError] = useState<string>('');
  const hourlyStreamValue = useRef<number>();

  // confirmation/information
  const [stopStreamConfirmation, setStopStreamConfirmation] = useState(false);
  const [addFundsConfirmation, setAddFundsConfirmation] = useState(false);

  useEffect(() => {
    if (isEditMode == false) {
      setStreamValue('');
      setStreamValueError('');
      setNewEndDate(endDate);
      setNewEndDateError('');
    }
  }, [isEditMode]);

  useEffect(() => {
    validateInputs(streamValue);
  }, [newEndDate]);

  const validateInputs = value => {
    setStreamValueError('');
    setNewEndDateError('');
    if (streamValue != '') {
      hourlyStreamValue.current = +streamValue / 730;
      if (hourlyStreamValue.current * 24 > sourceDepositedAmount) {
        setStreamValueError('Your funds are too low for this stream');
      }
    }
    const d = new Date(newEndDate);
    if (d.getFullYear() > 1970) {
      if (new Date().getTime() > d.getTime()) {
        setNewEndDateError(`The end date of the stream can't be in the past`);
      }
    }
    setStreamValue(value);
  };

  const startProcessingSteps = async () => {
    let neededSteps: TPossibleStep[] = [];

    neededSteps.push(possibleEditStreamSteps[0]);

    neededSteps.push({
      ...possibleEditStreamSteps[1],
      successMessage: `You are now streaming ${streamValue} ${from} per month to ${to}`,
    });

    steps.current = neededSteps;

    setIsProcessing(true);
    await handleCurrentStep();
  };

  const stopProcessingSteps = async () => {
    resetProcessing();
    updateAutoInvestInfo();
  };

  const handleStartStream = async () => {
    try {
      const d = new Date(newEndDate);
      const timeToStreamInSeconds = Math.floor(
        (d.getTime() - new Date().getTime()) / 1000,
      );
      // data from the selected output
      const tx = await startStream(
        fromAddress,
        fromStAddress,
        toStAddress,
        toAddress,
        +streamValue,
        d.getFullYear() > 1970 ? timeToStreamInSeconds : null,
        false, //useBiconomy,
      );
      successTransactionHash.current = tx?.transactionHash;
    } catch (error) {
      throw error;
    }
  };

  const handleStopStream = async () => {
    try {
      const tx = await stopStream(
        fromAddress,
        toAddress,
        false, // use biconomy here
      );
      successTransactionHash.current = tx?.transactionHash;
    } catch (err) {
      throw err;
    }
  };

  // executes the handle for the current step
  const handleCurrentStep = async () => {
    setIsHandlingStep(true);

    const step = possibleEditStreamSteps.find(
      step => step.id == steps.current[currentStep.current].id,
    );

    try {
      switch (step.id) {
        case 0:
          await handleStopStream();
          break;

        case 1:
          await handleStartStream();
          break;
      }
      stepWasSuccessful.current = true;
    } catch (error) {
      stepError.current = error;
      stepWasSuccessful.current = false;
    }
    setIsHandlingStep(false);
  };

  return {
    // errors
    hasErrors: streamValueError != '' || newEndDateError != '',
    streamValueError,
    newEndDateError,
    // edit mode
    isEditMode,
    setIsEditMode,
    // inputs
    newEndDate,
    setNewEndDate,
    streamValue,
    validateInputs,
    // confirmations
    stopStreamConfirmation,
    setStopStreamConfirmation,
    addFundsConfirmation,
    setAddFundsConfirmation,
    // steps
    isProcessing,
    currentStep,
    isHandlingStep,
    stepWasSuccessful,
    stepError,
    startProcessingSteps,
    stopProcessingSteps,
    steps,
    handleCurrentStep,
  };
};
