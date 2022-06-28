import { FC } from 'react';

interface AboutGridItemProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const AboutGridItem: FC<AboutGridItemProps> = props => {
  const { icon, title, description } = props;

  return (
    <div className="tw__about__grid-item">
      <div className="tw__about__grid-item-icon">{icon}</div>
      <h3 className="tw__about__grid-item-title">{title}</h3>
      <p className="tw__about__grid-item-description">{description}</p>
    </div>
  );
};

export default AboutGridItem;
