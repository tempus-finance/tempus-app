import { FC, useCallback, useEffect, useState } from 'react';
import { TableTreeColumn } from '@devexpress/dx-react-grid-material-ui';
import Button from '@material-ui/core/Button';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import LaunchIcon from '@material-ui/icons/Launch';
import TokenIcon from '../../tokenIcon';

type TokenButtonInProps = {
  children: any[];
  tableRow: any;
  tableColumn: any;
  value: any;
  column: any;
  row: any;
  expandedRows: number[];
};

type TokenButtonOutProps = {
  actionHandler: (row: any) => void;
};

type TokenButtonProps = TokenButtonInProps & TokenButtonOutProps;

const TokenButton: FC<TokenButtonProps> = (props: TokenButtonProps) => {
  const { children, expandedRows, tableRow, row, actionHandler } = props;
  const { rowId } = tableRow;
  const [indentComponent, expandButton, _, contentComponent] = children;
  console.warn(_);

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
    <TableTreeColumn.Cell {...props} className={className}>
      {indentComponent.props.level === 0 && (
        <Button className="tf__dashboard__body__token-button" onClick={expandButton.props.onToggle}>
          <div className="tf__dashboard__asset-ticker">
            {isExpanded ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
            <TokenIcon ticker={contentComponent.props.children} />
            <span>{contentComponent.props.children}</span>
          </div>
        </Button>
      )}
      {indentComponent.props.level === 1 && (
        <div className="tf__dashboard__trade-button">
          <Button title="Manage" size="small" onClick={onClick}>
            <LaunchIcon />
          </Button>
        </div>
      )}
    </TableTreeColumn.Cell>
  );
};

export default TokenButton;
