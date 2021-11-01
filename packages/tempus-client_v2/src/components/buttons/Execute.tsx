import { FC, useCallback } from 'react';
import { Button } from '@material-ui/core';
import SharedProps from '../../sharedProps';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';
import './Execute.scss';

type ExecuteInProps = SharedProps;

const Execute: FC<ExecuteInProps> = ({ language }) => {
  const onExecute = useCallback(() => {}, []);

  return (
    <Button color="primary" variant="contained" onClick={onExecute} disabled={false} className="tc__execute-button">
      <Typography variant="h5" color="inverted">
        {getText('execute', language)}
      </Typography>
    </Button>
  );
};
export default Execute;
