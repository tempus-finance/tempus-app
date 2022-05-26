import { FC, useCallback } from 'react';
import { Chain } from 'tempus-core-services';
import { ActionButton } from '../../shared';

interface ShowMoreButtonProps {
  chain: Chain;
  label: string;
  onClick: (chain: Chain) => void;
}

const ShowMoreButtonWrapper: FC<ShowMoreButtonProps> = props => {
  const { chain, label, onClick } = props;

  const handleOnClick = useCallback(() => {
    onClick(chain);
  }, [chain, onClick]);

  return (
    <div onClick={handleOnClick}>
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
    </div>
  );
};
export default ShowMoreButtonWrapper;
