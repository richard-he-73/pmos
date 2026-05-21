import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AlertCard } from '../components/common/AlertCard';

describe('AlertCard', () => {
  it('renders info alert correctly', () => {
    const { container } = render(
      <AlertCard message="今日有 3 个项目进入关键节点" level="info" />
    );
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
    expect(screen.getByText('今日有 3 个项目进入关键节点')).toBeInTheDocument();
    const alertRow = container.querySelector('.alert-row');
    expect(alertRow?.classList.contains('info')).toBe(true);
  });

  it('renders warn alert correctly', () => {
    const { container } = render(
      <AlertCard message="资源利用率超阈值" level="warn" />
    );
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    expect(screen.getByText('资源利用率超阈值')).toBeInTheDocument();
    const alertRow = container.querySelector('.alert-row');
    expect(alertRow?.classList.contains('warn')).toBe(true);
  });

  it('renders crit alert correctly', () => {
    const { container } = render(
      <AlertCard message="高风险预警" level="crit" />
    );
    expect(screen.getByText('🚨')).toBeInTheDocument();
    expect(screen.getByText('高风险预警')).toBeInTheDocument();
    const alertRow = container.querySelector('.alert-row');
    expect(alertRow?.classList.contains('crit')).toBe(true);
  });

  it('renders count when provided', () => {
    render(<AlertCard message="测试消息" count={5} level="info" />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not render count when not provided', () => {
    const { container } = render(
      <AlertCard message="测试消息" level="info" />
    );
    const countElement = container.querySelector('.alert-count');
    expect(countElement).not.toBeInTheDocument();
  });
});
