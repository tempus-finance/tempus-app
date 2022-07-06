import { memo } from 'react';
import CompanyLogo from './logos/CompanyLogo';

const WorkedWith = (): JSX.Element => (
  <div className="tw__team__work-with">
    <div className="tw__container tw__team__work-with__container">
      <h2 className="tw__team__worked-with__title">
        Our team has experience from working with some of the world&apos;s leading organizations
      </h2>
      <div className="tw__team__worked-with__separator" />
      <div className="tw__team__worked-with__organizations">
        <CompanyLogo variant="linklaters" />
        <CompanyLogo variant="ethereum-foundation" />
        <CompanyLogo variant="microsoft" />
        <CompanyLogo variant="lendinvest" />
      </div>
    </div>
  </div>
);

export default memo(WorkedWith);
