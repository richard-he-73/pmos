import { describe, it, expect } from 'vitest';

describe('Utils - constants', () => {
  it('has correct API prefix', async () => {
    const { API_PREFIX } = await import('../utils/constants');
    expect(API_PREFIX).toBe('/api/v1');
  });

  it('has project status translations', async () => {
    const { PROJECT_STATUS } = await import('../utils/constants');
    expect(PROJECT_STATUS.planning).toBe('规划中');
    expect(PROJECT_STATUS.active).toBe('进行中');
    expect(PROJECT_STATUS.completed).toBe('已完成');
    expect(PROJECT_STATUS.on_hold).toBe('已暂停');
    expect(PROJECT_STATUS.archived).toBe('已归档');
  });

  it('has task status translations', async () => {
    const { TASK_STATUS } = await import('../utils/constants');
    expect(TASK_STATUS.todo).toBe('待办');
    expect(TASK_STATUS.in_progress).toBe('进行中');
    expect(TASK_STATUS.done).toBe('已完成');
  });

  it('has priority translations', async () => {
    const { PRIORITY } = await import('../utils/constants');
    expect(PRIORITY.low).toBe('低');
    expect(PRIORITY.medium).toBe('中');
    expect(PRIORITY.high).toBe('高');
    expect(PRIORITY.critical).toBe('紧急');
  });

  it('has page size constant', async () => {
    const { PAGE_SIZE } = await import('../utils/constants');
    expect(PAGE_SIZE).toBe(20);
  });
});
