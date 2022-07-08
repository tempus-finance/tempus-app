import { memo } from 'react';
import { ScrollFadeIn } from '../shared';
import { ValueIcon, VoiceIcon } from './icons';

const TokenBenefits = (): JSX.Element => (
  <div className="tw__token__token-benefits">
    <ScrollFadeIn>
      <div className="tw__container tw__token__token-benefits-container">
        <h2 className="tw__token__title">Benefits of Holding TEMP</h2>
        <div className="tw__token__token-benefits-grid">
          <div className="tw__token__token-benefits-grid-item">
            <div className="tw_token__token-benefits-grid-item-icon">
              <VoiceIcon />
            </div>
            <h3>Your Token. Your Voice.</h3>
            <p>
              TEMP holders govern the Tempus DAO. The DAO elects the service contractor to lead product development.
              TEMP holders can submit governance proposals and vote to decide the future of the DAO.
            </p>
          </div>
          <div className="tw__token__token-benefits-grid-item">
            <div className="tw_token__token-benefits-grid-item-icon">
              <ValueIcon />
            </div>
            <h3>Capture Value</h3>
            <p>
              TEMP holders capture value from products developed by Tempus DAO, including early access to any new
              products and their tokens. Our product line already features a fixed income protocol, and a novel money
              market will be launching soon.
            </p>
          </div>
        </div>
      </div>
    </ScrollFadeIn>
  </div>
);

export default memo(TokenBenefits);
