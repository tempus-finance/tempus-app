import { FC, memo, useCallback } from 'react';
import { DecimalUtils } from 'tempus-core-services';
import ButtonWrapper from '../ButtonWrapper';
import FormattedDate from '../FormattedDate';
import Typography from '../Typography';
import MaturityTerm from './MaturityTerm';

interface TermTabProps {
  term: MaturityTerm;
  selected: boolean;
  onClick: (selected: MaturityTerm) => void;
}

const TermTab: FC<TermTabProps> = props => {
  const { term, selected, onClick } = props;
  const handleClick = useCallback(() => onClick(term), [term, onClick]);

  return (
    <ButtonWrapper
      className={`tc__term-tabs__term ${selected ? 'tc__term-tabs__term-selected' : ''}`}
      onClick={handleClick}
    >
      <Typography variant="body-secondary" weight="medium" color="text-secondary">
        APR &amp; Term
      </Typography>
      <Typography variant="body-primary" type="mono" weight="bold">
        {DecimalUtils.formatPercentage(term.apr, 1)}
      </Typography>
      <FormattedDate date={term.date} textColor="text-secondary" size="small" separatorContrast="low" />
    </ButtonWrapper>
  );
};

export default memo(TermTab);
