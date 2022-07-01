import { CommunityIllustration, FixedIncomeIllustration, MoneyMarketIllustration } from './illustrations';
import Product from './Product';
import './Products.scss';
import StarkNetBadge from './StarkNetBadge';

const Products = (): JSX.Element => (
  <div className="tw__products">
    <Product
      bannerType="bright"
      bannerIllustration={<FixedIncomeIllustration />}
      name="Fixed Income"
      title="Fix your future yield."
      description="Our innovative fixed income protocol allows you to securely lock in a fixed rate on any lending or staking income."
      buttonLabel="Fix my yield"
      buttonLink="https://app.tempus.finance"
    />
    <Product
      bannerType="dark"
      bannerIllustration={<MoneyMarketIllustration />}
      badge={<StarkNetBadge />}
      name="Nostra Money Market"
      title="Borrow. Lend. Earn."
      description="Our new money market for borrowing and lending. Get the most out of your money in a fast and secure way."
      buttonLabel="Coming soon"
    />
    <Product
      bannerType="bright"
      bannerIllustration={<CommunityIllustration />}
      name="Join the community"
      title="Let’s shape the future together"
      description="Join the Tempus community to bring the next generation of Web3 products to life."
      buttonLabel="LFG"
      buttonLink="https://discord.com/invite/6gauHECShr"
    />
  </div>
);

export default Products;
