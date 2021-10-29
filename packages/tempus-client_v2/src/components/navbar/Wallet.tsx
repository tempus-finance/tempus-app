import { FC } from 'react';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import getText from '../../localisation/getText';
import SharedProps from '../../sharedProps';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import './Wallet.scss';

type WalletInProps = SharedProps;

const Wallet: FC<WalletInProps> = ({ language }) => {
  return (
    <div className="tc__navBar__wallet">
      <div className="tc__connect-wallet-button__container">
        <div className="tc__connect-wallet-button">
          <AccountBalanceWalletIcon />
          <Spacer size={4} />
          <Typography variant="h5">{getText('connectWallet', language)}</Typography>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
