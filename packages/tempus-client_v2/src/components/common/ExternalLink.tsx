const ExternalLink = (props: React.HTMLProps<HTMLAnchorElement>) => {
  const { children, ...aProps } = props;

  return (
    <a rel="external noreferrer nofollow" target="_blank" {...aProps}>
      {children}
    </a>
  );
};

export default ExternalLink;
