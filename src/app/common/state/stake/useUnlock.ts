import {
  EChain,
  getTokenInfo,
  unlockAlluo,
  unlockAllAlluo,
  withdrawAlluo,
} from 'app/common/functions/Web3Client';
import { useState, useEffect, useReducer } from 'react';
import { useRecoilState } from 'recoil';
import Countdown, {
  formatTimeDelta,
  CountdownTimeDelta,
} from 'react-countdown';
import { tokenInfo, walletAccount } from '../atoms';
import { isNumeric } from 'app/common/functions/utils';
import { useNotification, ENotificationId, useChain } from 'app/common/state';

interface iState {
  unlockValue: string;
  isUnlocking: boolean;
}

enum EActionType {
  SETUNLOCKVALUE = 'setUnlockValue',
  SETISUNLOCKING = 'setIsUnlocking',
  RESETSTATE = 'resetState',
}

interface iUnlockingType {
  type: EActionType.SETISUNLOCKING;
  payload: boolean;
}

interface iUnlockAction {
  type: EActionType.SETUNLOCKVALUE;
  payload: number;
}

interface iReset {
  type: EActionType.RESETSTATE;
}

type DispatchType = iUnlockAction | iUnlockingType | iReset;

const reducer = (state: iState, action: DispatchType) => {
  switch (action.type) {
    case EActionType.SETUNLOCKVALUE:
      return { ...state, unlockValue: action.payload };
    case EActionType.SETISUNLOCKING:
      return { ...state, isUnlocking: action.payload };
    case EActionType.RESETSTATE:
      return { unlockValue: '', isApproving: false, isUnlocking: false };
    default:
      return state;
  }
};

export const useUnlock = () => {
  const { notification, setNotification } = useNotification();
  const [tokenInfoAtom, setTokenInfoAtom] = useRecoilState(tokenInfo);
  const [walletAccountAtom, setWalletAccountAtom] = useRecoilState(
    walletAccount,
  );
  const { changeChainTo } = useChain();

  const [{ unlockValue, isUnlocking }, dispatch] = useReducer(reducer, {
    unlockValue: '',
    isUnlocking: false,
  });

  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (walletAccountAtom) {
      changeChainTo(EChain.ETHEREUM);
    }
  }, [walletAccountAtom]);

  const resetState = () => {
    setError('');
    setErrorNotification('');
    setSuccessNotification();
    dispatch({ type: EActionType.RESETSTATE });
  };

  const setSuccessNotification = (message: string = '') => {
    setNotification({
      id: ENotificationId.UNLOCK,
      type: 'success',
      message,
    });
  };

  const setErrorNotification = (message: string = ''): void => {
    setNotification({
      id: ENotificationId.UNLOCK,
      type: 'error',
      message,
    });
  };

  const setInfoNotification = (message: string = ''): void => {
    setNotification({
      id: ENotificationId.UNLOCK,
      type: 'info',
      message,
    });
  };

  const rendererForUnlock = ({ completed, days, ...timeDelta }) => {
    const {
      hours,
      minutes,
      seconds,
    } = formatTimeDelta(timeDelta as CountdownTimeDelta, { zeroPadTime: 2 });
    if (completed) {
      return null;
    } else {
      // Render a countdown

      return { days: days > 0 && days + ' days', hours, minutes, seconds };
    }
  };

  const rendererForWithdraw = ({ completed, days, ...timeDelta }) => {
    const {
      hours,
      minutes,
      seconds,
    } = formatTimeDelta(timeDelta as CountdownTimeDelta, { zeroPadTime: 2 });

    if (completed) {
      return null;
    } else {
      // Render a countdown
      return { days: days > 0 && days + ' days', hours, minutes, seconds };
    }
  };

  const handleUnlockValueChange = e => {
    const { value } = e.target;
    resetState();

    if (
      isNumeric(value) ||
      ((value === '' || value === '.') &&
        value <= tokenInfoAtom.lockedAlluoValueOfUser)
    )
      dispatch({ type: EActionType.SETUNLOCKVALUE, payload: value });
    else setError('Write a valid number less than or equal to your balance');
  };

  const setAccountInformation = async () => {
    setTokenInfoAtom({
      isLoading: true,
    });

    const tokenInfoData = await getTokenInfo(walletAccountAtom);
    setTokenInfoAtom(tokenInfoData);
  };

  const handleUnlockAction = async () => {
    setErrorNotification('');
    setSuccessNotification();
    dispatch({ type: EActionType.SETISUNLOCKING, payload: true });
    try {
      /*console.log(
        'unlocking',
        tokenInfoAtom.lockedAlluoValueOfUser,
        tokenInfoAtom.lockedLPValueOfUser,
        unlockValue,
        +tokenInfoAtom.lockedLPValueOfUser * (+unlockValue / 100),
      );*/
      if (+unlockValue === 100) {
        await unlockAllAlluo();
      } else {
        const res = await unlockAlluo(
          +tokenInfoAtom.lockedLPValueOfUser * (+unlockValue / 100),
        );
      }
      setAccountInformation();
      setErrorNotification('');
      dispatch({ type: EActionType.SETUNLOCKVALUE, payload: null });
      setSuccessNotification('Successfully unlocked');
    } catch (err) {
      console.error('Error', err.message);
      resetState();
      setErrorNotification(err.message);
    }
    dispatch({ type: EActionType.SETISUNLOCKING, payload: false });
  };

  const withdraw = async () => {
    setErrorNotification('');
    setIsWithdrawing(true);
    try {
      const res = await withdrawAlluo();
      dispatch({ type: EActionType.SETUNLOCKVALUE, payload: null });
      resetState();
      setAccountInformation();
      setSuccessNotification('Successfully withdrew');
    } catch (err) {
      console.error('Error', err.message);
      resetState();
      setErrorNotification(err.message);
    }
    setIsWithdrawing(false);
  };

  const setToMax = () => {
    dispatch({
      type: EActionType.SETUNLOCKVALUE,
      payload: 100,
    });
  };

  return {
    notificationId: ENotificationId.UNLOCK,
    unlockValue,
    isUnlocking,
    isWithdrawing,
    handleUnlockValueChange,
    handleUnlockAction,
    withdraw,
    setToMax,
    setAccountInformation,
  };
};
