import { memo } from 'react';
import { ScrollFadeIn } from '../shared';
import CompanyLogo from './logos/CompanyLogo';

const WorkedWith = (): JSX.Element => (
  <div className="tw__team__work-with">
    <div className="tw__container tw__team__work-with__container">
      <ScrollFadeIn>
        <h2 className="tw__team__worked-with__title">
          Our team has experience from working with some of the world&apos;s leading organizations
        </h2>
        <div className="tw__team__worked-with__separator" />
        <div className="tw__team__worked-with__organizations">
          <CompanyLogo variant="bank-of-america" />
          <CompanyLogo variant="bnp" />
          <CompanyLogo variant="barclaycard" />
          <CompanyLogo variant="goldman-sachs" />
          <CompanyLogo variant="ubs" />
          <CompanyLogo variant="lendinvest" />
          <CompanyLogo variant="nomura" />
          <CompanyLogo variant="ethereum-foundation" />
          <CompanyLogo variant="microsoft" />
          <CompanyLogo variant="allen-overy" />
          <CompanyLogo variant="kirkland-ellis" />
          <CompanyLogo variant="ibm" />
        </div>
      </ScrollFadeIn>
    </div>
  </div>
);

export default memo(WorkedWith);
