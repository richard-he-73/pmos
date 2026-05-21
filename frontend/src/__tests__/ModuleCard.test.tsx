import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ModuleCard } from '../components/common/ModuleCard';
import { BrowserRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('ModuleCard', () => {
  const defaultProps = {
    name: '项目管理',
    icon: '🗂',
    stat: '48',
    statLabel: '个活跃项目',
    status: '正常',
    color: 'oklch(58% 0.16 145)',
    path: '/projects',
  };

  it('renders with correct name and icon', () => {
    renderWithRouter(<ModuleCard {...defaultProps} />);
    expect(screen.getByText('项目管理')).toBeInTheDocument();
    expect(screen.getByText('🗂')).toBeInTheDocument();
  });

  it('renders stat and stat label correctly', () => {
    renderWithRouter(<ModuleCard {...defaultProps} />);
    expect(screen.getByText('48')).toBeInTheDocument();
    expect(screen.getByText('个活跃项目')).toBeInTheDocument();
  });

  it('renders status pill with correct class', () => {
    const { container } = renderWithRouter(<ModuleCard {...defaultProps} />);
    expect(screen.getByText('正常')).toBeInTheDocument();
    const pill = container.querySelector('.status-ok');
    expect(pill).toBeInTheDocument();
  });

  it('renders warn status with correct class', () => {
    const { container } = renderWithRouter(
      <ModuleCard {...defaultProps} status="预警" />
    );
    const pill = container.querySelector('.status-warn');
    expect(pill).toBeInTheDocument();
  });

  it('renders alert status with correct class', () => {
    const { container } = renderWithRouter(
      <ModuleCard {...defaultProps} status="异常" />
    );
    const pill = container.querySelector('.status-alert');
    expect(pill).toBeInTheDocument();
  });

  it('has clickable link text', () => {
    renderWithRouter(<ModuleCard {...defaultProps} />);
    expect(screen.getByText('查看详情 →')).toBeInTheDocument();
  });
});
