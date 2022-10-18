import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { Grommet } from 'grommet';

import { mode } from 'app/common/state/atoms';
import { theme as modernUITheme } from 'app/modernUI/theme';
import { Main, Farm, Stake, Buy, Transfer, AutoInvest } from 'app/modernUI/pages';
import { SkeletonTheme } from 'react-loading-skeleton';

import 'react-loading-skeleton/dist/skeleton.css';
// import './scrollbar-default.css';
import './reset.css';
import { useWallet } from 'app/common/state';

export const Router = () => {
  const [modeAtom] = useRecoilState(mode);
  useWallet();
  
  return (
    <BrowserRouter>
        <Grommet theme={modernUITheme} themeMode={modeAtom}>
          <SkeletonTheme
            baseColor={modeAtom === 'dark' ? '#202020' : '#ebebeb'}
            highlightColor={modeAtom === 'dark' ? '#444' : '#f5f5f5'}
          >
            <Routes>
              <Route path="/buy" element={<Buy />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/stake" element={<Stake />} />
              <Route path="/farm/:id" element={<Farm />} />
              <Route path="/auto-invest" element={<AutoInvest />} />
              <Route path="*" element={<Main />} />
            </Routes>
          </SkeletonTheme>
        </Grommet>
    </BrowserRouter>
  );
};
