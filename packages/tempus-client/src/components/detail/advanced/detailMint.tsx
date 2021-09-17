import { FC, useCallback, useState } from 'react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';

import TokenSelector from '../../tokenSelector';
import CurrencyInput from '../../currencyInput';
import ConnectingArrow from '../shared/connectingArrow';
import ActionContainer from '../shared/actionContainer';
import ActionContainerGrid from '../shared/actionContainerGrid';
import Execute from '../shared/execute';

import './detailMint.scss';

type DetailMintInProps = {
  content?: any;
  selectedTab: number;
};

type DetailMintOutProps = {};

type DetailMintProps = DetailMintInProps & DetailMintOutProps;

const DetailMint: FC<DetailMintProps> = ({ content, selectedTab }) => {
  const { token = '', protocol = '', balance = 0 } = content || {};

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

  return (
    <div role="tabpanel" hidden={selectedTab !== 0}>
      <div className="tf__dialog__content-tab">
        <ActionContainer label="From">
          <ActionContainerGrid>
            <div className="tf__dialog__tab__action-container-grid__centre-left tf__dialog__tab__action-container__token-selector">
              <TokenSelector tickers={['ETH', 'DAI']} />
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

            <div className="tf__dialog__tab__action-container-grid__bottom-left tf__dialog__tab__action-container__token-description">
              {protocol.toUpperCase()} staked {token}
            </div>

            <div className="tf__dialog__tab__action-container-grid__bottom-right tf__dialog__tab__action-container__token-amount-fiat">
              <div>{amount !== undefined ? `~ ${amount * 12.567} USD` : ''}</div>
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
        <Execute onApprove={() => null} onExecute={() => null} />
      </div>
    </div>
  );
};

export default DetailMint;
