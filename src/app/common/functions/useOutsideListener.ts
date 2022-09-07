import { useEffect } from 'react';
export const useOutsideListener = (
  ref,
  callback = () => alert('outside clicked'),
  dependencies = [],
) => {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, ...dependencies]);
};
