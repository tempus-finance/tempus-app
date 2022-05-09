import { fireEvent, render } from '@testing-library/react';
import SettingsPopup from './SettingsPopup';

const subject = () => render(<SettingsPopup />);

describe('SettingsPopup', () => {
  it('render the setting popup', () => {
    const { container } = subject();

    expect(container).not.toBeNull();
    expect(container).toMatchSnapshot();
  });

  it('open the slippage info popup', () => {
    const { container } = subject();

    const infoButton = container.querySelector('.tc__settings-popup-item > .tc__btn') as Element;

    expect(infoButton).not.toBeNull();
    expect(container).not.toBeNull();

    fireEvent.click(infoButton);

    expect(container).toMatchSnapshot();
  });

  it('toggle the dark mode', () => {
    const { container } = subject();

    const toggle = container.querySelector('.tc__toggle-switch input[type=checkbox]') as Element;

    expect(toggle).not.toBeNull();
    expect(container).not.toBeNull();

    fireEvent.click(toggle);

    expect(container).toMatchSnapshot();
  });
});
