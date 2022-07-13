import { StarkNetLogo } from './logos';

const StarkNetBadge = (): JSX.Element => (
  <div className="tw__products__starknet-badge">
    <span className="tw__products__starknet-badge-label">Built on</span>
    <StarkNetLogo />
  </div>
);

export default StarkNetBadge;
