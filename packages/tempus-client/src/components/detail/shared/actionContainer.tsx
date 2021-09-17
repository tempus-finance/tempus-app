import { FC } from 'react';
import './actionContainer.scss';

type ActionContainerInProps = {
  label: string;
  children?: any;
};

type ActionContainerProps = ActionContainerInProps;

const ActionContainer: FC<ActionContainerProps> = (props: ActionContainerProps) => {
  return (
    <div className="tf__dialog__tab__action-container">
      <div className="tf__dialog__tab__action-container__label">{props.label}</div>
      {props.children}
    </div>
  );
};

export default ActionContainer;
