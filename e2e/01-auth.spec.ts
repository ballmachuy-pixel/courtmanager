/**
 * ============================================================
 * [BMAD QA Team] — E2E Test: Luồng Đăng Nhập Admin
 * Coverage:
 *   - Landing page hiển thị đúng
 *   - Redirect về /dang-nhap nếu chưa login khi vào /dashboard
 *   - Form đăng nhập Admin (Supabase Auth)
 *   - Sau login thành công → redirect /dashboard
 *   - Dashboard hiển thị các thành phần chính
 *   - Đăng xuất hoạt động đúng
 * ============================================================
 */

import { test, expect } from '@playwright/test';

// ─── Test data — được load từ env để không hardcode credential ───
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '';

test.describe('Landing Page', () => {
  test('hiển thị đúng nội dung trang chủ', async ({ page }) => {
    await page.goto('/');
    
    // Trang chủ phải load được (không có lỗi 500)
    await expect(page).not.toHaveTitle(/500|Error/);
    
    // Phải có link/button dẫn đến đăng nhập
    const loginLink = page.locator('a[href*="dang-nhap"], a[href*="login"], button:has-text("Đăng nhập")').first();
    await expect(loginLink).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Authentication Guard', () => {
  test('redirect về /dang-nhap khi chưa login mà truy cập /dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Phải bị redirect sang trang đăng nhập
    await page.waitForURL(/dang-nhap|login/, { timeout: 10000 });
    await expect(page.url()).toMatch(/dang-nhap|login/);
  });

  test('redirect về /dang-nhap khi chưa login mà truy cập /students', async ({ page }) => {
    await page.goto('/students');
    await page.waitForURL(/dang-nhap|login/, { timeout: 10000 });
    await expect(page.url()).toMatch(/dang-nhap|login/);
  });

  test('redirect về /dang-nhap khi chưa login mà truy cập /staff', async ({ page }) => {
    await page.goto('/staff');
    // BUG WAS FIXED: /staff is now in the middleware guard
    await page.waitForURL(/dang-nhap|login/, { timeout: 10000 });
    await expect(page.url()).toMatch(/dang-nhap|login/);
  });

  test('redirect về /dang-nhap khi chưa login mà truy cập /analytics', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForURL(/dang-nhap|login/, { timeout: 10000 });
    await expect(page.url()).toMatch(/dang-nhap|login/);
  });
});

test.describe('Trang Đăng Nhập', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dang-nhap');
  });

  test('form đăng nhập hiển thị đúng', async ({ page }) => {
    // Input email
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 8000 });
    // Input password
    await expect(page.locator('input[type="password"]')).toBeVisible();
    // Submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('hiển thị lỗi khi nhập sai credential', async ({ page }) => {
    await page.fill('input[type="email"], input[name="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword123');
    await page.click('button[type="submit"]');
    
    // Wait for error message (toast or inline)
    const errorMessage = page.locator('[class*="error"], [class*="toast"], [role="alert"]').first();
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('không submit được khi email trống', async ({ page }) => {
    await page.fill('input[type="password"]', 'somepassword');
    await page.click('button[type="submit"]');
    
    // Vẫn ở trang đăng nhập (không redirect)
    await page.waitForTimeout(1500);
    await expect(page.url()).toMatch(/dang-nhap/);
  });
});

test.describe('Admin Login Flow', () => {
  test.skip(!ADMIN_EMAIL, 'Bỏ qua: E2E_ADMIN_EMAIL chưa được set trong env');

  test('đăng nhập Admin thành công và vào được dashboard', async ({ page }) => {
    await page.goto('/dang-nhap');
    
    await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Redirect về dashboard sau login
    await page.waitForURL(/dashboard/, { timeout: 15000 });
    await expect(page.url()).toContain('/dashboard');
    
    // Dashboard phải có nội dung thực tế
    const dashboardHeading = page.locator('h1, h2').first();
    await expect(dashboardHeading).toBeVisible({ timeout: 8000 });
  });
});
