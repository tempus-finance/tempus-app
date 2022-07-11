import { FC, memo, MouseEvent, useCallback, useState } from 'react';
import { discordInviteLink } from '../../constants';
import { Button, ScrollFadeIn } from '../shared';

import './Who.scss';

type Sections = 'builders' | 'creators' | 'connectors';

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
They break the language barriers between DeFi and the real world.`.trim();

const connectorsCTA = "I'm In";

const Who: FC = (): JSX.Element => {
  const [activeSection, setActiveSection] = useState<Sections>('builders');

  const handleTitleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const section = (event.currentTarget as HTMLDivElement).getAttribute('data-test');
    setActiveSection(section as Sections);
  }, []);

  const handleActionClick = useCallback(() => {
    window.open(discordInviteLink, '_blank');
  }, []);

  return (
    <div className="tw__who">
      <div className="tw__container tw__who__container">
        <ScrollFadeIn>
          <h2 className="tw__section-title">Who are we?</h2>
          <div className="tw__section__subtitles">
            <h3 className="tw__section-subtitle">
              Tempus Labs has been elected by the Tempus DAO governance process as the service provider to lead the
              project. Tempus DAO is a decentralized community of Builders, Creators and Connectors. Find your role!
            </h3>
          </div>
          <div className="tw__who__people">
            <div className="tw__who__people-subsection">
              <div
                id="builders-graphics"
                className="tw__who__people-graphics"
                style={{ backgroundImage: 'url(images/graphics/builders.svg)' }}
              />
              <div
                data-test="builders"
                className={`tw__section__subsection-title ${activeSection === 'builders' ? 'active' : ''}`}
                onClick={handleTitleClick}
              >
                Builders
              </div>
              <div className={`tw__who__people-subsection-body ${activeSection === 'builders' ? 'active' : ''}`}>
                <div className="tw__who__people-description">{buildersDescription}</div>
                <Button onClick={handleActionClick}>{buildersCTA}</Button>
              </div>

              <div
                id="creators-graphic"
                className="tw__who__people-graphics"
                style={{ backgroundImage: 'url(images/graphics/creators.svg)' }}
              />
              <div
                data-test="creators"
                className={`tw__section__subsection-title ${activeSection === 'creators' ? 'active' : ''}`}
                onClick={handleTitleClick}
              >
                Creators
              </div>
              <div className={`tw__who__people-subsection-body ${activeSection === 'creators' ? 'active' : ''}`}>
                <div className="tw__who__people-description">{creatorsDescription}</div>
                <Button onClick={handleActionClick}>{creatorsCTA}</Button>
              </div>

              <div
                id="connectors-graphic"
                className="tw__who__people-graphics"
                style={{ backgroundImage: 'url(images/graphics/connectors.svg)' }}
              />
              <div
                data-test="connectors"
                className={`tw__section__subsection-title ${activeSection === 'connectors' ? 'active' : ''}`}
                onClick={handleTitleClick}
              >
                Connectors
              </div>
              <div className={`tw__who__people-subsection-body ${activeSection === 'connectors' ? 'active' : ''}`}>
                <div className="tw__who__people-description">{connectorsDescription}</div>
                <Button onClick={handleActionClick}>{connectorsCTA}</Button>
              </div>
            </div>
            <div className="tw__who__people-shared-graphics">
              <div
                className={`tw__who__people-graphics ${activeSection === 'builders' ? 'active' : ''}`}
                style={{ backgroundImage: 'url(images/graphics/builders.svg)' }}
              />
              <div
                className={`tw__who__people-graphics ${activeSection === 'creators' ? 'active' : ''}`}
                style={{ backgroundImage: 'url(images/graphics/creators.svg)' }}
              />
              <div
                className={`tw__who__people-graphics ${activeSection === 'connectors' ? 'active' : ''}`}
                style={{ backgroundImage: 'url(images/graphics/connectors.svg)' }}
              />
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </div>
  );
};

export default memo(Who);
