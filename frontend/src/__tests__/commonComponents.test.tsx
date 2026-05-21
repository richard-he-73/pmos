import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatusPill } from '../components/common/StatusPill';
import { KPICard } from '../components/common/KPICard';
import { AlertCard } from '../components/common/AlertCard';
import { BrowserRouter } from 'react-router-dom';
import { ModuleCard } from '../components/common/ModuleCard';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Common Components Integration', () => {
  it('renders KPICard and StatusPill together', () => {
    render(
      <div>
        <KPICard label="项目总数" value={10} trend="增长中" />
        <StatusPill label="进行中" />
      </div>
    );
    expect(screen.getByText('项目总数')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('进行中')).toBeInTheDocument();
  });

  it('renders ModuleCard with router context', () => {
    renderWithRouter(
      <ModuleCard
        name="项目管理"
        icon="🗂"
        stat="48"
        statLabel="个活跃项目"
        status="正常"
        color="oklch(58% 0.16 145)"
        path="/projects"
      />
    );
    expect(screen.getByText('项目管理')).toBeInTheDocument();
    expect(screen.getByText('48')).toBeInTheDocument();
    expect(screen.getByText('查看详情 →')).toBeInTheDocument();
  });

  it('renders AlertCard with different levels', () => {
    const { container: infoContainer } = render(
      <AlertCard message="信息提示" level="info" />
    );
    expect(infoContainer.querySelector('.info')).toBeInTheDocument();

    const { container: warnContainer } = render(
      <AlertCard message="警告提示" level="warn" />
    );
    expect(warnContainer.querySelector('.warn')).toBeInTheDocument();

    const { container: critContainer } = render(
      <AlertCard message="严重提示" level="crit" />
    );
    expect(critContainer.querySelector('.crit')).toBeInTheDocument();
  });
});
