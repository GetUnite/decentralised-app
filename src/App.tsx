import { Mobile } from 'app/modernUI/pages';
import { useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { IntercomProvider } from 'react-use-intercom';
import { RecoilRoot } from 'recoil';
import { Router } from './Router';

function App() {
  useEffect(() => {
    window.process = {
      ...window.process,
    };
  }, []);

  const [useWebApp, setUseWebApp] = useState<boolean>(false);
  
  return (
    <RecoilRoot>
      <IntercomProvider appId={process.env.REACT_APP_INTERCOM_APP_ID} autoBoot>
        {isMobile && !useWebApp ? <Mobile setUseWebApp={setUseWebApp}/> : <Router />}
      </IntercomProvider>
    </RecoilRoot>
  );
}

export default App;
