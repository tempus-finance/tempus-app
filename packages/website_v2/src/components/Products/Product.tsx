import { FC, ReactElement } from 'react';

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
        {name && <div className="tw__products__product-name">{name}</div>}
        <div className="tw__products__product-banner-illustration">{bannerIllustration}</div>
        {badge && <div className="tw__products__product-badge">{badge}</div>}
      </div>
      <div className="tw__products__product-content">
        <div className="tw__products__product-content-text">
          <h3 className="tw__products__product-title">{title}</h3>
          <p className="tw__products__product-description">{description}</p>
        </div>
        <a className="tw__products__product-button" href={buttonLink ?? '#'}>
          {buttonLabel}
        </a>
      </div>
    </div>
  );
};

export default Product;