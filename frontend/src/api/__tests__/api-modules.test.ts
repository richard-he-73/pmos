import { describe, it, expect, beforeEach } from 'vitest'

describe('API Auth Module', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('exports login function', async () => {
    const auth = await import('@/api/modules/auth')
    expect(typeof auth.login).toBe('function')
    expect(typeof auth.getCurrentUser).toBe('function')
  })

  it('exports interfaces', async () => {
    const auth = await import('@/api/modules/auth')
    // Just verify the module loads correctly
    expect(auth).toBeDefined()
  })
})

describe('API Statistics Module', () => {
  it('exports statistics functions', async () => {
    const stats = await import('@/api/modules/statistics')
    expect(typeof stats.getProjectOverview).toBe('function')
    expect(typeof stats.getProjectDetailStats).toBe('function')
    expect(typeof stats.getBugTrend).toBe('function')
    expect(typeof stats.getTimesheetSummary).toBe('function')
  })
})

describe('API Testing Module', () => {
  it('exports testing functions', async () => {
    const testing = await import('@/api/modules/testing')
    expect(typeof testing.getTestPlans).toBe('function')
    expect(typeof testing.getTestCases).toBe('function')
    expect(typeof testing.getTestDefects).toBe('function')
    expect(typeof testing.createTestDefect).toBe('function')
    expect(typeof testing.updateTestDefect).toBe('function')
  })
})

describe('API Requirements Module', () => {
  it('exports requirement functions', async () => {
    const req = await import('@/api/modules/requirements')
    expect(typeof req.getRequirements).toBe('function')
    expect(typeof req.createRequirement).toBe('function')
    expect(typeof req.getReqBaselines).toBe('function')
  })
})
