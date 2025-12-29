import { Routes, Route, Navigate } from 'react-router-dom';
import Page0View from './Page0View';

const Page0Routes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Page0View />} />
        <Route path="*" element={<Navigate to="/new/page0" replace />} />
      </Routes>
    </>
  );
};

export default Page0Routes; 