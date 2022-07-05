import CompanyLogo from './logos/CompanyLogo';

const WorkedWith = (): JSX.Element => (
  <div className="tw__team__work-with">
    <h2 className="tw__team__worked-with__title">
      Our team has worked with some of the world&apos;s leading organizations
    </h2>
    <div className="tw__team__separator" />
    <div className="tw__team__worked-with__organizations">
      <CompanyLogo variant="linklaters" />
      <CompanyLogo variant="ethereum-foundation" />
      <CompanyLogo variant="microsoft" />
      <CompanyLogo variant="lendinvest" />
    </div>
  </div>
);

export default WorkedWith;
