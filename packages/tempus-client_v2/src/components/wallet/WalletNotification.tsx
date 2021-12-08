import { FC } from 'react';
import { Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import { Notification } from '../../interfaces/Notification';
import Typography from '../typography/Typography';
import ArrowDown from '../icons/ArrowDownIcon';
import TickIcon from '../icons/TickIcon';
import AlertIcon from '../icons/AlertIcon';

import '../notification/Notification.scss';
import './WalletNotification.scss';

type WalletNotificationInProps = Notification;

const WalletNotification: FC<WalletNotificationInProps> = ({ level, title, content, link, linkText }) => {
  return (
    <Accordion className="tc__notification">
      <AccordionSummary expandIcon={<ArrowDown />} aria-controls="panel1a-content" id="panel1a-header">
        <div className="tc__notification__header">
          <div className="tc__notification__title">
            {level === 'info' && <TickIcon fillColor="#4BB543" />}
            {level === 'warning' && <AlertIcon fillColor="#FF0F0F" />}
            <Typography variant="h5">{title}</Typography>
          </div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className="tc__notification__content">
          <Typography variant="body-text">{content}</Typography>
          {link && (
            <div className="tc__notification__link">
              <a href={link} target="_blank" rel="noreferrer">
                <Typography variant="body-text" color="link">
                  {linkText}
                </Typography>
              </a>
            </div>
          )}
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default WalletNotification;
