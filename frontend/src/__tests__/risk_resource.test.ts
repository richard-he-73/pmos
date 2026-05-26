import '@testing-library/jest-dom';

describe('Risk Management', () => {
  it('should calculate risk levels correctly', () => {
    expect(calculateRiskLevel('low', 'low')).toBe('Low');
    expect(calculateRiskLevel('low', 'high')).toBe('Medium');
    expect(calculateRiskLevel('medium', 'medium')).toBe('High');
    expect(calculateRiskLevel('high', 'high')).toBe('Critical');
  });

  it('should sort risks by priority', () => {
    const lowRisk = { title: 'Low Risk', level: 'Low' };
    const criticalRisk = { title: 'Critical Risk', level: 'Critical' };
    const highRisk = { title: 'High Risk', level: 'High' };
    const mediumRisk = { title: 'Medium Risk', level: 'Medium' };
    
    const sorted = sortRisks([lowRisk, criticalRisk, highRisk, mediumRisk]);
    
    const sortedLevels = sorted.map(r => r.level);
    expect(sortedLevels).toEqual(['Critical', 'High', 'Medium', 'Low']);
  });

  it('should validate risk statuses', () => {
    const validStatuses = ['open', 'closed', 'mitigated'];
    const invalidStatuses = ['unknown', 'deleted'];
    
    validStatuses.forEach(status => {
      expect(isValidRiskStatus(status)).toBe(true);
    });
    
    invalidStatuses.forEach(status => {
      expect(isValidRiskStatus(status)).toBe(false);
    });
  });
});

describe('Resource Management', () => {
  it('should filter resources by type', () => {
    const resources = [
      { id: '1', name: 'Resource 1', type: 'human' },
      { id: '2', name: 'Resource 2', type: 'material' },
      { id: '3', name: 'Resource 3', type: 'human' },
      { id: '4', name: 'Resource 4', type: 'equipment' },
    ];
    
    const humanResources = resources.filter(r => r.type === 'human');
    
    expect(humanResources.length).toBe(2);
  });

  it('should validate resource types', () => {
    const validTypes = ['human', 'material', 'equipment'];
    const invalidTypes = ['animal', 'unknown', 'virtual'];
    
    validTypes.forEach(type => {
      expect(isValidResourceType(type)).toBe(true);
    });
    
    invalidTypes.forEach(type => {
      expect(isValidResourceType(type)).toBe(false);
    });
  });

  it('should check resource availability', () => {
    const availableResource = { status: 'available' };
    const unavailableResource = { status: 'unavailable' };
    const assignedResource = { status: 'assigned' };
    
    expect(isResourceAvailable(availableResource)).toBe(true);
    expect(isResourceAvailable(unavailableResource)).toBe(false);
    expect(isResourceAvailable(assignedResource)).toBe(false);
  });
});

// Helper functions
function calculateRiskLevel(likelihood: string, impact: string): string {
  const matrix: Record<string, Record<string, string>> = {
    low: { low: 'Low', medium: 'Medium', high: 'Medium' },
    medium: { low: 'Medium', medium: 'High', high: 'High' },
    high: { low: 'Medium', medium: 'High', high: 'Critical' },
  };
  
  const level = matrix[likelihood as keyof typeof matrix];
  return level ? level[impact as keyof typeof level] : 'Low';
}

function sortRisks(risks: Array<{ title: string; level: string }>): Array<any> {
  const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  
  return [...risks].sort((a, b) => {
    const aOrder = order[a.level as keyof typeof order] ?? 99;
    const bOrder = order[b.level as keyof typeof order] ?? 99;
    return aOrder - bOrder;
  });
}

function isValidRiskStatus(status: string): boolean {
  return ['open', 'closed', 'mitigated'].includes(status);
}

function isValidResourceType(type: string): boolean {
  return ['human', 'material', 'equipment'].includes(type);
}

function isResourceAvailable(resource: { status: string }): boolean {
  return resource.status === 'available';
}
