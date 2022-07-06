import { useCallback } from 'react';
import { discordInviteLink } from '../../constants';
import Products from './Products';

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
          BUILD WITH US
        </button>
        <Products />
      </div>
    </div>
  );
};
export default Hero;
