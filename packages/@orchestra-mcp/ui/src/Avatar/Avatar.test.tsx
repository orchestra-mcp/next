import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('renders image when src is provided', () => {
    render(<Avatar src="https://example.com/photo.jpg" alt="User" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(img).toHaveAttribute('alt', 'User');
  });

  it('shows initials when no src but name is provided', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('derives correct initials from two-word name', () => {
    render(<Avatar name="Alice Smith" />);
    expect(screen.getByText('AS')).toBeInTheDocument();
  });

  it('shows single initial for single-word name', () => {
    render(<Avatar name="Zara" />);
    expect(screen.getByText('Z')).toBeInTheDocument();
  });

  it('handles names with extra whitespace', () => {
    render(<Avatar name="  Bob   Lee  " />);
    expect(screen.getByText('BL')).toBeInTheDocument();
  });

  it('applies small size class', () => {
    const { container } = render(<Avatar name="AB" size="small" />);
    expect(container.firstChild).toHaveClass('avatar--small');
  });

  it('applies medium size class by default', () => {
    const { container } = render(<Avatar name="AB" />);
    expect(container.firstChild).toHaveClass('avatar--medium');
  });

  it('applies large size class', () => {
    const { container } = render(<Avatar name="AB" size="large" />);
    expect(container.firstChild).toHaveClass('avatar--large');
  });

  it('renders status indicator when status is provided', () => {
    render(<Avatar name="Test" status="online" />);
    const dot = screen.getByTestId('avatar-status');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass('avatar__status--online');
  });

  it('renders each status type correctly', () => {
    const statuses = ['online', 'offline', 'busy', 'away'] as const;
    statuses.forEach((status) => {
      const { unmount } = render(<Avatar name="T" status={status} />);
      const dot = screen.getByTestId('avatar-status');
      expect(dot).toHaveClass(`avatar__status--${status}`);
      unmount();
    });
  });

  it('does not render status indicator when status is omitted', () => {
    render(<Avatar name="Test" />);
    expect(screen.queryByTestId('avatar-status')).not.toBeInTheDocument();
  });

  it('fires onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Avatar name="Click" onClick={handleClick} />);
    const avatar = screen.getByRole('button');
    fireEvent.click(avatar);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('sets role=button and tabIndex when clickable', () => {
    const handleClick = vi.fn();
    render(<Avatar name="Click" onClick={handleClick} />);
    const avatar = screen.getByRole('button');
    expect(avatar).toHaveAttribute('tabindex', '0');
  });

  it('does not set role=button when not clickable', () => {
    const { container } = render(<Avatar name="NoClick" />);
    expect(container.querySelector('[role="button"]')).toBeNull();
  });

  it('renders empty span when no src or name provided', () => {
    const { container } = render(<Avatar />);
    const initials = container.querySelector('.avatar__initials');
    expect(initials).toBeInTheDocument();
    expect(initials).toHaveTextContent('');
  });

  it('prefers image over initials when both src and name are set', () => {
    render(<Avatar src="https://example.com/photo.jpg" name="John Doe" alt="JD" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.queryByText('JD')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Avatar name="Test" className="my-custom" />);
    expect(container.firstChild).toHaveClass('my-custom');
  });
});
