import { FC } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, CircularProgress } from '@material-ui/core';
import { PendingTransaction } from '../../interfaces/PendingTransaction';
import Typography from '../typography/Typography';
import ArrowDown from '../icons/ArrowDownIcon';

import './WalletPending.scss';

type WalletPendingInProps = PendingTransaction;

const WalletPending: FC<WalletPendingInProps> = ({ title, content, link, linkText }) => {
  return (
    <Accordion className="tc__pending">
      <AccordionSummary expandIcon={<ArrowDown />} aria-controls="panel1a-content" id="panel1a-header">
        <div className="tc__pending__header">
          <div className="tc__pending__title">
            <CircularProgress size={16} color="inherit" />
            <Typography variant="h5">{title}</Typography>
          </div>
        </div>
      </AccordionSummary>
      {content && (
        <AccordionDetails>
          <div className="tc__pending__content">
            <Typography variant="body-text">{content}</Typography>
            {link && (
              <div className="tc__pending__link">
                <a href={link} target="_blank" rel="noreferrer">
                  <Typography variant="body-text" color="link">
                    {linkText}
                  </Typography>
                </a>
              </div>
            )}
          </div>
        </AccordionDetails>
      )}
    </Accordion>
  );
};

export default WalletPending;
