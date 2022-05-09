import { FC, useCallback, useState } from 'react';
import MaturityTerm from './MaturityTerm';
import TermTab from './TermTab';
import './TermTabs.scss';

export interface TermTabsProps {
  terms: MaturityTerm[];
  disabled?: boolean;
  onChange?: (selected: MaturityTerm) => void;
}

const TermTabs: FC<TermTabsProps> = props => {
  const { terms, disabled, onChange } = props;
  const [selectedTerm, setSelectedTerm] = useState<MaturityTerm>(terms[0]);
  const onClick = useCallback(
    (value: MaturityTerm) => {
      setSelectedTerm(value);
      onChange?.(value);
    },
    [onChange],
  );

  return (
    <div className="tc__term-tabs">
      {terms.map((term, index) => (
        <TermTab
          term={term}
          selected={selectedTerm === term}
          disabled={disabled}
          onClick={onClick}
          key={`term-tab-${index}-${term.date.getTime()}`}
        />
      ))}
    </div>
  );
};

export default TermTabs;
