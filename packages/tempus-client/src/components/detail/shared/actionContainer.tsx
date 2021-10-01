import { FC } from 'react';
import Typography from '../../typography/Typography';
import './actionContainer.scss';

type ActionContainerInProps = {
  label: string;
};

type ActionContainerProps = ActionContainerInProps;

const ActionContainer: FC<ActionContainerProps> = props => {
  return (
    <div className="tf__dialog__tab__action-container">
      <Typography variant="h4">{props.label}</Typography>
      <div className="tf__divider" />
      {props.children}
    </div>
  );
};

export default ActionContainer;
