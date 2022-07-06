import { FC, memo } from 'react';
import ArrowRight from '../../../icons/arrowRight';
import Link from '../Link';

import './LinkBlock.scss';

interface LinkBlockProps {
  href: string;
  title: string;
  icon: JSX.Element;
  description?: string;
}

const LinkBlock: FC<LinkBlockProps> = props => {
  const { href, title, icon, description } = props;

  return (
    <Link className="tw__link-block" href={href}>
      <div className="tw__link-block__header">
        <span className="tw__link-block__title">{title}</span>
        <span className="tw__link-block__icon">{icon}</span>
      </div>
      <div className="tw__link-block__footer">
        <span className="tw__link-block__description">{description}</span>
        <ArrowRight />
      </div>
    </Link>
  );
};

export default memo(LinkBlock);
