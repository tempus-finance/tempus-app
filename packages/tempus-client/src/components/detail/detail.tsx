import { FC, ChangeEvent, useEffect, useCallback, useContext, useState } from 'react';
import { format } from 'date-fns';
import Switch from '@material-ui/core/Switch';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import PoolDataAdapter from '../../adapters/PoolDataAdapter';
import { DashboardRowChild } from '../../interfaces';
import { Context } from '../../context';
import TokenIcon, { getTickerFromProtocol } from '../tokenIcon';
import Typography from '../typography/Typography';
import Spacer from '../spacer/spacer';
import DetailUserInfo from './shared/detailUserInfo/detailUserInfo';
import DetailBasic from './basic/detailBasic';
import DetailAdvanced from './advanced/detailAdvanced';

import './detail.scss';

type DetailInProps = {
  content: DashboardRowChild;
};

type DetailOutPros = {
  onClose: () => void;
};

type DetailProps = DetailInProps & DetailOutPros;

const Detail: FC<DetailProps> = ({ content, onClose }) => {
  const { token, protocol, maturityDate, tempusPool } = content;

  const [showAdvancedUI, setShowAdvancedUI] = useState<boolean>(false);
  const [poolDataAdapter, setPoolDataAdapter] = useState<PoolDataAdapter | null>(null);

  const {
    data: { userWalletSigner, userWalletAddress },
  } = useContext(Context);

  const onInterfaceChange = useCallback(
    (_: ChangeEvent<{}>, checked: boolean) => {
      setShowAdvancedUI(checked);
    },
    [setShowAdvancedUI],
  );

  useEffect(() => {
    if (userWalletSigner) {
      setPoolDataAdapter(getPoolDataAdapter(userWalletSigner));
    }
  }, [userWalletSigner]);

  return (
    <div className="tf__detail__section__container">
      <div className="tf__dialog-container">
        <div className="tf__dialog-container__header">
          <div className="tf__dialog-container__header-summary-data">
            <TokenIcon ticker={token} />
            <Typography color="default" variant="h4">
              &nbsp;&nbsp;{token} via&nbsp;&nbsp;
            </Typography>
            <TokenIcon ticker={getTickerFromProtocol(protocol)} />
            <Typography color="default" variant="h4" capitalize={true}>
              &nbsp;&nbsp;{protocol}
            </Typography>
          </div>

          <div className="tf__dialog-container__header-ui-toggle">
            <Switch checked={showAdvancedUI} onChange={onInterfaceChange} name="advanced-options" />
            <Typography color="default" variant="h4">
              Advanced options
            </Typography>
          </div>
        </div>
        <div>
          <Typography color="default" variant="h5">
            Matures on {format(maturityDate, 'dd MMM yy')}
          </Typography>
        </div>
        <Spacer size={18} />
        <div className="tf__dialog__content">
          {showAdvancedUI ? (
            <DetailAdvanced
              content={content}
              tempusPool={tempusPool}
              userWalletAddress={userWalletAddress}
              poolDataAdapter={poolDataAdapter}
              signer={userWalletSigner}
            />
          ) : (
            <DetailBasic
              content={content}
              tempusPool={tempusPool}
              signer={userWalletSigner}
              userWalletAddress={userWalletAddress}
              poolDataAdapter={poolDataAdapter}
            />
          )}
        </div>
      </div>
      <Spacer size={23} />
      <div className="tf__user__details-container">
        <DetailUserInfo
          content={content}
          poolDataAdapter={poolDataAdapter}
          tempusPool={tempusPool}
          signer={userWalletSigner}
          userWalletAddress={userWalletAddress}
        />
      </div>
    </div>
  );
};

export default Detail;
