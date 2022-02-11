import { FC, useContext } from 'react';
import Typography from '../typography/Typography';
import WarnIcon from '../icons/WarnIcon';
import getText from '../../localisation/getText';
import { LanguageContext } from '../../context/languageContext';

interface WalletUnsupportedTooltipProps {
  onClickSwitchNetwork: () => void;
}

const WalletUnsupportedTooltip: FC<WalletUnsupportedTooltipProps> = props => {
  const { onClickSwitchNetwork } = props;

  const { language } = useContext(LanguageContext);

  return (
    <div className="tc__connect-wallet-unsupported-tooltip__container">
      <div className="tc__connect-wallet-unsupported-tooltip__header">
        <WarnIcon />
        <Typography variant="tooltip-card-title">{getText('unsupportedNetworkTooltipTitle', language)}</Typography>
      </div>
      <div className="tc__connect-wallet-unsupported-tooltip__body1">
        <Typography variant="tooltip-card-text">{getText('unsupportedNetworkTooltipText1', language)}</Typography>
      </div>
      <div className="tc__connect-wallet-unsupported-tooltip__body2">
        <Typography variant="tooltip-card-text-bold">{getText('unsupportedNetworkTooltipText2', language)}</Typography>
      </div>
      <div className="tc__connect-wallet-unsupported-tooltip__button-container">
        <button className="tc__connect-wallet-unsupported-tooltip__button" onClick={onClickSwitchNetwork}>
          <Typography variant="tooltip-card-title" color="inverted">
            {getText('switchNetwork', language)}
          </Typography>
        </button>
      </div>
    </div>
  );
};

export default WalletUnsupportedTooltip;
