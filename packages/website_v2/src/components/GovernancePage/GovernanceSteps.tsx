import { memo } from 'react';
import { discordInviteLink } from '../../constants';
import { Link, ScrollFadeIn } from '../shared';
import { DiscussIllustration, ProposeIllustration, VoteIllustration } from './illustrations';

const GovernanceSteps = (): JSX.Element => (
  <div className="tw__governance__steps">
    <ScrollFadeIn>
      <div className="tw__container tw__governance__steps-container">
        <div className="tw__governance__steps-separator" />
        <h2 className="tw__governance__title">Governance in 3 Steps</h2>
        <div className="tw__governance__steps-grid">
          <div className="tw__governance__steps-grid-item">
            <div className="tw__governance__steps-illustration">
              <DiscussIllustration />
            </div>
            <div className="tw__governance__steps-separator" />
            <h3 className="tw__governance__steps-title">Discuss</h3>
            <p className="tw__governance__steps-description">
              Participate in discussions with the community on Discord or the governance forum, evaluate other members’
              proposals, and brainstorm ideas collectively.
            </p>
            <Link href={discordInviteLink} className="tw__governance__steps-button">
              Join the discussion
            </Link>
          </div>
          <div className="tw__governance__steps-grid-item">
            <div className="tw__governance__steps-illustration">
              <ProposeIllustration />
            </div>
            <div className="tw__governance__steps-separator" />
            <h3 className="tw__governance__steps-title">Propose</h3>
            <p className="tw__governance__steps-description">
              Once you have come up with an idea, you can make a proposal on the governance forum. If a consensus is
              reached a Snapshot will be created for TEMP holders to vote.
            </p>
            <Link href="https://forum.tempus.finance/" className="tw__governance__steps-button">
              Submit a proposal
            </Link>
          </div>
          <div className="tw__governance__steps-grid-item">
            <div className="tw__governance__steps-illustration">
              <VoteIllustration />
            </div>
            <div className="tw__governance__steps-separator" />
            <h3 className="tw__governance__steps-title">Vote</h3>
            <p className="tw__governance__steps-description">
              TEMP holders will be able to cast their votes on your progressed proposals on Snapshot. The proposal will
              be implemented if the vote passes successfully.
            </p>
            <Link href="https://vote.tempus.finance/" className="tw__governance__steps-button">
              Check active votes
            </Link>
          </div>
        </div>
      </div>
    </ScrollFadeIn>
  </div>
);

export default memo(GovernanceSteps);
