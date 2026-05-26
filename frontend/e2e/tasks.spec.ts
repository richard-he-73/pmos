import { test, expect } from '@playwright/test';

test.describe('任务管理', () => {
  test('任务列表应该正常加载', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page.locator('h4')).toContainText('任务管理');
  });

  test('应该能切换视图', async ({ page }) => {
    await page.goto('/tasks');
    await page.getByText('看板视图').click();
    await expect(page.getByText('看板视图')).toBeVisible();
  });
});
