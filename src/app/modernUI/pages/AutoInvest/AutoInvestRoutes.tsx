import { Route, Routes } from 'react-router-dom';
import { Main } from '../Main';
import { AutoInvest } from './AutoInvest';
import { StartStreamModal } from './StartStreamModal';

export const AutoInvestRoutes = () => {
  return (
    <Routes>
      <Route path="start" element={<StartStreamModal />} />
      <Route path="/" element={<AutoInvest />} />
      <Route path="*" element={<Main />} />
    </Routes>
  );
};
