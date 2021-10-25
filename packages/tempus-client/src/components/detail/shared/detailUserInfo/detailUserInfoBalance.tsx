import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { ethers, BigNumber } from 'ethers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Divider } from '@material-ui/core';
import NumberUtils from '../../../../services/NumberUtils';
import { TempusPool } from '../../../../interfaces/TempusPool';
import { DashboardRowChild } from '../../../../interfaces';
import PoolDataAdapter from '../../../../adapters/PoolDataAdapter';
import Spacer from '../../../spacer/spacer';
import Typography from '../../../typography/Typography';
import ActionContainer from './../actionContainer';
import SectionContainer from './../sectionContainer';
import DetailUserInfoBalanceChart from './detailUserInfoBalanceChart';
import { Context, getDataForPool } from '../../../../context';

interface DetailUserInfoBalancesProps {
  content: DashboardRowChild;
  poolDataAdapter: PoolDataAdapter | null;
  tempusPool: TempusPool;
  signer: JsonRpcSigner | null;
  userWalletAddress: string;
}

const DetailUserInfoBalance: FC<DetailUserInfoBalancesProps> = props => {
  const { poolDataAdapter, userWalletAddress, tempusPool, content } = props;
  const { ammAddress } = tempusPool;
  const { supportedTokens } = content;

  const backingTokenTicker = supportedTokens[0];
  const yieldBearingTokenTicker = supportedTokens[1];

  const {
    data: { userPrincipalsBalance, userYieldsBalance, userLPBalance, poolData },
  } = useContext(Context);

  const [lpTokenPrincipalReturnBalance, setLpTokenPrincipalReturn] = useState<BigNumber>(BigNumber.from('0'));
  const [lpTokenYieldReturnBalance, setLpTokenYieldReturn] = useState<BigNumber>(BigNumber.from('0'));

  useEffect(() => {
    const retrieveUserBalances = async () => {
      if (ammAddress && poolDataAdapter && userLPBalance) {
        try {
          const expectedLPTokenReturn = await poolDataAdapter.getExpectedReturnForLPTokens(ammAddress, userLPBalance);

          setLpTokenPrincipalReturn(expectedLPTokenReturn.principals);
          setLpTokenYieldReturn(expectedLPTokenReturn.yields);
        } catch (error) {
          console.error(
            'Detail User Info - retrieveUserBalances() - Failed to fetch token balances for the user!',
            error,
          );
        }
      }
    };

    retrieveUserBalances();
  }, [ammAddress, userWalletAddress, poolDataAdapter, userLPBalance]);

  const showCurrentPosition = useMemo(() => {
    if (!userPrincipalsBalance || !userYieldsBalance) {
      return false;
    }

    return !userPrincipalsBalance.isZero() || !userYieldsBalance.isZero();
  }, [userPrincipalsBalance, userYieldsBalance]);

  const formattedPresentValue = useMemo(() => {
    const data = getDataForPool(content.tempusPool.address, poolData);

    if (!data.userBalanceUSD) {
      return null;
    }
    return NumberUtils.formatToCurrency(ethers.utils.formatEther(data.userBalanceUSD), 2, '$');
  }, [content.tempusPool.address, poolData]);

  const backingTokenValue = useMemo(() => {
    const data = getDataForPool(content.tempusPool.address, poolData);
    if (!data.userBackingTokenBalance) {
      return null;
    }

    return NumberUtils.formatToCurrency(
      ethers.utils.formatEther(data.userBackingTokenBalance),
      tempusPool.decimalsForUI,
    );
  }, [content.tempusPool.address, poolData, tempusPool.decimalsForUI]);

  const yieldBearingTokenValue = useMemo(() => {
    const data = getDataForPool(content.tempusPool.address, poolData);
    if (!data.userYieldBearingTokenBalance) {
      return null;
    }
    return NumberUtils.formatToCurrency(
      ethers.utils.formatEther(data.userYieldBearingTokenBalance),
      tempusPool.decimalsForUI,
    );
  }, [content.tempusPool.address, poolData, tempusPool.decimalsForUI]);

  return (
    <>
      <SectionContainer>
        <ActionContainer label="Available">
          <Spacer size={6} />
          <div className="tf__detail__user__info-row">
            <Typography variant="body-text">{backingTokenTicker}</Typography>
            <Typography variant="body-text">{backingTokenValue}</Typography>
          </div>
          <div className="tf__detail__user__info-row">
            <Typography variant="body-text">{yieldBearingTokenTicker}</Typography>
            <Typography variant="body-text">{yieldBearingTokenValue}</Typography>
          </div>
        </ActionContainer>
      </SectionContainer>
      <Spacer size={20} />
      {showCurrentPosition && (
        <SectionContainer>
          <ActionContainer label="Current position">
            <div className="tf__detail__user__info-row">
              <Typography variant="body-text">Value</Typography>
              <Typography variant="body-text">{formattedPresentValue}</Typography>
            </div>
            <Divider />
            <Spacer size={20} />
            <DetailUserInfoBalanceChart
              lpTokenPrincipalReturnBalance={lpTokenPrincipalReturnBalance}
              lpTokenYieldReturnBalance={lpTokenYieldReturnBalance}
              tempusPool={tempusPool}
            />
          </ActionContainer>
        </SectionContainer>
      )}
    </>
  );
};
export default DetailUserInfoBalance;
