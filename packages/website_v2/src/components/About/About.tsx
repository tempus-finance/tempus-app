import { memo } from 'react';
import AboutGridItem from './AboutGridItem';
import { CommunityIcon, TeamIcon, VisionIcon } from './icons';
import { ScrollFadeIn } from '../shared';

import './About.scss';

const About = (): JSX.Element => (
  <div className="tw__about">
    <div className="tw__container tw__about__container">
      <div className="tw__about__separator" />
      <ScrollFadeIn>
        <h2 className="tw__about__title">What is Tempus?</h2>
        <div className="tw__about__grid">
          <AboutGridItem
            icon={<CommunityIcon />}
            title="Decentralized community"
            description="Tempus is a decentralized community of Builders, Creators and Connectors led by Tempus Labs to build some of the most innovative DeFi products."
          />
          <AboutGridItem
            icon={<TeamIcon />}
            title="World-class team"
            description="Tempus Labs is elected by the DAO to lead product development. We are a global team of experienced finance and tech professionals who are passionate about all things crypto."
          />
          <AboutGridItem
            icon={<VisionIcon />}
            title="Leading vision"
            description="We are backed by top-tier investors that trust us to grow ideas into revenue-generating businesses. Our funding allows us to keep shipping products for many years to come."
          />
        </div>
      </ScrollFadeIn>
    </div>
  </div>
);

export default memo(About);
