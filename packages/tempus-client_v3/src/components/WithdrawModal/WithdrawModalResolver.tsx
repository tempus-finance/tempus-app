import { FC } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Chain } from 'tempus-core-services';
import { getConfigManager } from '../../config/getConfigManager';
import { usePoolBalance, useTokenRates } from '../../hooks';
import { TokenMetadataProp } from '../../interfaces';
import { WithdrawModal } from './WithdrawModal';

export const WithdrawModalResolver: FC = () => {
  const navigate = useNavigate();
  const { chain, ticker, protocol, poolAddress } = useParams();

  const tokenRates = useTokenRates();
  const poolBalanceData = usePoolBalance(poolAddress, chain as Chain);

  const poolData = getConfigManager().getPoolData(poolAddress || '');
  const chainData = getConfigManager().getChainConfig(chain as Chain);

  if (!poolData) {
    // TODO - Show pool not found page 404
    return null;
  }

  // Temp solution to mitigate ESlint unused param error
  console.log(chain, ticker, protocol, poolAddress);

  const backingTokenId = `${poolData.chain}-${poolData.backingTokenAddress}`;
  const yieldBearingTokenId = `${poolData.chain}-${poolData.yieldBearingTokenAddress}`;

  const backingTokenRate = tokenRates[backingTokenId];
  const yieldBearingTokenRate = tokenRates[yieldBearingTokenId];

  // Don't show anything until rates are loaded,
  // we might want to show skeleton loading boxes for things that are still loading
  if (
    !backingTokenRate ||
    !yieldBearingTokenRate ||
    !poolBalanceData?.balanceInBackingToken ||
    !poolBalanceData?.balanceInYieldBearingToken
  ) {
    return null;
  }

  const tokens: TokenMetadataProp = [
    {
      precision: poolData.tokenPrecision.yieldBearingToken,
      precisionForUI: poolData.decimalsForUI,
      address: poolData.yieldBearingTokenAddress,
      rate: yieldBearingTokenRate,
      ticker: poolData.yieldBearingToken,
      balance: poolBalanceData.balanceInYieldBearingToken,
    },
  ];
  if (poolData.backingToken !== 'ETH') {
    tokens.push({
      precision: poolData.tokenPrecision.backingToken,
      precisionForUI: poolData.decimalsForUI,
      address: poolData.backingTokenAddress,
      rate: backingTokenRate,
      ticker: poolData.backingToken,
      balance: poolBalanceData.balanceInBackingToken,
    });
  }

  const handleCloseModal = () => {
    navigate(-1);
  };

  return (
    // TODO - Replace dummy data with data from hooks
    <WithdrawModal chainConfig={chainData} tempusPool={poolData} tokens={tokens} onClose={handleCloseModal} open />
  );
};
