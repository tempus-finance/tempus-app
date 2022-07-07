import { memo, useEffect } from 'react';
import GrantsCommittee from './GrantsCommittee';
import Footer from '../Footer';
import Join from '../Join';

import './GovernancePage.scss';

const GovernancePage = (): JSX.Element => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="tw__governance">
      <GrantsCommittee />
      <Join />
      <Footer />
    </div>
  );
};

export default memo(GovernancePage);
