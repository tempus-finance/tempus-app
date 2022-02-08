import React, { FC, useContext, useMemo } from 'react';
import { LanguageContext } from '../../../context/languageContext';
import getText from '../../../localisation/getText';
import NumberUtils from '../../../services/NumberUtils';
import Typography from '../../typography/Typography';

import './variableAPRBreakDownTooltip.scss';

interface VariableAPRBreakDownTooltipProps {
  protocolName: string;
  apr: number;
  tempusFees: number;
}

const VariableAPRBreakDownTooltip: FC<VariableAPRBreakDownTooltipProps> = props => {
  const { protocolName, apr, tempusFees } = props;

  const { language } = useContext(LanguageContext);

  const protocolAPR = useMemo(() => NumberUtils.formatPercentage(apr - tempusFees, 2), [apr, tempusFees]);
  const tempusAPR = useMemo(() => NumberUtils.formatPercentage(tempusFees, 2), [tempusFees]);
  const combinedAPR = useMemo(() => NumberUtils.formatPercentage(apr, 2), [apr]);

  // TODO: we need to add placeholder support for translation. issue #830. avoid string concat.
  return (
    <div className="tc__apr-breakdown-tooptip__container">
      <div className="tc__apr-breakdown-tooptip__section">
        <Typography color="default" variant="tooltip-card-text">
          {protocolName} {getText('apr', language)}
        </Typography>
        <Typography color="default" variant="tooltip-card-text">
          {protocolAPR}
        </Typography>
      </div>
      <div className="tc__apr-breakdown-tooptip__section">
        <Typography color="default" variant="tooltip-card-text">
          {getText('tempus', language)} {getText('apr', language)}
        </Typography>
        <Typography color="default" variant="tooltip-card-text">
          {tempusAPR}
        </Typography>
      </div>
      <div className="tc__apr-breakdown-tooptip__separator"></div>
      <div className="tc__apr-breakdown-tooptip__section">
        <Typography color="default" variant="tooltip-card-text">
          {getText('combinedApr', language)}
        </Typography>
        <Typography color="default" variant="tooltip-card-text">
          {combinedAPR}
        </Typography>
      </div>
    </div>
  );
};

export default VariableAPRBreakDownTooltip;
