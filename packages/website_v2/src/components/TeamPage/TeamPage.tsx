import { memo, useEffect } from 'react';
import TeamHeader from './TeamHeader';
import AllMembers from './Members';
import WorkedWith from './WorkedWith';
import Footer from '../Footer';
import Join from '../Join';

import './TeamPage.scss';

const TeamPage = (): JSX.Element => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="tw__team">
      <TeamHeader />
      <AllMembers />
      <WorkedWith />
      <Join theme="light" />
      <Footer />
    </div>
  );
};
export default memo(TeamPage);
