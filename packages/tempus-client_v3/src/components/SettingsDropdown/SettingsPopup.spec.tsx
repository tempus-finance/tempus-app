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
});
