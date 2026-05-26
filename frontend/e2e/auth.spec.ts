import { test, expect } from '@playwright/test';

test.describe('认证流程', () => {
  test('登录页面应该正常显示', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/PMOS/);
    await expect(page.locator('h2')).toContainText('登录');
  });

  test('登录表单应该有所有必填字段', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible());
  });
});
