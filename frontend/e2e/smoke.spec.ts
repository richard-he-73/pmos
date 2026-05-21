import { test, expect } from '@playwright/test';

test('首页应该显示仪表板', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/PMOS/);
});

test('项目列表页面应该加载', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.locator('h4')).toContainText('项目管理');
});

test('任务列表页面应该加载', async ({ page }) => {
  await page.goto('/tasks');
  await expect(page.locator('h4')).toContainText('任务管理');
});

test('风险管理页面应该加载', async ({ page }) => {
  await page.goto('/risks');
  await expect(page.locator('h4')).toContainText('风险管理');
});

test('甘特图页面应该加载', async ({ page }) => {
  await page.goto('/gantt');
  await expect(page.locator('h4')).toContainText('甘特图');
});

test('导航栏应该包含所有菜单项', async ({ page }) => {
  await page.goto('/');
  const sidebar = page.locator('aside');
  await expect(sidebar.getByText('项目管理')).toBeVisible();
  await expect(sidebar.getByText('任务管理')).toBeVisible();
  await expect(sidebar.getByText('风险管理')).toBeVisible();
  await expect(sidebar.getByText('需求管理')).toBeVisible();
});
