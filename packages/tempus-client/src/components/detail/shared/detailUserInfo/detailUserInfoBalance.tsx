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
import { Context } from '../../../../context';

interface DetailUserInfoBalancesProps {
  content: DashboardRowChild;
  poolDataAdapter: PoolDataAdapter | null;
  tempusPool: TempusPool;
  signer: JsonRpcSigner | null;
  userWalletAddress: string;
}

const DetailUserInfoBalance: FC<DetailUserInfoBalancesProps> = props => {
  const { poolDataAdapter, signer, userWalletAddress, tempusPool, content } = props;
  const { address, ammAddress } = tempusPool;
  const { supportedTokens, availableTokensToDeposit, presentValue } = content;

  const backingTokenTicker = supportedTokens[0];
  const yieldBearingTokenTicker = supportedTokens[1];

  const { data } = useContext(Context);

  const [backingTokenValue, setBackingTokenValue] = useState<string>('');
  const [yieldBearingTokenValue, setYieldBearingTokenValue] = useState<string>('');
  const [formattedPresentValue, setFormattedPresentValue] = useState<string>('');
  const [lpTokenPrincipalReturnBalance, setLpTokenPrincipalReturn] = useState<BigNumber>(BigNumber.from('0'));
  const [lpTokenYieldReturnBalance, setLpTokenYieldReturn] = useState<BigNumber>(BigNumber.from('0'));

  useMemo(() => {
    if (!availableTokensToDeposit || !presentValue) {
      return;
    }

    setBackingTokenValue(
      NumberUtils.formatWithMultiplier(ethers.utils.formatEther(availableTokensToDeposit.backingToken), 2),
    );
    setYieldBearingTokenValue(
      NumberUtils.formatWithMultiplier(ethers.utils.formatEther(availableTokensToDeposit.yieldBearingToken), 2),
    );
    setFormattedPresentValue(`$${NumberUtils.formatWithMultiplier(ethers.utils.formatEther(presentValue), 2)}`);
  }, [availableTokensToDeposit, presentValue]);

  useEffect(() => {
    const retrieveBalances = async () => {
      if (signer && address && ammAddress && poolDataAdapter) {
        try {
          const userBalance = await poolDataAdapter.retrieveBalances(address, ammAddress, userWalletAddress, signer);
          const expectedLPTokenReturn = await poolDataAdapter.getExpectedReturnForLPTokens(
            ammAddress,
            userBalance.lpTokensBalance,
          );

          setLpTokenPrincipalReturn(expectedLPTokenReturn.principals);
          setLpTokenYieldReturn(expectedLPTokenReturn.yields);
        } catch (error) {
          console.error('Detail User Info - retrieveBalances() - Failed to fetch token balances for the user!', error);
        }
      }
    };

    retrieveBalances();
  }, [signer, address, ammAddress, userWalletAddress, poolDataAdapter]);

  const showCurrentPosition = useMemo(() => {
    if (!data.userPrincipalsBalance || !data.userYieldsBalance) {
      return false;
    }

    return !data.userPrincipalsBalance.isZero() || !data.userYieldsBalance.isZero();
  }, [data.userPrincipalsBalance, data.userYieldsBalance]);

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
            />
          </ActionContainer>
        </SectionContainer>
      )}
    </>
  );
};
export default DetailUserInfoBalance;
