import { memo, useEffect, useMemo, useState } from 'react';
import { Decimal, DecimalUtils } from 'tempus-core-services';
import { ArrowRight } from '../../icons';
import TreasuryValueService from '../../services/TreasuryValueService';
import { Link, Loading, ScrollFadeIn } from '../shared';
import TreasuryBackground from './TreasuryBackground';

import './Treasury.scss';

const Treasury = (): JSX.Element => {
  const [value, setValue] = useState<Decimal | null>(null);

  useEffect(() => {
    const fetchValue = async () => {
      const treasuryValueService = new TreasuryValueService();

      try {
        setValue(await treasuryValueService.getValue());
      } catch (error) {
        console.log('FundsAvailable - fetchValue() - Failed to fetch treasury value!', error);
      }
    };
    fetchValue();
  }, []);

  const valueFormatted = useMemo(() => {
    if (!value) {
      return null;
    }
    return DecimalUtils.formatToCurrency(value, 0, '$');
  }, [value]);

  return (
    <div className="tw__treasury">
      <div className="tw__treasury__background">
        <TreasuryBackground />
      </div>
      <ScrollFadeIn>
        <div className="tw__container tw__treasury__container">
          <h2 className="tw__section-title">Treasury</h2>
          <div className="tw__treasury__body">
            <div className="tw__treasury__description">
              <div>
                <span>Available for innovation.</span>
              </div>
              <div className="tw__treasury__read-more">
                <Link
                  href="https://tempusfinance.notion.site/Tempus-Grants-Program-c54b4410e9db49139347210d5a340c5e"
                  className="tw__hover-animation"
                >
                  Read more about our Grants
                  <ArrowRight />
                </Link>
              </div>
            </div>
            <div className="tw__treasury__value">{valueFormatted ? <p>{valueFormatted}</p> : <Loading />}</div>
          </div>
        </div>
      </ScrollFadeIn>
    </div>
  );
};
export default memo(Treasury);
