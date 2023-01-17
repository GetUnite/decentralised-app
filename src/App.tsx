import { useEffect } from 'react';
import {
  BrowserView,
  MobileView
} from 'react-device-detect';
import { IntercomProvider } from 'react-use-intercom';
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
      <IntercomProvider appId={process.env.REACT_APP_INTERCOM_APP_ID} autoBoot>
        <BrowserView>
          <Router />
        </BrowserView>
        <MobileView>
          <h1>This is rendered only on mobile</h1>
        </MobileView>
      </IntercomProvider>
    </RecoilRoot>
  );
}

export default App;
