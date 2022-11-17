import { notification } from 'app/common/state/atoms';
import { useRecoilState } from 'recoil';
import { EChain } from '../constants/chains';
export { ENotificationId } from 'app/common/state/atoms';

export const useNotification = () => {
  const [notificationAtom, setNotificationAtom] = useRecoilState(notification);

  const resetNotification = () =>
    setNotificationAtom({
      id: null,
      type: '',
      message: '',
      txHash: '',
    });

  const setNotification = (message, type, txHash = null, chain = EChain.POLYGON) =>
    setNotificationAtom({
      id: null,
      type: type,
      message,
      txHash: txHash,
      chain: chain,
    });

  return {
    notification: notificationAtom,
    setNotification: setNotification,
    resetNotification,
  };
};
