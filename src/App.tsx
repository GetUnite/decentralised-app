import { useEffect } from 'react';
import { RecoilRoot } from 'recoil';
import { Router } from './Router';

function App() {
  useEffect(() => {
    window.process = {
      ...window.process,
    };
  }, []);

  return (
    <RecoilRoot>
      <Router />
    </RecoilRoot>
  );
}

export default App;
