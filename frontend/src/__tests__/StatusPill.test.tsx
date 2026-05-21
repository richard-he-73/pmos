import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusPill } from '../components/common/StatusPill';

describe('StatusPill', () => {
  it('renders with correct label text', () => {
    render(<StatusPill label="运行中" />);
    expect(screen.getByText('运行中')).toBeInTheDocument();
  });

  it('renders with default variant class', () => {
    const { container } = render(<StatusPill label="正常" />);
    const pill = container.querySelector('.status-ok');
    expect(pill).toBeInTheDocument();
  });

  it('renders with warn variant class', () => {
    const { container } = render(<StatusPill label="警告" variant="warn" />);
    const pill = container.querySelector('.status-warn');
    expect(pill).toBeInTheDocument();
  });
});
