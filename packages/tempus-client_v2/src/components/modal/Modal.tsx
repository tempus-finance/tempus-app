import { FC, useContext } from 'react';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import Words from '../../localisation/words';
import CloseIcon from '../icons/CloseIcon';
import Typography from '../typography/Typography';

import './Modal.scss';

interface ModalProps {
  open: boolean;
  title: Words;
  onClose: () => void;
}

const Modal: FC<ModalProps> = ({ onClose, open, title, children }) => {
  const { language } = useContext(LanguageContext);

  if (!open) {
    return null;
  }

  return (
    <div className="tc__modal-backdrop">
      <div className="tc__modal">
        <div className="tc__modal-header">
          {/* TODO - Update typography style once new fonts are merged into 2.0 branch */}
          <Typography variant="h4">{getText(title, language)}</Typography>
          <div className="tc__modal-header-close" onClick={onClose}>
            <CloseIcon />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};
export default Modal;
