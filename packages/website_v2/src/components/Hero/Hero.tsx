import { memo, useCallback } from 'react';
import { discordInviteLink } from '../../constants';
import { DiscordIcon } from '../Join/icons';
import Products from './Products';
import { ScrollFadeIn } from '../shared';

import './Hero.scss';

const Hero = (): JSX.Element => {
  const handleOnBuildWithUsClick = useCallback(() => {
    window.open(discordInviteLink, '_blank');
  }, []);

  return (
    <div className="tw__hero">
      <div className="tw__hero__container">
        <h1 className="tw__hero-title-faded">Tempus is shaping the</h1>
        <h1 className="tw__hero-title">future of DeFi</h1>
        <button type="button" className="tw__hero-button" onClick={handleOnBuildWithUsClick}>
          <DiscordIcon />
          BUILD WITH US
        </button>

        <div className="tw__hero-banner">
          <div className="tw__hero-banner-stripes" />
          <div className="tw__container tw__hero-product-cards">
            <ScrollFadeIn>
              <Products />
            </ScrollFadeIn>
          </div>
        </div>
      </div>
    </div>
  );
};
export default memo(Hero);
