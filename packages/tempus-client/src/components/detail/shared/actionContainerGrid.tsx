import { FC } from 'react';
import './actionContainerGrid.scss';

type ActionContainerGridInProps = {
  className?: string;
  children?: any;
};

type ActionContainerGridProps = ActionContainerGridInProps;

const ActionContainerGrid: FC<ActionContainerGridProps> = (props: ActionContainerGridProps) => {
  const className = `tf__dialog__tab__action-container-grid ${props.className ? props.className : ''}`;
  return <div className={className}>{props.children}</div>;
};

export default ActionContainerGrid;
