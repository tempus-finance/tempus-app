import { FC } from 'react';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import './execute.scss';

type ExecuteInProps = {
  approveLabel?: string;
  approveDisabled?: boolean;
  executeLabel?: string;
  executeDisabled?: boolean;
};

type ExecuteOutProps = {
  onApprove: () => void;
  onExecute: () => void;
};

type ExecuteProps = ExecuteInProps & ExecuteOutProps;

const Execute: FC<ExecuteProps> = ({
  approveLabel,
  approveDisabled,
  executeLabel,
  executeDisabled,
  onApprove,
  onExecute,
}: ExecuteProps) => {
  return (
    <div className="tf__dialog__tab__execute">
      <Button variant="contained" color="secondary" size="large" disabled={approveDisabled} onClick={onApprove}>
        {approveLabel || 'Approve'}
      </Button>
      <Tooltip title={executeDisabled ? 'Execution disabled until approved' : 'Execute trade'}>
        <span>
          <Button
            variant="contained"
            color={executeDisabled ? 'secondary' : 'primary'}
            size="large"
            disabled={executeDisabled}
            onClick={onExecute}
          >
            {executeLabel || 'Execute'}
          </Button>
        </span>
      </Tooltip>
    </div>
  );
};

export default Execute;
