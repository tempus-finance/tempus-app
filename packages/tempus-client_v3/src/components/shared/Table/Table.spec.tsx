import { fireEvent, render } from '@testing-library/react';
import Table from './Table';
import TableBody from './TableBody';
import TableBodyCell from './TableBodyCell';
import TableHead from './TableHead';
import TableHeadCell from './TableHeadCell';
import TableRow from './TableRow';

const mockOnClickHandler = jest.fn();

const subject = () =>
  render(
    <Table>
      <TableHead>
        <TableRow id="header">
          <TableHeadCell label="Asset" align="right" />
          <TableHeadCell label="Protocol" />
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow id="first-pool" onClick={mockOnClickHandler}>
          <TableBodyCell align="center">ETH</TableBodyCell>
          <TableBodyCell>Lido</TableBodyCell>
        </TableRow>
      </TableBody>
    </Table>,
  );

describe('WalletButton', () => {
  it('Renders a table with two columns and one row', () => {
    const { container, getByText } = subject();

    const assetHeaderResult = getByText('Asset');
    const protocolHeaderResult = getByText('Protocol');
    const assetValueResult = getByText('ETH');
    const protocolValueResult = getByText('Lido');

    expect(assetHeaderResult).not.toBeNull();
    expect(protocolHeaderResult).not.toBeNull();
    expect(assetValueResult).not.toBeNull();
    expect(protocolValueResult).not.toBeNull();

    expect(container).toMatchSnapshot();
  });

  it('properly sets text alignment on body cells', () => {
    const { container } = subject();

    const results = container.querySelectorAll('td');

    expect(results.length).toBe(2);

    expect(results[0].dataset.align).toBe('center');
    expect(results[1].dataset.align).toBe('left');
  });

  it('properly sets text alignment on head cells', () => {
    const { container } = subject();

    const results = container.querySelectorAll('th');

    expect(results.length).toBe(2);

    expect(results[0].dataset.align).toBe('right');
    expect(results[1].dataset.align).toBe('left');
  });

  it('row onClick callback is called when user clicks on row', () => {
    const { container } = subject();

    const result = container.querySelector('#first-pool');

    expect(result).not.toBeNull();

    if (result) {
      fireEvent.click(result);
    }

    expect(mockOnClickHandler).toHaveBeenCalledTimes(1);
    expect(mockOnClickHandler).toHaveBeenCalledWith('first-pool');
  });
});
