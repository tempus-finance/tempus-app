import { FC } from 'react';
import getText from '../../localisation/getText';
import SharedProps from '../../sharedProps';
import Typography from '../typography/Typography';
import './Term.scss';

type TermInProps = SharedProps;

const Term: FC<TermInProps> = ({ language }) => {
  return (
    <div className="tc__term">
      <Typography variant="h1">{getText('term', language)}</Typography>
      <div className="tc__term_body">
        <div className="tc__term_body__item">
          <Typography variant="h5">{getText('startDate', language)}</Typography>
          <Typography variant="h5">01 Apr 2021</Typography>
        </div>
        <div className="tc__term_body__item">
          <Typography variant="h5">{getText('maturity', language)}</Typography>
          <Typography variant="h5">01 Jan 2022</Typography>
        </div>
        <div className="tc__term_body__item">
          <Typography variant="h5">{getText('timeLeft', language)}</Typography>
          <Typography variant="h5">64 Days</Typography>
        </div>
      </div>
    </div>
  );
};

export default Term;
