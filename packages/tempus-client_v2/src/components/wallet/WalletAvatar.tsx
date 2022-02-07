import React from 'react';
import Blockies from 'react-blockies';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';

type WalletAvatarProps = {
  avatar?: string | null;
  name?: string | null;
};

const WalletAvatar: React.FC<WalletAvatarProps> = props => {
  const { avatar = '', name = '' } = props;

  if (!name) {
    return <AccountBalanceWalletIcon />;
  }

  return (
    <div className="tc__connect-wallet-button__profile">
      {avatar ? <img src={avatar} alt={name} /> : <Blockies seed={name} scale={3} />}
    </div>
  );
};

export default WalletAvatar;
