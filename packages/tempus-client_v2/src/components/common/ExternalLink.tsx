import './externalLink.scss';

const ExternalLink = (props: React.HTMLProps<HTMLAnchorElement>) => {
  const { className = '', children, ...aProps } = props;

  return (
    <a rel="external noreferrer nofollow" target="_blank" {...aProps} className={`tc__link ${className}`}>
      {children}
    </a>
  );
};

export default ExternalLink;
