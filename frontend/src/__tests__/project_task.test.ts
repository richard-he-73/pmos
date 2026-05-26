import '@testing-library/jest-dom';

describe('Project Management Functions', () => {
  it('should filter projects by status', () => {
    const projects = [
      { id: '1', name: 'Project 1', status: 'active' },
      { id: '2', name: 'Project 2', status: 'planning' },
      { id: '3', name: 'Project 3', status: 'completed' },
      { id: '4', name: 'Project 4', status: 'active' },
    ];
    
    const activeProjects = projects.filter(p => p.status === 'active');
    const completedProjects = projects.filter(p => p.status === 'completed');
    
    expect(activeProjects.length).toBe(2);
    expect(completedProjects.length).toBe(1);
  });

  it('should validate project codes', () => {
    const validCodes = ['P001', 'PROJECT-123', 'CODE123'];
    const invalidCodes = ['', '   ', 'A!@#'];
    
    validCodes.forEach(code => {
      expect(isValidProjectCode(code)).toBe(true);
    });
    
    invalidCodes.forEach(code => {
      expect(isValidProjectCode(code)).toBe(false);
    });
  });

  it('should calculate project completion percentage', () => {
    const project = {
      totalTasks: 10,
      completedTasks: 6,
    };
    
    expect(calculateProjectProgress(project)).toBe(60);
    expect(calculateProjectProgress({ totalTasks: 0, completedTasks: 0 })).toBe(0);
    expect(calculateProjectProgress({ totalTasks: 5, completedTasks: 5 })).toBe(100);
  });
});

describe('Task Management Functions', () => {
  it('should filter tasks by priority', () => {
    const tasks = [
      { id: '1', title: 'Task 1', priority: 'low' },
      { id: '2', title: 'Task 2', priority: 'medium' },
      { id: '3', title: 'Task 3', priority: 'high' },
      { id: '4', title: 'Task 4', priority: 'critical' },
    ];
    
    const highPriority = tasks.filter(t => ['high', 'critical'].includes(t.priority));
    
    expect(highPriority.length).toBe(2);
  });

  it('should check if task is overdue', () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    const tomorrow = new Date(now.getTime() + 86400000);
    
    expect(isTaskOverdue(yesterday.toISOString())).toBe(true);
    expect(isTaskOverdue(tomorrow.toISOString())).toBe(false);
    expect(isTaskOverdue(null)).toBe(false);
  });

  it('should validate task priorities', () => {
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    const invalidPriorities = ['urgent', 'normal', 'unknown'];
    
    validPriorities.forEach(priority => {
      expect(isValidTaskPriority(priority)).toBe(true);
    });
    
    invalidPriorities.forEach(priority => {
      expect(isValidTaskPriority(priority)).toBe(false);
    });
  });
});

// Helper functions
function isValidProjectCode(code: string): boolean {
  const trimmed = code.trim();
  if (trimmed.length === 0) return false;
  // 更严格的验证：只允许字母、数字、破折号和下划线
  return /^[A-Za-z0-9_-]+$/.test(trimmed);
}

function calculateProjectProgress(project: { totalTasks: number; completedTasks: number }): number {
  if (project.totalTasks === 0) return 0;
  return Math.round((project.completedTasks / project.totalTasks) * 100);
}

function isTaskOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function isValidTaskPriority(priority: string): boolean {
  return ['low', 'medium', 'high', 'critical'].includes(priority);
}
