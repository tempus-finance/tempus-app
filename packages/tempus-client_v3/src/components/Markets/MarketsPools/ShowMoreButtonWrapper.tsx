import { FC, useCallback } from 'react';
import { Chain } from 'tempus-core-services';
import { ActionButton } from '../../shared';

export interface ShowMoreButtonWrapperProps {
  chain: Chain;
  label: string;
  onClick: (chain: Chain) => void;
}

const ShowMoreButtonWrapper: FC<ShowMoreButtonWrapperProps> = props => {
  const { chain, label, onClick } = props;

  const handleOnClick = useCallback(() => {
    onClick(chain);
  }, [chain, onClick]);

  return (
    <ActionButton
      labels={{
        default: label,
        loading: '',
        success: '',
      }}
      onClick={handleOnClick}
      variant="secondary"
      size="large"
    />
  );
};
export default ShowMoreButtonWrapper;
