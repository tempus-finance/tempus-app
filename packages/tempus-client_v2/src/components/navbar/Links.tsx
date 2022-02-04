import Community from './Community';
import Settings from './Settings';

import './Links.scss';

const Links = () => {
  return (
    <div className="tc__navBar__links">
      <ul>
        <Community />
        <Settings />
      </ul>
    </div>
  );
};

export default Links;
