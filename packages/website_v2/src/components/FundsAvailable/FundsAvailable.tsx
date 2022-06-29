import { useEffect, useMemo, useState } from 'react';
import { Decimal, DecimalUtils } from 'tempus-core-services';
import TreasuryValueService from '../../services/TreasuryValueService';

import './FundsAvailable.scss';

const FundsAvailable = (): JSX.Element => {
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
      <p className="tw__funds-available-title">
        Funds available for builders <span className="tw__funds-available-badge">POWERED BY $TEMP</span>
      </p>

      <p className="tw__funds-available-value">{valueFormatted}</p>
      <div className="tw__funds-available-separator" />
    </div>
  );
};
export default FundsAvailable;
