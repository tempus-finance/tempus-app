import Axios from 'axios';
import { format } from 'date-fns';
import { memo, useEffect, useState } from 'react';
import { ArrowRight } from '../../icons';
import { Link, ScrollFadeIn } from '../shared';
import Article from './article/Article';
import './Blog.scss';

interface MediumPostData {
  date: Date;
  title: string;
  description: string;
  link: string;
  thumbnail: string;
}

const Blog = (): JSX.Element => {
  const [posts, setPosts] = useState<MediumPostData[]>([]);

  useEffect(() => {
    const fetchPostsFromMedium = async () => {
      const response = await Axios.get(
        'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/tempusfinance',
      );
      const lastThreePosts: MediumPostData[] = response.data.items.slice(0, 3).map((item: any) => {
        const publicationDate = new Date(`${item.pubDate}`.replace(' ', 'T'));

        const tag = document.createElement('div');
        tag.innerHTML = item.description;

        return {
          date: format(publicationDate, 'd MMM y'),
          title: item.title,
          description: `${tag.innerText.slice(0, 200)}...`,
          link: item.link,
          thumbnail: item.thumbnail,
        };
      });
      setPosts(lastThreePosts);
    };
    fetchPostsFromMedium();
  }, []);

  return (
    <div className="tw__blog">
      <div className="tw__container tw__blog__container">
        <ScrollFadeIn>
          <h2 className="tw__section-title">Blog</h2>
          <div className="tw__blog-separator" />
          <div className="tw__section__subtitles">
            <h3 className="tw__section-subtitle">Check out our latest alpha</h3>
            <div className="tw__blog__read-more">
              <Link href="https://medium.com/tempusfinance/" className="tw__hover-animation">
                Read more on our Blog
              </Link>
              <ArrowRight />
            </div>
          </div>

          <div className="tw__blog__article-container">
            <div className="tw__blog__articles">
              {posts.map(post => (
                <Article
                  key={post.title}
                  date={post.date}
                  description={post.description}
                  title={post.title}
                  link={post.link}
                  thumbnail={post.thumbnail}
                />
              ))}
            </div>
          </div>

          <div className="tw__blog__read-more tw__mobile">
            <Link href="https://medium.com/tempusfinance/" className="tw__hover-animation">
              Read more on our Blog
            </Link>
            <ArrowRight />
          </div>
        </ScrollFadeIn>
      </div>
    </div>
  );
};

export default memo(Blog);
