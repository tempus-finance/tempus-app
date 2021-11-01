import { FC } from 'react';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '../typography/Typography';
import TickIcon from '../icons/TickIcon';
import AlertIcon from '../icons/AlertIcon';
import { Notification } from '../../services/NotificationService';

import './Notification.scss';

type NotificationComponentInProps = Notification;
type NotificationComponentOutProps = {
  onNotificationDelete: (id: string) => void;
};

type NotificationComponentProps = NotificationComponentInProps & NotificationComponentOutProps;

const NotificationComponent: FC<NotificationComponentProps> = ({
  id,
  level,
  title,
  content,
  link,
  linkText,
  onNotificationDelete,
}) => {
  const onDelete = () => onNotificationDelete(id);

  console.log('NotificationComponent', linkText);

  return (
    <div className="tf__notification">
      <div className="tf__notification__header">
        <div className="tf__notification__title">
          {level === 'info' && <TickIcon fillColor="#4BB543" />}
          {level === 'warning' && <AlertIcon fillColor="#FF0F0F" />}
          <Typography variant="h5">{title}</Typography>
        </div>
        <Button title="Close" size="small" onClick={onDelete} disableRipple={true}>
          <CloseIcon />
        </Button>
      </div>

      <div className="tf__notification__content">
        <Typography variant="body-text">{content}</Typography>
        {link && (
          <div className="tf__notification__link">
            <a href={link} target="_blank" rel="noreferrer">
              <Typography variant="body-text" color="link">
                {linkText}
              </Typography>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationComponent;
