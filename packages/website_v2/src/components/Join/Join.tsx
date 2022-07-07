import { memo } from 'react';
import { LinkBlock } from '../shared';
import { DiscordIcon, GitHubIcon, MediumIcon, TelegramIcon, TwitterIcon } from './icons';
import './Join.scss';

const Join = (): JSX.Element => (
  <div className="tw__join">
    <div className="tw__container tw__join__container">
      <div className="tw__join__separator" />
      <h2 className="tw__join__title">Join Tempus DAO</h2>
      <p className="tw__join__description">
        Tempus DAO is a global community of Builders, Creators and Connectors shaping the future of Web3.
      </p>
      <div className="tw__join__link-grid">
        <LinkBlock
          href="https://discord.com/invite/6gauHECShr"
          title="Discord"
          description="Get involved"
          icon={<DiscordIcon />}
        />
        <LinkBlock
          href="https://twitter.com/tempusfinance"
          title="Twitter"
          description="Read the latest"
          icon={<TwitterIcon />}
        />
        <LinkBlock
          href="https://t.me/tempusfinance"
          title="Telegram"
          description="Join discussion"
          icon={<TelegramIcon />}
        />
        <LinkBlock
          href="https://medium.com/tempusfinance"
          title="Medium"
          description="Read the blog"
          icon={<MediumIcon />}
        />
        <LinkBlock
          href="https://github.com/tempus-finance"
          title="GitHub"
          description="Build with us"
          icon={<GitHubIcon />}
        />
      </div>
    </div>
  </div>
);

export default memo(Join);
