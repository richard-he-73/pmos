import { test, expect } from '@playwright/test';

test.describe('项目管理', () => {
  test('项目列表应该显示正确', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('h4')).toContainText('项目管理');
    await expect(page.getByRole('button', { name: /新建项目/ })).toBeVisible();
  });

  test('应该能打开项目创建对话框', async ({ page }) => {
    await page.goto('/projects');
    await page.getByRole('button', { name: /新建项目/ }).click();
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
  });
});
