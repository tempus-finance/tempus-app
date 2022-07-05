import TeamHeader from './TeamHeader';
import AllMembers from './Members';
import WorkedWith from './WorkedWith';
import Footer from '../Footer';
import Join from '../Join';

import './TeamPage.scss';

const TeamPage = (): JSX.Element => (
  <div className="tw__team">
    <TeamHeader />
    <AllMembers />
    <WorkedWith />
    <Join />
    <Footer />
  </div>
);
export default TeamPage;
