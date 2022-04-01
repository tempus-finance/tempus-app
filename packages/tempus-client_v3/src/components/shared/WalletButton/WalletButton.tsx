import { FC, memo } from 'react';
import { Chain } from '../../../interfaces/Chain';
import { Ticker } from '../../../interfaces/Token';
import Button from '../Button';
import Typography from '../Typography';
import './WalletButton.scss';

interface WalletButtonProps {
  address: string;
  balance: string;
  ticker: Ticker;
  network: Chain;
}

const WalletButton: FC<WalletButtonProps> = props => {
  return (
    <Button className="tc__walletButton__disconnected">
      <Typography variant="body-primary" weight="bold">
        Connect Wallet
      </Typography>
    </Button>
  );
};
export default memo(WalletButton);
