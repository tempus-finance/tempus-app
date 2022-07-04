import { useEffect, useMemo, useState } from 'react';
import { Decimal, DecimalUtils } from 'tempus-core-services';
import { ArrowRight } from '../../icons';
import TreasuryValueService from '../../services/TreasuryValueService';
import { Link } from '../shared';

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
    <div className="tw__funds-available">
      <h2 className="tw__section-title">Treasury Funds</h2>
      <div className="tw__funds-available__body">
        <div className="tw__funds-available__description">
          <div>
            <span>Available for Innovation.</span>
          </div>
          <div>
            <Link href="" className="tw__funds-available__read-more tw__hover-animation">
              Read more about our Grants <ArrowRight color="#050A4A" />
            </Link>
          </div>
        </div>
        <div className="tw__funds-available__value">
          <p>{valueFormatted}</p>
        </div>
      </div>
    </div>
  );
};
export default Treasury;