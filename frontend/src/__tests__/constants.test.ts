import { describe, it, expect } from 'vitest';
import {
  API_PREFIX,
  PROJECT_STATUS,
  TASK_STATUS,
  PRIORITY,
  RISK_STATUS,
  RISK_CATEGORY,
  REQUIREMENT_STATUS,
  REQUIREMENT_TYPE,
  ITERATION_STATUS,
  CODE_REVIEW_STATUS,
  TEST_CASE_STATUS,
  DEFECT_STATUS,
  SEVERITY,
  PAGE_SIZE,
} from '../utils/constants';

describe('constants', () => {
  it('has correct API prefix', () => {
    expect(API_PREFIX).toBe('/api/v1');
  });

  it('has project status translations', () => {
    expect(PROJECT_STATUS.planning).toBe('规划中');
    expect(PROJECT_STATUS.active).toBe('进行中');
    expect(PROJECT_STATUS.completed).toBe('已完成');
  });

  it('has task status translations', () => {
    expect(TASK_STATUS.todo).toBe('待办');
    expect(TASK_STATUS.in_progress).toBe('进行中');
    expect(TASK_STATUS.done).toBe('已完成');
  });

  it('has priority translations', () => {
    expect(PRIORITY.low).toBe('低');
    expect(PRIORITY.medium).toBe('中');
    expect(PRIORITY.high).toBe('高');
    expect(PRIORITY.critical).toBe('紧急');
  });

  it('has risk status translations', () => {
    expect(RISK_STATUS.identified).toBe('已识别');
    expect(RISK_STATUS.mitigating).toBe('缓解中');
    expect(RISK_STATUS.closed).toBe('已关闭');
  });

  it('has risk category translations', () => {
    expect(RISK_CATEGORY.technical).toBe('技术风险');
    expect(RISK_CATEGORY.budget).toBe('预算风险');
  });

  it('has requirement status translations', () => {
    expect(REQUIREMENT_STATUS.draft).toBe('草稿');
    expect(REQUIREMENT_STATUS.approved).toBe('已批准');
  });

  it('has requirement type translations', () => {
    expect(REQUIREMENT_TYPE.functional).toBe('功能需求');
    expect(REQUIREMENT_TYPE.non_functional).toBe('非功能需求');
  });

  it('has iteration status translations', () => {
    expect(ITERATION_STATUS.planning).toBe('规划中');
    expect(ITERATION_STATUS.completed).toBe('已完成');
  });

  it('has code review status translations', () => {
    expect(CODE_REVIEW_STATUS.pending).toBe('待评审');
    expect(CODE_REVIEW_STATUS.approved).toBe('已通过');
  });

  it('has test case status translations', () => {
    expect(TEST_CASE_STATUS.draft).toBe('草稿');
    expect(TEST_CASE_STATUS.active).toBe('活跃');
  });

  it('has defect status translations', () => {
    expect(DEFECT_STATUS.new).toBe('新建');
    expect(DEFECT_STATUS.resolved).toBe('已解决');
  });

  it('has severity translations', () => {
    expect(SEVERITY.low).toBe('低');
    expect(SEVERITY.critical).toBe('严重');
  });

  it('has default page size', () => {
    expect(PAGE_SIZE).toBe(20);
  });
});
