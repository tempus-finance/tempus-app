import { FC } from 'react';
import ButtonWrapper from '../ButtonWrapper';
import Icon from '../Icon';
import Typography from '../Typography';

import './PoolsHeading.scss';

export interface PoolsHeadingProps {
  text: string;
  onBackButtonClick?: () => void;
}

const PoolsHeading: FC<PoolsHeadingProps> = (props): JSX.Element => {
  const { text, onBackButtonClick } = props;

  return (
    <div className="tc__poolsHeading">
      <div className="tc__poolsHeading-content">
        {onBackButtonClick && (
          <ButtonWrapper onClick={onBackButtonClick}>
            <Icon variant="left-chevron" size="small" />
          </ButtonWrapper>
        )}
        <Typography variant="title" weight="bold">
          {text}
        </Typography>
      </div>
      <div className="tc__poolsHeading-overlay" />
    </div>
  );
};
export default PoolsHeading;
