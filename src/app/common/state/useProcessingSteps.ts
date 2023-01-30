import { useRef, useState } from 'react';
import { TPossibleStep } from '../types/global';

export const useProcessingSteps = () => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const currentStep = useRef<number>(0);
  const steps = useRef<TPossibleStep[]>();
  const stepWasSuccessful = useRef<boolean>();
  const stepError = useRef<string>('');
  const successTransactionHash = useRef<string>('');
  const successImage = useRef<string>('');

  const resetProcessing = () => {
    currentStep.current = 0;
    stepWasSuccessful.current = undefined;
    setIsProcessing(false);
  };

  return {
    isProcessing,
    setIsProcessing,
    currentStep,
    steps,
    stepWasSuccessful,
    stepError,
    successTransactionHash,
    resetProcessing,
    successImage
  };
};
