import { FC, useCallback, useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import TokenDescriptor from '../../tokenDescriptor';
import ConnectingArrow from '../shared/connectingArrow';
import ActionContainer from '../shared/actionContainer';
import ActionContainerGrid from '../shared/actionContainerGrid';
import Execute from '../shared/execute';
import CurrencyInput from '../../currencyInput';

type DetailPoolAddLiquidityInProps = {
  content?: any;
};

type DetailPoolAddLiquidityOutProps = {};

type DetailPoolAddLiquidityProps = DetailPoolAddLiquidityInProps & DetailPoolAddLiquidityOutProps;

const DetailPoolAddLiquidity: FC<DetailPoolAddLiquidityProps> = ({ content }) => {
  const { balance = 0 } = content || {};

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

  const tpsValue = 42942;
  const tysValue = 6242;

  return (
    <>
      <ActionContainer label="From">
        <ActionContainerGrid className="tf__detail-withdraw__grid">
          <div className="tf__dialog__tab__action-container-grid__top-left element1">
            <div className="tf__tokens-returned__name">
              <div className="tf__tokens-returned__ticker">
                <span>LP Token</span>
              </div>
            </div>
          </div>

          <div className="tf__dialog__tab__action-container-grid__top-right element2">
            <div className="tf__dialog__tab__action-container__balance">
              <Typography variant="subtitle2" className="tf__dialog__tab__action-container__balance-title">
                Balance
              </Typography>
              <div className="tf__dialog__tab__action-container__balance-value">
                {new Intl.NumberFormat().format(balance)}
              </div>
              <div className="tf__dialog__tab__action-container__balance-max">
                <Button
                  value="lp"
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
        <ActionContainerGrid className="tf__detail-mint__grid">
          <div className="tf__dialog__tab__action-container-grid__centre-left tf__dialog__tab__action-container__tokens-returned element3">
            <div className="tf__tokens-returned__name">
              <div className="tf__tokens-returned__ticker">
                <span>Principals</span>
                <span className="tf__tokens-returned__description">Principal Share</span>
              </div>
            </div>
            <div className="tf__tokens-returned__data">{new Intl.NumberFormat().format(tpsValue)}</div>
          </div>
          <div className="tf__dialog__tab__action-container-grid__centre-middle element5">
            <div className="add-icon-container2">
              <AddIcon />
            </div>
          </div>
          <div className="tf__dialog__tab__action-container-grid__centre-right tf__dialog__tab__action-container__tokens-returned element4">
            <div className="tf__tokens-returned__name">
              <div className="tf__tokens-returned__ticker">
                <span>Yields</span>
                <span className="tf__tokens-returned__description">Yield Share</span>
              </div>
            </div>
            <div className="tf__tokens-returned__data">{new Intl.NumberFormat().format(tysValue)}</div>
          </div>
        </ActionContainerGrid>
      </ActionContainer>
      <Execute approveLabel="Remove Liquidity" onApprove={() => null} onExecute={() => null} />
    </>
  );
};

export default DetailPoolAddLiquidity;
