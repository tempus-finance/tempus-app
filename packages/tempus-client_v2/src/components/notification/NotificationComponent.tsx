import { FC, MouseEvent, useCallback, useContext } from 'react';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import { LanguageContext } from '../../context/languageContext';
import getText from '../../localisation/getText';
import Typography from '../typography/Typography';
import TickIcon from '../icons/TickIcon';
import AlertIcon from '../icons/AlertIcon';
import { Notification } from '../../services/NotificationService';

import './Notification.scss';

type NotificationComponentInProps = Notification;

type NotificationComponentOutProps = {
  onNotificationDelete: (id: string) => void;
  openTransactions: () => void;
};

type NotificationComponentProps = NotificationComponentInProps & NotificationComponentOutProps;

const NotificationComponent: FC<NotificationComponentProps> = ({
  id,
  level,
  title,
  content,
  link,
  onNotificationDelete,
  openTransactions,
}) => {
  const { language } = useContext(LanguageContext);

  const onDelete = useCallback(() => onNotificationDelete(id), [id, onNotificationDelete]);

  const onClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      openTransactions();
    },
    [openTransactions],
  );

  return (
    <div className="tc__notification">
      <div className="tc__notification__header">
        <div className="tc__notification__title">
          {level === 'info' && <TickIcon fillColor="#4BB543" />}
          {level === 'warning' && <AlertIcon fillColor="#FF0F0F" />}
          <Typography variant="h5">{title}</Typography>
        </div>
        <Button title="Close" size="small" onClick={onDelete} disableRipple={true}>
          <CloseIcon />
        </Button>
      </div>

      <div className="tc__notification__content">
        <Typography variant="body-text">{content}</Typography>
        {link && (
          <div className="tc__notification__link">
            <a href={link} onClick={onClick}>
              <Typography variant="body-text" color="link">
                {getText('viewRecentTransactions', language)}
              </Typography>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationComponent;
