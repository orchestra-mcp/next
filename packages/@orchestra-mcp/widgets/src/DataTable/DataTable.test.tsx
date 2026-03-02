import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from './DataTable';
import type { Column } from './DataTable';
import { saveFile } from '../utils/saveFile';

vi.mock('../utils/saveFile', () => ({
  saveFile: vi.fn(),
  uuidFilename: vi.fn(() => 'table-export-mock.csv'),
}));

const columns: Column[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'age', header: 'Age', align: 'right', sortable: true },
  { key: 'city', header: 'City', align: 'center' },
];

const rows = [
  ['Alice', '30', 'New York'],
  ['Bob', '25', 'London'],
  ['Charlie', '2', 'Paris'],
];

describe('DataTable', () => {
  it('renders table with headers and rows', () => {
    render(<DataTable columns={columns} rows={rows} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('sorts ascending on header click', () => {
    render(<DataTable columns={columns} rows={rows} sortable />);
    fireEvent.click(screen.getByText('Name'));
    const cells = screen.getAllByRole('cell');
    const nameCells = cells.filter((_, i) => i % 3 === 0);
    expect(nameCells[0]).toHaveTextContent('Alice');
    expect(nameCells[1]).toHaveTextContent('Bob');
    expect(nameCells[2]).toHaveTextContent('Charlie');
  });

  it('sorts descending on second header click', () => {
    render(<DataTable columns={columns} rows={rows} sortable />);
    fireEvent.click(screen.getByText('Name'));
    fireEvent.click(screen.getByText('Name'));
    const cells = screen.getAllByRole('cell');
    const nameCells = cells.filter((_, i) => i % 3 === 0);
    expect(nameCells[0]).toHaveTextContent('Charlie');
    expect(nameCells[1]).toHaveTextContent('Bob');
    expect(nameCells[2]).toHaveTextContent('Alice');
  });

  it('sorts numerically when values are numbers', () => {
    render(<DataTable columns={columns} rows={rows} sortable />);
    fireEvent.click(screen.getByText('Age'));
    const cells = screen.getAllByRole('cell');
    const ageCells = cells.filter((_, i) => i % 3 === 1);
    expect(ageCells[0]).toHaveTextContent('2');
    expect(ageCells[1]).toHaveTextContent('25');
    expect(ageCells[2]).toHaveTextContent('30');
  });

  it('generates correct CSV on export', async () => {
    const saveFileMock = vi.mocked(saveFile);
    saveFileMock.mockClear();

    render(<DataTable columns={columns} rows={rows} exportable />);
    fireEvent.click(screen.getByText('Export CSV'));

    // saveFile is async, wait for it
    await vi.waitFor(() => {
      expect(saveFileMock).toHaveBeenCalledTimes(1);
    });
    const csv = saveFileMock.mock.calls[0][0] as string;
    expect(csv).toContain('Name,Age,City');
    expect(csv).toContain('Alice,30,New York');
  });

  it('applies correct alignment CSS class', () => {
    const { container } = render(<DataTable columns={columns} rows={rows} />);
    const ths = container.querySelectorAll('th');
    expect(ths[0]).toHaveClass('data-table__th--left');
    expect(ths[1]).toHaveClass('data-table__th--right');
    expect(ths[2]).toHaveClass('data-table__th--center');

    const tds = container.querySelectorAll('td');
    expect(tds[0]).toHaveClass('data-table__td--left');
    expect(tds[1]).toHaveClass('data-table__td--right');
    expect(tds[2]).toHaveClass('data-table__td--center');
  });

  it('applies scrollable class when maxHeight set', () => {
    const { container } = render(
      <DataTable columns={columns} rows={rows} maxHeight={300} />
    );
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveClass('data-table-container--scrollable');
    // maxHeight style is on the inner .data-table__body element, not the container
    const body = container.querySelector('.data-table__body');
    expect(body).toHaveStyle({ maxHeight: '300px' });
  });

  it('hides export button when exportable is false', () => {
    render(<DataTable columns={columns} rows={rows} exportable={false} />);
    expect(screen.queryByText('Export CSV')).not.toBeInTheDocument();
  });

  it('shows Export Image button when exportImage is true', () => {
    render(<DataTable columns={columns} rows={rows} exportImage />);
    expect(screen.getByLabelText('Export as image')).toBeInTheDocument();
  });

  it('hides Export Image button by default', () => {
    render(<DataTable columns={columns} rows={rows} />);
    expect(screen.queryByLabelText('Export as image')).not.toBeInTheDocument();
  });
});
