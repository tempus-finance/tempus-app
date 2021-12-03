import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootRoute from '../routes/RootRoute';

import './Main.scss';

const Main = () => {
  return (
    <div className="tc__main">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRoute />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default Main;
