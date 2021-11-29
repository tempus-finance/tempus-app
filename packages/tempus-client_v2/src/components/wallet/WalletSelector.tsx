import { FC, MouseEvent, useCallback, useContext } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';
import WalletIcon from '../walletIcon/WalletIcon';
import UserWallet from '../../interfaces/UserWallet';
import './WalletSelector.scss';

type WalletSelectorInProps = {
  open: boolean;
  availableWallets: { [w in UserWallet]?: boolean };
  currentWallet: UserWallet | null;
};

type WalletSelectorOutProps = {
  onClose: (wallet: UserWallet | null) => void;
};

type WalletSelectorProps = WalletSelectorInProps & WalletSelectorOutProps;

const WalletSelector: FC<WalletSelectorProps> = ({ open, availableWallets, currentWallet, onClose }) => {
  const { language } = useContext(LanguageContext);

  const handleClose = () => {
    onClose(currentWallet);
  };

  const handleWalletClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event) {
        const userWallet = (event.target as HTMLDivElement)
          .closest('.tc__walletSelector__item')
          ?.getAttribute('data-id');

        if (userWallet === 'installMetaMask') {
          window.open('https://metamask.io', '_blank');
          onClose(currentWallet);
        } else {
          onClose(userWallet as UserWallet);
        }
      }
    },
    [currentWallet, onClose],
  );

  return (
    <Dialog onClose={handleClose} open={open} className="tc__walletSelector">
      <DialogTitle>
        <Typography variant="h4">{getText('selectWallet', language)}</Typography>
        <IconButton aria-label="close" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <List>
          <li className="MuiListItem-root tc__walletSelector__item MuiListItem-gutters">
            <div className="MuiListItemText-root">
              <span
                className="MuiTypography-root MuiListItemText-primary MuiTypography-body1 MuiTypography-displayBlock"
                dangerouslySetInnerHTML={{ __html: getText('walletSelectorDisclaimer', language) }}
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
