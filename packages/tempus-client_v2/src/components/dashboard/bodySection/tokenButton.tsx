import { Downgraded, useState as useHookState } from '@hookstate/core';
import { FC, useCallback, useContext } from 'react';
import { TableTreeColumn } from '@devexpress/dx-react-grid-material-ui';
import { prettifyChainName } from 'tempus-core-services';
import { dynamicPoolDataState, staticPoolDataState } from '../../../state/PoolDataState';
import { LocaleContext } from '../../../context/localeContext';
import getText from '../../../localisation/getText';
import Typography from '../../typography/Typography';
import Spacer from '../../spacer/spacer';
import TokenIcon from '../../tokenIcon';
import ArrowDown from '../../icons/ArrowDownIcon';
import Button from '../../common/Button';

type TokenButtonInProps = {
  children: any[];
  tableRow: any;
  tableColumn: any;
  value: any;
  column: any;
  row: any;
  expandedRows: number[];
  isWalletConnected: boolean;
};

type TokenButtonOutProps = {
  actionHandler: (row: any) => void;
};

type TokenButtonProps = TokenButtonInProps & TokenButtonOutProps;

const TokenButton: FC<TokenButtonProps> = (props: TokenButtonProps) => {
  const { locale } = useContext(LocaleContext);

  const { children, row, isWalletConnected, actionHandler } = props;
  const [indentComponent, , , contentComponent] = children;

  const isChild = Boolean(row.parentId);

  const staticPoolData = useHookState(staticPoolDataState);
  const dynamicPoolData = useHookState(dynamicPoolDataState);

  const className = `tf__dashboard__body__token ${
    indentComponent.props.level === 1 ? 'tf__dashboard__body__token-child' : ''
  }`;

  const onClick = useCallback(
    (evt: any) => {
      actionHandler(row);
      evt.stopPropagation();
    },
    [row, actionHandler],
  );

  let userHasBalanceInPool: boolean | null = null;
  let poolIsMature: boolean | null = null;
  let manageButtonDisabled: boolean | null = null;

  if (isChild) {
    const userPrincipalsBalance = dynamicPoolData[row.id].userPrincipalsBalance.attach(Downgraded).get();
    const userYieldsBalance = dynamicPoolData[row.id].userYieldsBalance.attach(Downgraded).get();
    const userLPTokenBalance = dynamicPoolData[row.id].userLPTokenBalance.attach(Downgraded).get();

    userHasBalanceInPool =
      (userPrincipalsBalance && !userPrincipalsBalance.isZero()) ||
      (userYieldsBalance && !userYieldsBalance.isZero()) ||
      (userLPTokenBalance && !userLPTokenBalance.isZero());

    const maturityDate = staticPoolData[row.id].maturityDate.attach(Downgraded).get();

    poolIsMature = maturityDate < Date.now();

    manageButtonDisabled = poolIsMature && !userHasBalanceInPool;
  }

  return (
    <TableTreeColumn.Cell
      value={props.value}
      row={props.row}
      column={props.column}
      tableRow={props.tableRow}
      tableColumn={props.tableColumn}
      className={className}
    >
      {indentComponent.props.level === 0 && (
        <div className="tf__dashboard__asset-ticker">
          <div className="tf__dashboard__parent-toggle-icon">
            <ArrowDown />
          </div>
          <div className="tf__dashboard__parent-asset-data">
            <div className="tf__dashboard__parent-asset-ticker">
              <TokenIcon ticker={contentComponent.props.children} />
              <Spacer size={5} />
              <Typography color="default" variant="body-text">
                {contentComponent.props.children}
              </Typography>
            </div>
            <Spacer size={6} />
            <div className="tf__dashboard__parent-asset-chain">
              <Typography variant="chain-badge">{prettifyChainName(row.chain)}</Typography>
            </div>
          </div>
        </div>
      )}
      {indentComponent.props.level === 1 && (
        <div className="tf__dashboard__trade-button">
          {isWalletConnected && (
            <Button title="Manage" onClick={onClick} disabled={Boolean(manageButtonDisabled)}>
              <Typography color="inverted" variant="h5">
                {/* If pool is not mature show 'Manage' label */}
                {!poolIsMature && getText('manage', locale)}

                {/* If pool is mature and user has balance in the pool show 'Withdraw' label - button is also enabled in this case */}
                {poolIsMature && userHasBalanceInPool && getText('withdraw', locale)}

                {/* If pool is mature and user does not have balance in the pool show 'Manage' label - button is disabled in this case */}
                {poolIsMature && !userHasBalanceInPool && getText('manage', locale)}
              </Typography>
            </Button>
          )}
        </div>
      )}
    </TableTreeColumn.Cell>
  );
};

export default TokenButton;
