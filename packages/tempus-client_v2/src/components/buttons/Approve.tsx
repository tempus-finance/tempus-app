import { FC, useCallback } from 'react';
import { Button } from '@material-ui/core';
import SharedProps from '../../sharedProps';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';
import './Approve.scss';

type ApproveInProps = SharedProps;

const Approve: FC<ApproveInProps> = ({ language }) => {
  const onApprove = useCallback(() => {}, []);

  return (
    <Button color="primary" variant="contained" onClick={onApprove} disabled={false} className="tc__approve-button">
      <Typography variant="button-text" color="inverted">
        {getText('approve', language)}
      </Typography>
    </Button>
  );
};
export default Approve;
