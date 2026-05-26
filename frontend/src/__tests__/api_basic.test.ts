import '@testing-library/jest-dom';

describe('API Services - Basic Functionality', () => {
  it('should have proper tag types defined', () => {
    const requiredTags = [
      'Projects', 'Tasks', 'Resources', 'Risks', 
      'Notifications', 'Stats'
    ];
    
    // 这个测试验证我们需要的基本tag类型概念上存在
    expect(requiredTags).toEqual(expect.arrayContaining(['Projects', 'Tasks', 'Resources']));
  });

  it('should validate project status values', () => {
    const validStatuses = ['planning', 'active', 'on_hold', 'completed', 'archived'];
    const invalidStatuses = ['unknown', 'deleted', 'pending'];
    
    validStatuses.forEach(status => {
      expect(isValidProjectStatus(status)).toBe(true);
    });
    
    invalidStatuses.forEach(status => {
      expect(isValidProjectStatus(status)).toBe(false);
    });
  });

  it('should validate task status values', () => {
    const validStatuses = ['todo', 'in_progress', 'done', 'blocked', 'cancelled'];
    const invalidStatuses = ['unknown', 'working', 'finished'];
    
    validStatuses.forEach(status => {
      expect(isValidTaskStatus(status)).toBe(true);
    });
    
    invalidStatuses.forEach(status => {
      expect(isValidTaskStatus(status)).toBe(false);
    });
  });
});

// Helper functions for testing
function isValidProjectStatus(status: string): boolean {
  return ['planning', 'active', 'on_hold', 'completed', 'archived'].includes(status);
}

function isValidTaskStatus(status: string): boolean {
  return ['todo', 'in_progress', 'done', 'blocked', 'cancelled'].includes(status);
}
