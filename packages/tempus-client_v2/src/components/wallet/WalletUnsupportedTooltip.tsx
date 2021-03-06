import { FC, useContext } from 'react';
import Typography from '../typography/Typography';
import WarnIcon from '../icons/WarnIcon';
import getText from '../../localisation/getText';
import { LocaleContext } from '../../context/localeContext';

interface WalletUnsupportedTooltipProps {
  onClickSwitchNetwork: () => void;
}

const WalletUnsupportedTooltip: FC<WalletUnsupportedTooltipProps> = props => {
  const { onClickSwitchNetwork } = props;

  const { locale } = useContext(LocaleContext);

  return (
    <div className="tc__connect-wallet-unsupported-tooltip__container">
      <div className="tc__connect-wallet-unsupported-tooltip__header">
        <WarnIcon />
        <Typography variant="tooltip-card-title">{getText('unsupportedNetworkTooltipTitle', locale)}</Typography>
      </div>
      <div className="tc__connect-wallet-unsupported-tooltip__body1">
        <Typography variant="tooltip-card-text">{getText('unsupportedNetworkTooltipText1', locale)}</Typography>
      </div>
      <div className="tc__connect-wallet-unsupported-tooltip__body2">
        <Typography variant="tooltip-card-text-bold">{getText('unsupportedNetworkTooltipText2', locale)}</Typography>
      </div>
      <div className="tc__connect-wallet-unsupported-tooltip__button-container">
        <button className="tc__connect-wallet-unsupported-tooltip__button" onClick={onClickSwitchNetwork}>
          <Typography variant="tooltip-card-title" color="inverted">
            {getText('switchNetwork', locale)}
          </Typography>
        </button>
      </div>
    </div>
  );
};

export default WalletUnsupportedTooltip;
