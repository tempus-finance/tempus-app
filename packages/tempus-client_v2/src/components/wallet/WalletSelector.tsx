import { FC, MouseEvent, useCallback, useContext } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { LocaleContext } from '../../context/localeContext';
import { UserSettingsContext } from '../../context/userSettingsContext';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';
import WalletIcon from '../walletIcon/WalletIcon';
import UserWallet from '../../interfaces/UserWallet';
import './WalletSelector.scss';

type WalletSelectorInProps = {
  availableWallets: { [w in UserWallet]?: boolean };
  currentWallet: UserWallet | null;
};

type WalletSelectorOutProps = {
  onClose: (wallet: UserWallet | null) => void;
};

type WalletSelectorProps = WalletSelectorInProps & WalletSelectorOutProps;

const WalletSelector: FC<WalletSelectorProps> = ({ availableWallets, currentWallet, onClose }) => {
  const { locale } = useContext(LocaleContext);
  const { openWalletSelector, isWalletSelectorIrremovable } = useContext(UserSettingsContext);

  const handleClose = useCallback(() => {
    !isWalletSelectorIrremovable && onClose(currentWallet);
  }, [isWalletSelectorIrremovable, currentWallet, onClose]);

  const handleWalletClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event) {
        const userWallet = (event.target as HTMLDivElement)
          .closest('.tc__walletSelector__item')
          ?.getAttribute('data-id');

        if (userWallet === 'installMetaMask') {
          window.open('https://metamask.io', '_blank');
          !isWalletSelectorIrremovable && onClose(currentWallet);
        } else {
          onClose(userWallet as UserWallet);
        }
      }
    },
    [isWalletSelectorIrremovable, currentWallet, onClose],
  );

  return (
    <Dialog onClose={handleClose} open={openWalletSelector} className="tc__walletSelector">
      <DialogTitle>
        <Typography variant="h4">{getText('selectWallet', locale)}</Typography>
        {!isWalletSelectorIrremovable && (
          <IconButton aria-label="close" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent>
        <List>
          <li className="MuiListItem-root tc__walletSelector__item MuiListItem-gutters">
            <div className="MuiListItemText-root">
              <span
                className="MuiTypography-root MuiListItemText-primary MuiTypography-body1 MuiTypography-displayBlock"
                dangerouslySetInnerHTML={{ __html: getText('walletSelectorDisclaimer', locale) }}
              ></span>
            </div>
          </li>
          {Object.entries(availableWallets)
            .sort((a, b) => (a[0] < b[0] ? -1 : 1))
            .map(([userWallet, isAvailable]) => {
              if (userWallet === 'MetaMask' && !isAvailable) {
                return (
                  <ListItem
                    button
                    key={userWallet}
                    className="tc__walletSelector__item"
                    onClick={handleWalletClick}
                    data-id="installMetaMask"
                  >
                    <ListItemText primary="Install MetaMask" />
                    <WalletIcon wallet={userWallet as UserWallet} />
                  </ListItem>
                );
              }
              return (
                <ListItem
                  button
                  key={userWallet}
                  className="tc__walletSelector__item"
                  onClick={handleWalletClick}
                  data-id={userWallet}
                >
                  <ListItemText primary={userWallet} />
                  <WalletIcon wallet={userWallet as UserWallet} />
                </ListItem>
              );
            })}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelector;
