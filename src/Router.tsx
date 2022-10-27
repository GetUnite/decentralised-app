import { Grommet } from 'grommet';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { mode } from 'app/common/state/atoms';
import { AutoInvestRoutes, Buy, Farm, Main, Stake, Transfer } from 'app/modernUI/pages';
import { theme as modernUITheme } from 'app/modernUI/theme';
import { SkeletonTheme } from 'react-loading-skeleton';

import 'react-loading-skeleton/dist/skeleton.css';
// import './scrollbar-default.css';
import { useWallet } from 'app/common/state';
import './reset.css';

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
            <Route path="/autoinvest/*" element={<AutoInvestRoutes />} />
            <Route path="*" element={<Main />} />
          </Routes>
        </SkeletonTheme>
      </Grommet>
    </BrowserRouter>
  );
};
