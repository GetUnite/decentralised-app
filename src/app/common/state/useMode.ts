import { useRecoilState } from 'recoil';
import { mode } from './atoms';

export const useMode = () => {
  const [modeAtom, setModeAtom] = useRecoilState(mode);
  const setMode = newMode => {
    setModeAtom(newMode);
  };
  const isLightMode = modeAtom === 'light';
  const toggleMode = () =>
    setModeAtom(prev => (prev === 'light' ? 'dark' : 'light'));
  return { isLightMode, mode: modeAtom, setMode, toggleMode };
};
