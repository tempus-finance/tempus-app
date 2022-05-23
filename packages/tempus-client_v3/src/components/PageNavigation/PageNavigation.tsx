import { CSSProperties, FC, memo } from 'react';
import { Tab, Tabs } from '../shared';

import './PageNavigation.scss';

export interface PageNavigationLink {
  text: string;
  path: string;
}

export interface PageNavigationProps {
  navigationLinks: PageNavigationLink[];
}

const buttonWidthInPx = 186;

const PageNavigation: FC<PageNavigationProps> = ({ navigationLinks }) => {
  const containerStyle: CSSProperties = {
    width: `${navigationLinks.length * buttonWidthInPx}px`,
  };

  return (
    <div className="tc__page-navigation" style={containerStyle}>
      <div className="tc__page-navigation__background" />
      <Tabs size="large">
        {navigationLinks.map((navigationLink: PageNavigationLink) => (
          <Tab key={navigationLink.text} label={navigationLink.text} href={navigationLink.path} />
        ))}
      </Tabs>
    </div>
  );
};

export default memo(PageNavigation);
