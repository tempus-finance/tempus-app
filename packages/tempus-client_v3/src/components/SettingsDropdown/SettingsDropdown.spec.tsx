import { fireEvent, render } from '@testing-library/react';
import SettingsDropdown from './SettingsDropdown';

const subject = () => render(<SettingsDropdown />);

describe('SettingsDropdown', () => {
  it('render the setting dropdown', () => {
    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('click to open the popup', () => {
    const { container, getByRole } = subject();

    const anchor = getByRole('button');

    expect(container).not.toBeNull();
    expect(anchor).not.toBeNull();

    fireEvent.click(anchor);

    const popup = container.querySelector('.tc__settings-popup');

    expect(popup).not.toBeNull();

    expect(popup).toMatchSnapshot();
  });
});
