import { useState } from 'react';

export const useStreamCard = ({endDate}) => {
  // edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  // inputs
  const [streamValue, setStreamValue] = useState<string>('');
  const [streamValueError, setStreamValueError] = useState<string>('');
  const [newEndDate, setNewEndDate] = useState<string>(endDate);

  // confirmation/information
  const [stopStreamConfirmation, setStopStreamConfirmation] = useState(false);

  /*useEffect(() => {
    if (alluoInfo?.allowance != undefined) {
      loadRequiredSteps();
    }
  }, [alluoInfo]);*/

  return {
    isEditMode,
    setIsEditMode,
    // inputs
    newEndDate,
    setNewEndDate,
    streamValue,
    setStreamValue,
    // confirmations
    stopStreamConfirmation,
    setStopStreamConfirmation,
  };
};
