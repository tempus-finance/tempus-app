import { FC } from 'react';
import Sidebar from '../sidebar/Sidebar';

import './Main.scss';

const Main: FC = () => {
  return (
    <div className="tc__main">
      <Sidebar />
    </div>
  );
};

export default Main;
