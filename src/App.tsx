import { useEffect } from 'react';
import { RecoilRoot } from 'recoil';
import { Router } from './Router';
import { IntercomProvider } from 'react-use-intercom';

function App() {
  useEffect(() => {
    window.process = {
      ...window.process,
    };
  }, []);

  return (
    <RecoilRoot>
      <IntercomProvider appId={process.env.REACT_APP_INTERCOM_APP_ID} autoBoot>
        <Router />
      </IntercomProvider>
    </RecoilRoot>
  );
}

export default App;
