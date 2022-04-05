import { FC, useCallback, useState } from 'react';
import TermTab from './TermTab';
import './TermTabs.scss';

export interface TermTabsProps {
  dates: Date[];
  onChange?: (selected: Date) => void;
}

const TermTabs: FC<TermTabsProps> = props => {
  const { dates, onChange } = props;
  const [selectedDate, setSelectedDate] = useState<Date>(dates[0]);
  const onClick = useCallback(
    (value: Date) => {
      setSelectedDate(value);
      onChange?.(value);
    },
    [onChange],
  );

  return (
    <div className="tc__term-tabs">
      {dates.map((termDate, index) => (
        <TermTab
          date={termDate}
          selected={selectedDate === termDate}
          onClick={onClick}
          key={`term-tab-${index}-${termDate.getTime()}`}
        />
      ))}
    </div>
  );
};

export default TermTabs;
