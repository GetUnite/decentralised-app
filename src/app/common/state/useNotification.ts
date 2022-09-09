import { useRecoilState } from 'recoil';
import { notification } from 'app/common/state/atoms';
export { ENotificationId } from 'app/common/state/atoms';

export const useNotification = () => {
  const [notificationAtom, setNotificationAtom] = useRecoilState(notification);

  const resetNotification = () =>
    setNotificationAtom({
      id: null,
      type: '',
      message: '',
    });

  const setNotification = (message, type) =>
    setNotificationAtom({
      id: null,
      type: type,
      message,
    });

  return {
    notification: notificationAtom,
    setNotification: setNotificationAtom,
    setNotificationt: setNotification,
    resetNotification,
  };
};
