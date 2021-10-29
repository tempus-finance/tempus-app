import { FC } from 'react';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import './Wallet.scss';

const Wallet: FC = () => {
  return (
    <div className="tc__navBar__wallet">
      <div className="tc__connect-wallet-button__container">
        <div className="tc__connect-wallet-button">
          <AccountBalanceWalletIcon />
          <Spacer size={4} />
          <Typography variant="h5">CONNECT WALLET</Typography>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
