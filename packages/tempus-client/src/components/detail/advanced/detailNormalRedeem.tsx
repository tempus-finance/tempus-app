import { FC, useCallback, useState } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import { Ticker } from '../../../interfaces/Token';
import ConnectingArrow from '../shared/connectingArrow';
import ActionContainer from '../shared/actionContainer';
import ActionContainerGrid from '../shared/actionContainerGrid';
import CurrencyInput from '../../currencyInput';
import TokenSelector from '../../tokenSelector';
import Execute from '../shared/execute';

import './detailMint.scss';

type DetailNormalRedeemInProps = {
  content?: any;
};

type DetailNormalRedeemOutProps = {};

type DetailNormalRedeemProps = DetailNormalRedeemInProps & DetailNormalRedeemOutProps;

const DetailNormalRedeem: FC<DetailNormalRedeemProps> = ({ content }) => {
  const { token = '', protocol = '', balance = 0, defaultToken } = content || {};
  const RandomUSDValue = 12.567;

  const [amount, setAmount] = useState<number>(0);
  const [withdrawBalance] = useState<number>(123);

  const onAmountChange = useCallback(
    (amount: number | undefined) => {
      console.log('onAmountChange', amount);
      if (!!amount && !isNaN(amount)) {
        setAmount(amount);
      }
    },
    [setAmount],
  );

  const onClickMax = useCallback(() => {
    setAmount(balance);
  }, [balance, setAmount]);

  const tpsValue = 42942;
  const tysValue = 6242;

  const tickers = ['ETH', 'USDC'] as Ticker[];

  return (
    <>
      <ActionContainer label="From">
        <ActionContainerGrid className="tf__detail-withdraw__grid">
          <div className="tf__dialog__tab__action-container-grid__top-left element1">
            <TokenSelector tickers={['Principals', 'Yields']} />
          </div>

          <div className="tf__dialog__tab__action-container-grid__top-right element2">
            <div className="tf__dialog__tab__action-container__balance">
              <Typography variant="subtitle2" className="tf__dialog__tab__action-container__balance-title">
                Balance
              </Typography>
              <div className="tf__dialog__tab__action-container__balance-value">
                {new Intl.NumberFormat().format(tpsValue)}
              </div>
              <div className="tf__dialog__tab__action-container__balance-max">
                <Button
                  value="tps"
                  variant="contained"
                  size="small"
                  onClick={onClickMax}
                  className="tf__action__max-balance"
                >
                  Max
                </Button>
              </div>
            </div>
            <div className="tf__dialog__tab__action-container__token-amount">
              <CurrencyInput defaultValue={0} onChange={onAmountChange} />
            </div>
          </div>
        </ActionContainerGrid>
      </ActionContainer>
      <ConnectingArrow />
      <ActionContainer label="To">
        <ActionContainerGrid>
          <div className="tf__dialog__tab__action-container-grid__centre-left tf__dialog__tab__action-container__token-selector">
            <TokenSelector tickers={tickers} defaultTicker={defaultToken} />
          </div>

          <div className="tf__dialog__tab__action-container-grid__centre-right tf__dialog__tab__action-container__lp-tokens">
            <div>
              <span className="small-title">(est.)</span> {new Intl.NumberFormat().format(2241)}
            </div>
            <div className="tf__dialog__tab__action-container__token-amount-fiat">
              <div>
                {withdrawBalance !== undefined
                  ? `~ ${new Intl.NumberFormat().format(withdrawBalance * RandomUSDValue)} USD`
                  : ''}
              </div>
            </div>
          </div>
        </ActionContainerGrid>
      </ActionContainer>
      <Execute onApprove={() => null} onExecute={() => null} />
    </>
  );
};

export default DetailNormalRedeem;
