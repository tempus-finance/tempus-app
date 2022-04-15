import { fireEvent, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Tab from './Tab';
import Tabs, { TabsProps } from './Tabs';

const mockOnClick = jest.fn();

const defaultProps: TabsProps = {
  size: 'small',
  onTabSelected: mockOnClick,
};

const subjectButtons = (props: TabsProps & { selectedTab: string }) => {
  const { selectedTab, onTabSelected } = props;

  return render(
    <BrowserRouter>
      <Tabs {...props} value={selectedTab} onTabSelected={onTabSelected}>
        <Tab label="Item #1" value="item1" />
        <Tab label="Item #2" value="item2" />
        <Tab label="Item #3" value="item3" />
      </Tabs>
    </BrowserRouter>,
  );
};

const subjectLinks = (props: TabsProps & { selectedTab: string }) => {
  const { selectedTab, onTabSelected } = props;

  return render(
    <BrowserRouter>
      <Tabs {...props} value={selectedTab} onTabSelected={onTabSelected}>
        <Tab label="Item #1" href="/item1" />
        <Tab label="Item #2" href="/item2" />
        <Tab label="Item #3" href="/item3" />
      </Tabs>
    </BrowserRouter>,
  );
};

describe('Tabs', () => {
  it('renders a `Tabs` component that contains `Tab`s components', () => {
    const { container, getByRole } = subjectButtons({
      ...defaultProps,
      selectedTab: 'item1',
    });

    const actualTabs = container.querySelector('.tc__tabs');
    const firstButton = getByRole('button', { name: /Item #1/ });
    const secondButton = getByRole('button', { name: /Item #1/ });
    const thirdButton = getByRole('button', { name: /Item #1/ });

    expect(firstButton).not.toBeNull();
    expect(secondButton).not.toBeNull();
    expect(thirdButton).not.toBeNull();

    expect(actualTabs).not.toBeNull();
    expect(actualTabs).toMatchSnapshot();
  });

  it('calls `onChange` when a Tab is clicked upon', () => {
    const { getByRole } = subjectButtons({
      ...defaultProps,
      selectedTab: 'item1',
    });

    const firstButton = getByRole('button', { name: /Item #1/ });
    expect(firstButton).not.toBeNull();
    fireEvent.click(firstButton);
    expect(mockOnClick).toBeCalledWith('item1');

    const secondButton = getByRole('button', { name: /Item #2/ });
    expect(secondButton).not.toBeNull();
    fireEvent.click(secondButton);
    expect(mockOnClick).toBeCalledWith('item2');

    const thirdButton = getByRole('button', { name: /Item #3/ });
    expect(thirdButton).not.toBeNull();
    fireEvent.click(thirdButton);
    expect(mockOnClick).toBeCalledWith('item2');

    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });

  it('renders a Tabs component that contains `Tab`s components with links', () => {
    const { container, getByText } = subjectLinks({
      ...defaultProps,
      selectedTab: 'item2',
    });

    const actualTabs = container.querySelector('.tc__tabs');
    const firstTabText = getByText('Item #1').closest('a');
    const secondTabText = getByText('Item #2').closest('a');
    const thirdTabText = getByText('Item #3').closest('a');

    expect(firstTabText).not.toBeNull();
    expect(firstTabText).toHaveAttribute('href', '/item1');

    expect(secondTabText).not.toBeNull();
    expect(secondTabText).toHaveAttribute('href', '/item2');

    expect(thirdTabText).not.toBeNull();
    expect(thirdTabText).toHaveAttribute('href', '/item3');

    expect(actualTabs).not.toBeNull();
    expect(actualTabs).toMatchSnapshot();
  });
});
