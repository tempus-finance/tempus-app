import { FC } from 'react';
import { ArrowRight } from '../../../icons';
import { Link } from '../../shared';

import './Article.scss';

interface ArticleProps {
  date: Date;
  title: string;
  description: string;
  link: string;
  thumbnail: string;
}

const Article: FC<ArticleProps> = props => {
  const { date, title, description, link, thumbnail } = props;

  return (
    <Link href={link} className="tw__article">
      <div className="tw__article-image" style={{ backgroundImage: `url('${thumbnail}')` }} />
      <div className="tw__article-content">
        <div className="tw__article-date">
          <span>{date}</span>
        </div>
        <div className="tw__article-title">{title}</div>
        <div className="tw__article-description">
          <span>{description}</span>
        </div>
        <div className="tw__article-readmore">
          <ArrowRight />
        </div>
      </div>
    </Link>
  );
};
export default Article;
