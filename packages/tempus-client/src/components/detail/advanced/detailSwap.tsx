import { FC, MouseEvent, useCallback, useState } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Ticker } from '../../../interfaces/Token';
import TokenSelector from '../../tokenSelector';
import ConnectingArrow from '../shared/connectingArrow';
import ActionContainer from '../shared/actionContainer';
import ActionContainerGrid from '../shared/actionContainerGrid';
import Execute from '../shared/execute';
import CurrencyInput from '../../currencyInput';

type DetailSwapInProps = {
  content?: any;
  selectedTab: number;
};

type DetailSwapOutProps = {};

type DetailSwapProps = DetailSwapInProps & DetailSwapOutProps;

const DetailSwap: FC<DetailSwapProps> = ({ content, selectedTab }) => {
  const { protocol = '', balance = 0, fixedAPY = 0, variableAPY = 0 } = content || {};

  const [apy, setApy] = useState('fixed');
  const [tlpt, settlpt] = useState(0); // TODO should come from content

  const [amount, setAmount] = useState<number>(0);

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

  const tpsValue = 52102.42;
  const tysValue = 0;
  const RandomUSDValue = 12.567;

  const tickers = ['PRINCIPALS', 'YIELDS'] as Ticker[];

  const [token, setToken] = useState<string>('');

  const onTokenChange = useCallback(
    (value: string | undefined) => {
      if (value) {
        setToken(value);
      }
    },
    [setToken],
  );

  return (
    <div role="tabpanel" hidden={selectedTab !== 1}>
      <div className="tf__dialog__content-tab">
        <ActionContainer label="From">
          <ActionContainerGrid>
            <div className="tf__dialog__tab__action-container-grid__centre-left tf__dialog__tab__action-container__token-selector">
              <TokenSelector tickers={tickers} defaultTicker="PRINCIPALS" onTokenChange={onTokenChange} />
            </div>

            <div className="tf__dialog__tab__action-container-grid__top-right tf__dialog__tab__action-container__balance">
              <Typography variant="subtitle2" className="tf__dialog__tab__action-container__balance-title">
                Balance
              </Typography>
              <div className="tf__dialog__tab__action-container__balance-value">
                {new Intl.NumberFormat().format(balance)}
              </div>
              <div className="tf__dialog__tab__action-container__balance-max">
                <Button
                  value="Max"
                  variant="contained"
                  size="small"
                  onClick={onClickMax}
                  className="tf__action__max-balance"
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="tf__dialog__tab__action-container-grid__centre-right tf__dialog__tab__action-container__token-amount">
              <CurrencyInput defaultValue={0} onChange={onAmountChange} />
            </div>
          </ActionContainerGrid>
        </ActionContainer>

        <ConnectingArrow />

        <ActionContainer label="To">
          <ActionContainerGrid>
            <div
              className="tf__dialog__tab__action-container-grid__centre-left tf__dialog__tab__action-container__single-token"
              style={{ paddingTop: '20px', paddingBottom: '20px' }}
            >
              <div className="tf__tokens-returned__name">
                <div className="tf__tokens-returned__ticker">
                  <span>{token === 'PRINCIPALS' ? 'YIELDS' : 'PRINCIPALS'}</span>
                </div>
              </div>
            </div>

            <div className="tf__dialog__tab__action-container-grid__centre-right tf__dialog__tab__action-container__lp-tokens">
              <div>
                <span className="small-title">(est.)</span> {new Intl.NumberFormat().format(2241)}
              </div>
            </div>
          </ActionContainerGrid>
        </ActionContainer>

        <Execute onApprove={() => null} onExecute={() => null} />
      </div>
    </div>
  );
};

export default DetailSwap;
