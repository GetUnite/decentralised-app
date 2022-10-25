import { Route, Routes } from 'react-router-dom';
import { AddStream } from './AddStream';
import { AutoInvest } from './AutoInvest';

export const AutoInvestRoutes = () => {
  return (
    <Routes>
      <Route path="add" element={<AddStream />} />
      <Route path="/" element={<AutoInvest />} />
    </Routes>
  );
};
