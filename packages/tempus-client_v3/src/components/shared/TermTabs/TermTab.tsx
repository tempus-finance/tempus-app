import { FC, useCallback } from 'react';
import ButtonWrapper from '../ButtonWrapper';
import FormattedDate from '../FormattedDate';
import Typography from '../Typography';

interface TermTabProps {
  date: Date;
  selected: boolean;
  onClick: (selected: Date) => void;
}

const TermTab: FC<TermTabProps> = props => {
  const { date, selected, onClick } = props;
  const handleClick = useCallback(() => onClick(date), [date, onClick]);

  return (
    <ButtonWrapper
      className={`tc__term-tabs__term ${selected ? 'tc__term-tabs__term-selected' : ''}`}
      onClick={handleClick}
    >
      <Typography variant="body-secondary" weight="medium">
        Term
      </Typography>
      <Typography className="tc__term-tabs__term-date" variant="body-primary" type="mono">
        <FormattedDate date={date} size="medium" separatorContrast="high" />
      </Typography>
    </ButtonWrapper>
  );
};

export default TermTab;
