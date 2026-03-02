import { render, screen, fireEvent } from '@testing-library/react';
import { Accordion } from './Accordion';
import type { AccordionItem } from './Accordion';

const items: AccordionItem[] = [
  { id: '1', title: 'First', content: 'Content one' },
  { id: '2', title: 'Second', content: 'Content two' },
  { id: '3', title: 'Third', content: 'Content three' },
];

describe('Accordion', () => {
  it('renders all item titles', () => {
    render(<Accordion items={items} />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('all items start collapsed by default', () => {
    render(<Accordion items={items} />);
    const regions = screen.getAllByRole('region', { hidden: true });
    regions.forEach((region) => {
      expect(region).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('click toggles content visibility', () => {
    render(<Accordion items={items} />);
    const header = screen.getByText('First');
    fireEvent.click(header);
    const regions = screen.getAllByRole('region');
    expect(regions[0]).toHaveAttribute('aria-hidden', 'false');
  });

  it('single mode closes other items when opening one', () => {
    render(<Accordion items={items} />);
    fireEvent.click(screen.getByText('First'));
    fireEvent.click(screen.getByText('Second'));
    const regions = screen.getAllByRole('region', { hidden: true });
    expect(regions[0]).toHaveAttribute('aria-hidden', 'true');
    expect(regions[1]).toHaveAttribute('aria-hidden', 'false');
  });

  it('multiple mode keeps other items open', () => {
    render(<Accordion items={items} multiple />);
    fireEvent.click(screen.getByText('First'));
    fireEvent.click(screen.getByText('Second'));
    const regions = screen.getAllByRole('region');
    expect(regions[0]).toHaveAttribute('aria-hidden', 'false');
    expect(regions[1]).toHaveAttribute('aria-hidden', 'false');
  });

  it('defaultOpen items start expanded', () => {
    render(<Accordion items={items} defaultOpen={['2']} />);
    const regions = screen.getAllByRole('region', { hidden: true });
    expect(regions[0]).toHaveAttribute('aria-hidden', 'true');
    expect(regions[1]).toHaveAttribute('aria-hidden', 'false');
  });

  it('disabled item cannot be toggled', () => {
    const withDisabled: AccordionItem[] = [
      { id: '1', title: 'Disabled', content: 'Hidden', disabled: true },
      { id: '2', title: 'Normal', content: 'Visible' },
    ];
    render(<Accordion items={withDisabled} />);
    const disabledBtn = screen.getByText('Disabled').closest('button')!;
    expect(disabledBtn).toBeDisabled();
    fireEvent.click(disabledBtn);
    const regions = screen.getAllByRole('region', { hidden: true });
    expect(regions[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('onChange fires with open IDs', () => {
    const onChange = vi.fn();
    render(<Accordion items={items} onChange={onChange} />);
    fireEvent.click(screen.getByText('First'));
    expect(onChange).toHaveBeenCalledWith(['1']);
  });

  it('onChange fires with empty array when closing last item', () => {
    const onChange = vi.fn();
    render(<Accordion items={items} onChange={onChange} />);
    fireEvent.click(screen.getByText('First'));
    fireEvent.click(screen.getByText('First'));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it('open item has accordion__item--open class', () => {
    const { container } = render(<Accordion items={items} />);
    fireEvent.click(screen.getByText('First'));
    const firstItem = container.querySelector('.accordion__item');
    expect(firstItem).toHaveClass('accordion__item--open');
  });

  it('disabled item has accordion__item--disabled class', () => {
    const withDisabled: AccordionItem[] = [
      { id: '1', title: 'Off', content: 'No', disabled: true },
    ];
    const { container } = render(<Accordion items={withDisabled} />);
    const item = container.querySelector('.accordion__item');
    expect(item).toHaveClass('accordion__item--disabled');
  });

  it('aria-expanded reflects open state', () => {
    render(<Accordion items={items} />);
    const header = screen.getByText('First').closest('button')!;
    expect(header).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });

  it('applies custom className to root', () => {
    const { container } = render(
      <Accordion items={items} className="custom" />,
    );
    expect(container.firstChild).toHaveClass('accordion', 'custom');
  });
});
