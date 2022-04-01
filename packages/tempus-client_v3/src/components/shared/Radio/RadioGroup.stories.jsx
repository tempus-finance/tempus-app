import { useCallback, useState } from 'react';
import Radio, { RadioGroup } from './Radio';

export default {
  title: 'RadioGroup',
  component: RadioGroup,
  argTypes: {},
};

const style = {
  background: 'rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px',
};

export const RadioGroupWithLabels = () => {
  const [selectedValue, setSelectedValue] = useState('item1');
  const handleChange = useCallback(value => setSelectedValue(value), []);

  return (
    <div style={style}>
      <RadioGroup value={selectedValue} onChange={handleChange}>
        <Radio value="item1" label="Item #1" />
        <Radio value="item2" label="Item #2" />
        <Radio value="item3" label="Item #3" />
      </RadioGroup>
    </div>
  );
};
