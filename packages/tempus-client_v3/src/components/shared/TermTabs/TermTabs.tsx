import { FC, useCallback, useState } from 'react';
import ButtonWrapper from '../ButtonWrapper';
import FormattedDate from '../FormattedDate';
import Spacer from '../Spacer';
import Typography from '../Typography';
import './TermTabs.scss';

interface TermTabProps {
  date: Date;
  selected: boolean;
  onClick: (selected: Date) => void;
}

export interface TermTabsProps {
  dates: Date[];
  onChange?: (selected: Date) => void;
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
      <Spacer size={4} />
      <Typography variant="body-primary" type="mono">
        <FormattedDate date={date} size="medium" separatorContrast="high" />
      </Typography>
    </ButtonWrapper>
  );
};

const TermTabs: FC<TermTabsProps> = props => {
  const { dates, onChange } = props;
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const onClick = useCallback(
    (value: Date) => {
      setSelectedDate(value);
      onChange?.(selectedDate);
    },
    [selectedDate, onChange],
  );

  return (
    <div className="tc__term-tabs">
      {dates.map((termDate, index) => (
        <TermTab date={termDate} selected={selectedDate === termDate} onClick={onClick} key={`term-tab-${index}`} />
      ))}
    </div>
  );
};

export default TermTabs;
