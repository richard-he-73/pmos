import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { KPICard } from '../components/common/KPICard';

describe('KPICard', () => {
  it('renders with correct label and value', () => {
    render(<KPICard label="测试标签" value={42} />);
    expect(screen.getByText('测试标签')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders string value correctly', () => {
    render(<KPICard label="百分比" value="87.3%" />);
    expect(screen.getByText('87.3%')).toBeInTheDocument();
  });

  it('renders trend text when provided', () => {
    render(<KPICard label="项目数" value={10} trend="增长中" />);
    const trendElement = screen.getByText(/增长中/);
    expect(trendElement).toBeInTheDocument();
  });

  it('applies accent variant class', () => {
    const { container } = render(<KPICard label="测试" value={1} variant="accent" />);
    const card = container.querySelector('.kpi-card');
    expect(card?.classList.contains('accent')).toBe(true);
  });

  it('applies success variant class', () => {
    const { container } = render(<KPICard label="测试" value={1} variant="success" />);
    const card = container.querySelector('.kpi-card');
    expect(card?.classList.contains('success')).toBe(true);
  });
});
