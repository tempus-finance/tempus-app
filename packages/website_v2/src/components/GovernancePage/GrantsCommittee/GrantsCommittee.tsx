import { memo } from 'react';
import { ArrowRight } from '../../../icons';
import { Link, ScrollFadeIn } from '../../shared';
import GrantsCommitteeBackground from './GrantsCommitteeBackground';

import './GrantsCommittee.scss';

const GrantsCommittee = (): JSX.Element => (
  <div className="tw__grantsCommittee">
    <div className="tw__grantsCommittee__background-desktop">
      <GrantsCommitteeBackground />
    </div>
    <ScrollFadeIn>
      <div className="tw__container tw__grantsCommittee__container">
        <h2 className="tw__grantsCommittee__title">Grants Committee</h2>
        <div className="tw__grantsCommittee__background-mobile">
          <GrantsCommitteeBackground />
        </div>
        <h3 className="tw__grantsCommittee__subtitle">Build a Better Future of DeFi</h3>
        <p className="tw__grantsCommittee__text">
          We established the Tempus Grants Committee to support Builders, Creators and Connectors like you to grow the
          Tempus DAO through innovative collaborations. Together we&apos;ll build something beyond special.
        </p>
        <div className="tw__grantsCommittee__active-grants">
          <Link
            href="https://tempusfinance.notion.site/tempusfinance/Tempus-Grants-Program-c54b4410e9db49139347210d5a340c5e"
            className="tw__hover-animation-light"
          >
            <span>Check active grants</span>
            <ArrowRight />
          </Link>
        </div>
      </div>
    </ScrollFadeIn>
  </div>
);

export default memo(GrantsCommittee);
