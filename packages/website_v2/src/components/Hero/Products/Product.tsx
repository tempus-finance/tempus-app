import { FC, memo, ReactElement } from 'react';
import { Link } from '../../shared';

type ProductBannerType = 'bright' | 'dark';

interface ProductProps {
  bannerType: ProductBannerType;
  bannerIllustration: ReactElement;
  badge?: ReactElement;
  name?: string;
  title: string;
  description: string;
  buttonLabel: string;
  buttonLink?: string;
}

const Product: FC<ProductProps> = props => {
  const { bannerType, bannerIllustration, badge, name, title, description, buttonLabel, buttonLink } = props;

  return (
    <div className="tw__products__product">
      <div className={`tw__products__product-banner tw__products__product-banner-${bannerType}`}>
        <div className="tw__products__product-banner-illustration">{bannerIllustration}</div>
        {badge && <div className="tw__products__product-badge">{badge}</div>}
        {name && <div className="tw__products__product-name">{name}</div>}
      </div>
      <div className="tw__products__product-content">
        <div className="tw__products__product-content-text">
          <h3 className="tw__products__product-title">{title}</h3>
          <p className="tw__products__product-description">{description}</p>
        </div>
        <Link className="tw__products__product-button" href={buttonLink ?? '#'}>
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
};

export default memo(Product);
