import { FC, useCallback, useEffect, useState } from 'react';
import { MaturityTerm } from '../../../interfaces';
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
      if (terms.length > 1) {
        setSelectedTerm(value);
        onChange?.(value);
      }
    },
    [terms, onChange],
  );

  useEffect(() => {
    if (terms.length === 1) {
      setSelectedTerm(terms[0]);
      onChange?.(terms[0]);
    }
  }, [terms, onChange]);

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
