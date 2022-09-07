import { useEffect, useRef } from 'react';
type TCallback = (
  e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>,
) => void;
export function useEventListener(el, event, callback, options) {
  const savedCallback = useRef<TCallback>();
  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    if ('current' in el) {
      el = el.current;
    }
  });

  useEffect(() => {
    const handler: React.MouseEventHandler<
      HTMLButtonElement | HTMLAnchorElement
    > = e => {
      if (savedCallback?.current) savedCallback?.current?.(e);
    };

    if (el) {
      el.addEventListener(event, handler, options);
      return () => {
        el.removeEventListener(event, handler, options);
      };
    }
  }, [el, event, options]);
}

export default useEventListener;
