import { FC, useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import format from 'date-fns/format';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import NumberUtils from '../../../services/NumberUtils';
import CurrencyInput from '../../currencyInput';
import TokenSelector from '../../tokenSelector';
import ConnectingArrow from '../shared/connectingArrow';
import ActionContainer from '../shared/actionContainer';
import ActionContainerGrid from '../shared/actionContainerGrid';
import Execute from '../shared/execute';
import PoolDetailProps from '../shared/PoolDetailProps';

import '../shared/style.scss';

const DetailDeposit: FC<PoolDetailProps> = ({
  selectedTab,
  tempusPool,
  content,
  signer,
  userWalletAddress,
  poolDataAdapter,
}) => {
  const { address, ammAddress } = tempusPool || {};
  const { supportedTokens = [], protocol = '', fixedAPR = 0, variableAPY = 0, maturityDate } = content || {};
  const [backingToken] = supportedTokens;

  const [selectedToken, setSelectedToken] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [usdRate, setUsdRate] = useState<number>(0);
  const [minTYSRate] = useState<number>(0); // TODO where to get this value?

  const [principalsAmount] = useState<number>(1234); // TODO where to get this value?
  const [lpTokensAmount] = useState<number>(4321); // TODO where to get this value?

  const [backingTokenBalance, setBackingTokenBalance] = useState<number | undefined>(undefined);
  const [yieldBearingTokenBalance, setYieldBearingTokenBalance] = useState<number | undefined>(undefined);

  const [backingTokenRate, setBackingTokenRate] = useState<number | undefined>(undefined);
  const [yieldBearingTokenRate, setYieldBearingTokenRate] = useState<number | undefined>(undefined);

  const [selectedYield, setSelectedYield] = useState<string>('');
  const [approveDisabled, setApproveDisabled] = useState<boolean>(false);
  const [executeDisabled, setExecuteDisabled] = useState<boolean>(true);

  const onTokenChange = useCallback(
    (token: string | undefined) => {
      if (!!token) {
        setSelectedToken(token);

        if (backingToken === token) {
          if (backingTokenBalance !== undefined && !isNaN(backingTokenBalance)) {
            setBalance(backingTokenBalance);
          }

          if (backingTokenRate !== undefined && !isNaN(backingTokenRate)) {
            setUsdRate(backingTokenRate);
          }
        }

        if (backingToken !== token) {
          if (yieldBearingTokenBalance !== undefined && !isNaN(yieldBearingTokenBalance)) {
            setBalance(yieldBearingTokenBalance);
          }

          if (yieldBearingTokenRate !== undefined && !isNaN(yieldBearingTokenRate)) {
            setUsdRate(yieldBearingTokenRate);
          }
        }
      }
    },
    [
      backingToken,
      backingTokenBalance,
      backingTokenRate,
      yieldBearingTokenBalance,
      yieldBearingTokenRate,
      setSelectedToken,
      setBalance,
    ],
  );

  const onAmountChange = useCallback(
    (value: number | undefined) => {
      if (!!value && !isNaN(value)) {
        setAmount(value);
      } else {
        setAmount(0);
      }
    },
    [setAmount],
  );

  const onClickMax = useCallback(() => {
    if (!!balance && !isNaN(balance)) {
      setAmount(balance);
    }
  }, [balance, setAmount]);

  const onSelectYield = useCallback(
    (event: any) => {
      const element = event.target.closest('[yield-attribute]');
      if (element) {
        setSelectedYield(element.getAttribute('yield-attribute'));
      }
    },
    [setSelectedYield],
  );

  const onApprove = useCallback(() => {
    const approve = async () => {
      if (signer) {
        try {
          const isBackingToken = backingToken === selectedToken;
          const approveTransaction = await poolDataAdapter?.approve(address, isBackingToken, signer, balance);
          if (approveTransaction) {
            await approveTransaction.wait();
            setExecuteDisabled(false);
          }
        } catch (err) {
          // TODO handle errors
          console.log('onApprove err', err);
        }
      }
    };
    setApproveDisabled(true);
    approve();
  }, [address, signer, backingToken, selectedToken, balance, poolDataAdapter, setApproveDisabled, setExecuteDisabled]);

  const onExecute = useCallback(() => {
    const execute = async () => {
      if (signer) {
        try {
          const parsedAmount = (amount || 0).toString();
          const tokenAmount = ethers.utils.parseEther(parsedAmount);
          const isBackingToken = backingToken === selectedToken;
          const parsedMinTYSRate = ethers.utils.parseEther(minTYSRate.toString());
          const depositTransaction = await poolDataAdapter?.executeDeposit(
            ammAddress,
            tokenAmount,
            isBackingToken,
            parsedMinTYSRate,
          );
          await depositTransaction?.wait();
          setExecuteDisabled(false);
        } catch (err) {
          // TODO handle errors
          console.log('onExecute err', err);
        }
      }
    };

    setExecuteDisabled(true);
    execute();
  }, [signer, ammAddress, backingToken, selectedToken, amount, minTYSRate, poolDataAdapter, setExecuteDisabled]);

  useEffect(() => {
    const retrieveBalances = async () => {
      if (signer && address && ammAddress) {
        try {
          const {
            backingTokenBalance = '0',
            backingTokenRate = '0',
            yieldBearingTokenBalance = '0',
            yieldBearingTokenRate = '0',
          } = (await poolDataAdapter?.retrieveBalances(address, ammAddress, userWalletAddress, signer)) || {};

          setBackingTokenBalance(Number(ethers.utils.formatEther(backingTokenBalance)));
          setBackingTokenRate(Number(ethers.utils.formatEther(backingTokenRate)));
          setYieldBearingTokenBalance(Number(ethers.utils.formatEther(yieldBearingTokenBalance)));
          setYieldBearingTokenRate(Number(ethers.utils.formatEther(yieldBearingTokenRate)));
        } catch (err) {
          // TODO handle errors
          console.log('Detail Deposit - retrieveBalances -', err);
        }
      }
    };

    retrieveBalances();
  }, [
    signer,
    address,
    ammAddress,
    userWalletAddress,
    poolDataAdapter,
    setBackingTokenBalance,
    setBackingTokenRate,
    setYieldBearingTokenRate,
    setYieldBearingTokenBalance,
  ]);

  useEffect(() => {
    setApproveDisabled(!amount || !selectedYield);
  }, [amount, selectedYield, setApproveDisabled]);

  return (
    <div role="tabpanel" hidden={selectedTab !== 0}>
      <div className="tf__dialog__content-tab">
        <ActionContainer label="From">
          <ActionContainerGrid>
            <div className="tf__dialog__tab__action-container-grid__top-left tf__dialog__tab__action-container__token-selector element7">
              <TokenSelector tickers={supportedTokens} onTokenChange={onTokenChange} />
              <div className="small-title">{selectedToken && `${protocol.toUpperCase()} staked ${selectedToken}`}</div>
            </div>

            <div className="tf__dialog__tab__action-container-grid__top-right element2">
              <div className="tf__dialog__tab__action-container__balance">
                <Typography variant="subtitle2" className="tf__dialog__tab__action-container__balance-title">
                  Balance
                </Typography>
                <div className="tf__dialog__tab__action-container__balance-value">
                  {balance && new Intl.NumberFormat().format(balance)}
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
                <CurrencyInput defaultValue={amount} onChange={onAmountChange} disabled={!selectedToken} />
              </div>
              <div className="tf__dialog__tab__action-container__token-amount-fiat">
                <div>{`~ ${new Intl.NumberFormat().format(amount * usdRate)} USD`}</div>
              </div>
            </div>
          </ActionContainerGrid>
        </ActionContainer>

        <ConnectingArrow />

        <ActionContainer label="To">
          <ActionContainerGrid>
            <div
              className="tf__dialog__tab__action-container-grid__centre-left tf__dialog__tab__action-container__deposit__tokens-returned"
              onClick={onSelectYield}
            >
              <div
                className={`tf__tokens-returned ${selectedYield === 'fixed' ? 'active' : ''}`}
                yield-attribute="fixed"
              >
                <div className="stuff-centre">
                  <div className="big-title">Fixed Yield</div>
                  <div className="small-title">
                    <span>(est.)</span>
                    <span style={{ fontWeight: 600 }}> {new Intl.NumberFormat().format(principalsAmount)}</span>{' '}
                    Principals
                  </div>
                  <div className="small-title">
                    Matures on {maturityDate && format(maturityDate?.getTime(), 'dd MMM yyyy')}
                  </div>
                </div>
                <div className="stuff-right">est. {NumberUtils.formatPercentage(fixedAPR, 2)}</div>
              </div>
            </div>

            <div
              className="tf__dialog__tab__action-container-grid__centre-right tf__dialog__tab__action-container__deposit__tokens-returned"
              onClick={onSelectYield}
            >
              <div
                className={`tf__tokens-returned ${selectedYield === 'variable' ? 'active' : ''}`}
                yield-attribute="variable"
              >
                <div className="stuff-centre">
                  <div className="big-title">Variable Yield</div>
                  <div className="small-title">
                    <span>(est.)</span>
                    <span style={{ fontWeight: 600 }}> {new Intl.NumberFormat().format(principalsAmount)}</span>{' '}
                    Principals
                  </div>
                  <div className="small-title">
                    <span>(est.)</span>
                    <span style={{ fontWeight: 600 }}> {new Intl.NumberFormat().format(lpTokensAmount)}</span> LP Token
                  </div>
                  <div className="small-title">
                    Matures on {maturityDate && format(maturityDate?.getTime(), 'dd MMM yyyy')}{' '}
                  </div>
                </div>
                <div className="stuff-right">est. {NumberUtils.formatPercentage(variableAPY, 2)}</div>
              </div>
            </div>
          </ActionContainerGrid>
        </ActionContainer>

        <Execute
          approveDisabled={approveDisabled}
          executeDisabled={executeDisabled}
          onApprove={onApprove}
          onExecute={onExecute}
        />
      </div>
    </div>
  );
};

export default DetailDeposit;
