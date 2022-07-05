import { useEffect, useMemo, useState } from 'react';
import { Decimal, DecimalUtils } from 'tempus-core-services';
import { ArrowRight } from '../../icons';
import TreasuryValueService from '../../services/TreasuryValueService';
import { Link } from '../shared';
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
      return '-';
    }
    return DecimalUtils.formatToCurrency(value, 2, '$');
  }, [value]);

  return (
    <div className="tw__treasury">
      <div className="tw__treasury__background">
        <TreasuryBackground />
      </div>
      <h2 className="tw__section-title">Treasury Funds</h2>
      <div className="tw__treasury__body">
        <div className="tw__treasury__description">
          <div>
            <span>Available for Innovation.</span>
          </div>
          <div className="tw__treasury__read-more">
            <Link
              href="https://tempusfinance.notion.site/Tempus-Grants-Program-c54b4410e9db49139347210d5a340c5e"
              className="tw__hover-animation"
            >
              Read more about our Grants
            </Link>
            <ArrowRight color="#050A4A" />
          </div>
        </div>
        <div className="tw__treasury__value">
          <p>{valueFormatted}</p>
        </div>
      </div>
    </div>
  );
};
export default Treasury;
