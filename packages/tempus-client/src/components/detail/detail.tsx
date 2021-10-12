import { utils, BigNumber } from 'ethers';
import { FC, ChangeEvent, useEffect, useCallback, useContext, useState } from 'react';
import Switch from '@material-ui/core/Switch';
import { formatDate } from '../../utils/formatDate';
import NumberUtils from '../../services/NumberUtils';
import getPoolDataAdapter from '../../adapters/getPoolDataAdapter';
import PoolDataAdapter from '../../adapters/PoolDataAdapter';
import { DashboardRowChild } from '../../interfaces';
import { Context } from '../../context';
import PresentValueProvider from '../../providers/presentValueProvider';
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
  const { address, ammAddress } = tempusPool || {};

  const [showAdvancedUI, setShowAdvancedUI] = useState<boolean>(false);
  const [poolDataAdapter, setPoolDataAdapter] = useState<PoolDataAdapter | null>(null);

  const { data, setData } = useContext(Context);
  const { userWalletAddress, userWalletSigner } = data;

  const [poolFees, setPoolFees] = useState<BigNumber[] | []>([]);

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

  // Fetch user balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!setData || !poolDataAdapter || !userWalletSigner) {
        return;
      }

      const [backingTokenBalance, yieldBearingTokenBalance, principalsBalance, yieldsBalance, lpBalance] =
        await Promise.all([
          poolDataAdapter.getTokenBalance(content.backingTokenAddress, userWalletAddress, userWalletSigner),
          poolDataAdapter.getTokenBalance(content.yieldBearingTokenAddress, userWalletAddress, userWalletSigner),
          poolDataAdapter.getTokenBalance(content.principalTokenAddress, userWalletAddress, userWalletSigner),
          poolDataAdapter.getTokenBalance(content.yieldTokenAddress, userWalletAddress, userWalletSigner),
          poolDataAdapter.getTokenBalance(tempusPool.ammAddress, userWalletAddress, userWalletSigner),
        ]);

      setData(previousData => ({
        ...previousData,
        userBackingTokenBalance: backingTokenBalance,
        userYieldBearingTokenBalance: yieldBearingTokenBalance,
        userPrincipalsBalance: principalsBalance,
        userYieldsBalance: yieldsBalance,
        userLPBalance: lpBalance,
      }));
    };
    fetchBalances();
  }, [
    setData,
    poolDataAdapter,
    content.backingTokenAddress,
    content.yieldBearingTokenAddress,
    content.principalTokenAddress,
    content.yieldTokenAddress,
    tempusPool.ammAddress,
    userWalletAddress,
    userWalletSigner,
  ]);

  useEffect(() => {
    const getPoolFees = async () => {
      if (!setPoolFees || !poolDataAdapter) {
        return;
      }

      if (poolDataAdapter) {
        const poolFees = await poolDataAdapter.getPoolFees(address, ammAddress);
        if (poolFees && poolFees.length) {
          setPoolFees(poolFees);
        }
      }
    };

    getPoolFees();
  }, [address, ammAddress, setPoolFees, poolDataAdapter]);

  return (
    <div className="tf__detail__section__container">
      <div className="tf__dialog-container">
        <div className="tf__dialog-container__header">
          <div className="tf__dialog-container__header-summary-data">
            <TokenIcon ticker={token} />
            <Typography color="default" variant="h4">
              {token} via
            </Typography>
            <TokenIcon ticker={getTickerFromProtocol(protocol)} />
            <Typography color="default" variant="h4" capitalize={true}>
              {protocol}
            </Typography>
            <Typography color="default" variant="h4">
              -
            </Typography>
            <Typography color="default" variant="h4">
              Matures on {formatDate(maturityDate, 'dd MMM yy')}
            </Typography>
          </div>
          <div className="tf__dialog-container__header-ui-toggle">
            <Switch checked={showAdvancedUI} onChange={onInterfaceChange} name="advanced-options" />
            <Typography color="default" variant="h4">
              Advanced
            </Typography>
          </div>
        </div>
        <div className="tf__divider" />
        {showAdvancedUI && (
          <div className="tf__dialog-container__fees">
            <Typography color="default" variant="h4">
              Fees:
            </Typography>
            <Typography color="default" variant="h5">
              Deposit {poolFees[0] && NumberUtils.formatPercentage(Number(utils.formatEther(poolFees[0])))}
            </Typography>
            <Typography color="default" variant="h5">
              Redemption {poolFees[2] && NumberUtils.formatPercentage(Number(utils.formatEther(poolFees[2])))}
            </Typography>
            <Typography color="default" variant="h5">
              Early Redemption {poolFees[1] && NumberUtils.formatPercentage(Number(utils.formatEther(poolFees[1])))}
            </Typography>
            <Typography color="default" variant="h5">
              Swap {poolFees[3] && NumberUtils.formatPercentage(Number(utils.formatEther(poolFees[3])))}
            </Typography>
          </div>
        )}

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
      {poolDataAdapter && <PresentValueProvider poolDataAdapter={poolDataAdapter} tempusPool={tempusPool} />}
    </div>
  );
};

export default Detail;
