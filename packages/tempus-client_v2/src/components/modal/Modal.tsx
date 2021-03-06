import { FC, memo, ReactNode, useContext } from 'react';
import { LocaleContext } from '../../context/localeContext';
import getText from '../../localisation/getText';
import Words from '../../localisation/words';
import CloseIcon from '../icons/CloseIcon';
import Typography from '../typography/Typography';

import './Modal.scss';

interface ModalProps {
  open: boolean;
  title: Words;
  onClose: () => void;
  children?: ReactNode
}

const Modal: FC<ModalProps> = ({ onClose, open, title, children }) => {
  const { locale } = useContext(LocaleContext);

  if (!open) {
    return null;
  }

  return (
    <div className="tc__modal-backdrop">
      <div className="tc__modal">
        <div className="tc__modal-header">
          {/* TODO - Update typography style once new fonts are merged into 2.0 branch */}
          <Typography variant="h4">{getText(title, locale)}</Typography>
          <div className="tc__modal-header-close" onClick={onClose}>
            <CloseIcon />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};
export default memo(Modal);
