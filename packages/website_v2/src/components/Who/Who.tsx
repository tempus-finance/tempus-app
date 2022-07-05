import { FC, MouseEvent, useCallback, useEffect, useState } from 'react';
import { discordInviteLink } from '../../constants';
import { Button } from '../shared';
import { BuildersIllustration, ConnectorsIllustration, CreatorsIllustration } from './illustrations';

import './Who.scss';

const SECTIONS = ['builders', 'creators', 'connectors'] as const;
type Section = typeof SECTIONS[number];

const buildersDescription = `
The Builders are super coders who love solving problems.
They contribute by coding ideas of all shapes and
sizes, and bringing them to market with the support of the community.`.trim();

const buildersCTA = 'Start Building';

const creatorsDescription = `
The Creators make the builders’ ideas come to life by translating code into culture.
They wrap our products and present them to the world in a way that resonates with our users.`.trim();

const creatorsCTA = 'Get Creative';

const connectorsDescription = `
The Connectors use their business skills to put the right products in front of the right eyes.
They break the language barriers between Web3 and the real world.`.trim();

const connectorsCTA = "I'm In";

const Who: FC = (): JSX.Element => {
  const [activeSection, setActiveSection] = useState<Section>('builders');

  const handleTitleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const section = (event.currentTarget as HTMLDivElement).getAttribute('data-test') as Section;

      if (section === activeSection) {
        return;
      }

      const container = document.querySelector('.tw__who') as HTMLDivElement;
      const content = document.querySelector('.tw__who__content') as HTMLDivElement;
      const scrollableHeight = container.clientHeight - content.clientHeight;
      const newOffsetTop = (scrollableHeight * (SECTIONS.findIndex(value => value === section) ?? 0)) / SECTIONS.length;

      window.scrollBy(0, newOffsetTop - content.offsetTop + 1);
      setActiveSection(section as Section);
    },
    [activeSection],
  );

  const onScroll = useCallback(() => {
    const container = document.querySelector('.tw__who') as HTMLDivElement;
    const content = document.querySelector('.tw__who__content') as HTMLDivElement;
    const scrollableHeight = container.clientHeight - content.clientHeight;
    const percentageScrolled = content.offsetTop / scrollableHeight;
    const selectedSection = SECTIONS[Math.min(Math.floor(percentageScrolled * SECTIONS.length), SECTIONS.length - 1)];
    setActiveSection(selectedSection);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
  }, [onScroll]);

  const handleActionClick = useCallback(() => {
    window.open(discordInviteLink, '_blank');
  }, []);

  return (
    <div className="tw__who">
      <div className="tw__who__content">
        <h2 className="tw__section-title">Who are we?</h2>
        <div className="tw__section__subtitles">
          <h3 className="tw__section-subtitle">
            Tempus Labs has been elected by the Tempus DAO governance as the service provider to lead the project.
            Tempus DAO is a decentralized community of Builders, Creators and Connectors. Find your role!
          </h3>
        </div>
        <div className="tw__who__people">
          <div className="tw__who__people-subsection">
            <div
              data-test="builders"
              className={`tw__section__subsection-title ${activeSection === 'builders' ? 'active' : ''}`}
              onClick={handleTitleClick}
            >
              Builders
            </div>
            {activeSection === 'builders' && (
              <div className="tw__who__people-subsection-body">
                <div className="tw__who__people-description">{buildersDescription}</div>
                <Button onClick={handleActionClick}>{buildersCTA}</Button>
              </div>
            )}
            <div
              data-test="creators"
              className={`tw__section__subsection-title ${activeSection === 'creators' ? 'active' : ''}`}
              onClick={handleTitleClick}
            >
              Creators
            </div>
            {activeSection === 'creators' && (
              <div className="tw__who__people-subsection-body">
                <div className="tw__who__people-description">{creatorsDescription}</div>
                <Button onClick={handleActionClick}>{creatorsCTA}</Button>
              </div>
            )}
            <div
              data-test="connectors"
              className={`tw__section__subsection-title ${activeSection === 'connectors' ? 'active' : ''}`}
              onClick={handleTitleClick}
            >
              Connectors
            </div>
            {activeSection === 'connectors' && (
              <div className="tw__who__people-subsection-body">
                <div className="tw__who__people-description">{connectorsDescription}</div>
                <Button onClick={handleActionClick}>{connectorsCTA}</Button>
              </div>
            )}
          </div>
          <div className="tw__who__people-graphics">
            {activeSection === 'builders' && <BuildersIllustration />}
            {activeSection === 'creators' && <CreatorsIllustration />}
            {activeSection === 'connectors' && <ConnectorsIllustration />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Who;
