import { FC, useCallback, useContext, useEffect, useState } from 'react';
import { TableTreeColumn } from '@devexpress/dx-react-grid-material-ui';
import Button from '@material-ui/core/Button';
import { LanguageContext } from '../../../context/languageContext';
import getText from '../../../localisation/getText';
import Typography from '../../typography/Typography';
import Spacer from '../../spacer/spacer';
import TokenIcon from '../../tokenIcon';
import ArrowRight from '../../icons/ArrowRightIcon';
import ArrowDown from '../../icons/ArrowDownIcon';

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
  const { language } = useContext(LanguageContext);

  const { children, expandedRows, tableRow, row, isWalletConnected, actionHandler } = props;
  const { rowId } = tableRow;
  const [indentComponent, expandButton, , contentComponent] = children;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    setIsExpanded(expandedRows.includes(rowId));
  }, [rowId, expandedRows, setIsExpanded]);

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
        <Button className="tf__dashboard__body__token-button" onClick={expandButton.props.onToggle}>
          <div className="tf__dashboard__asset-ticker">
            <div className="tf__dashboard__parent-toggle-icon">{isExpanded ? <ArrowDown /> : <ArrowRight />}</div>
            <div className="tf__dashboard__parent-token-ticker">
              <Typography color="default" variant="body-text">
                {contentComponent.props.children}
              </Typography>
              <Spacer size={5} />
              <TokenIcon ticker={contentComponent.props.children} />
            </div>
          </div>
        </Button>
      )}
      {indentComponent.props.level === 1 && (
        <div className="tf__dashboard__trade-button">
          {isWalletConnected && (
            <Button title="Manage" size="small" onClick={onClick}>
              <Typography color="inverted" variant="h5">
                {getText('manage', language)}
              </Typography>
            </Button>
          )}
        </div>
      )}
    </TableTreeColumn.Cell>
  );
};

export default TokenButton;
